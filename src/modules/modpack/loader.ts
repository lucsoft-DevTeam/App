import {
    accessSync, copyFileSync, createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync
} from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as system from 'os';
import path from 'path';

const app = require('electron').remote.app;

export class MCLoader
{
    private path = `${app.getAppPath()}/minecraftInstances`;
    private pathMeta = `${app.getAppPath()}/minecraftMeta`;

    async createInstance(targetVersion: string, targetID: string, forge?: string)
    {
        // versionsManifest
        const versions: launcherMeta = await (await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json')).json();
        //GET_MC_VANILLA_VERSIONS

        const promos = await (await fetch('https://addons-ecs.forgesvc.net/api/v2/minecraft/modloader')).json();
        const forgeVersions = {};
        //GET_FORGE_MANIFEST

        versions.versions.forEach(v =>
        {
            forgeVersions[ v.id ] = promos;
        });
        mkdirSync(this.path, { recursive: true });
        mkdirSync(this.pathMeta, { recursive: true });

        this.downloadVersion(versions.versions, targetVersion, targetID, forge);
    }

    private async downloadVersion(version: launcherMetaVersions[], targetVersion: string, targetID: string, forge?: string)
    {
        const versionURL = version.find((v) => v.id == targetVersion).url;
        const vanillaResponse: versionData = await (await fetch(versionURL)).json();
        mkdirSync(`${this.path}/versions/${targetVersion}`, { recursive: true });
        writeFileSync(`${this.path}/versions/${targetVersion}/${targetVersion}.json`, JSON.stringify(vanillaResponse));
        let forgeResponse = null;
        const assets = await this.getAssets(vanillaResponse, targetID);
        const mainJar = this.getMainJar(vanillaResponse);

        if (forge)
        {
            try
            {
                forgeResponse = await this.getForgeMeta(forge);
                await this.checkForge(forgeResponse.mavenVersionString);
            } catch (error)
            {
                forgeResponse = await (await fetch(`https://addons-ecs.forgesvc.net/api/v2/minecraft/modloader/forge-${forge}`)).json();
                console.warn(forgeResponse.mavenVersionString);
                const forgeBinPath = `${this.path}/libraries/net/minecraftforge/forge/${targetVersion}-${forge}/`;
                mkdirSync(forgeBinPath, { recursive: true });
                console.log(forgeBinPath);
                await this.downloadFile(`${forgeBinPath}/forge-${targetVersion}-${forge}.jar`, forgeResponse.downloadUrl);
                mkdirSync(`${this.pathMeta}/net/minecraftforge/forge/${targetVersion}-${forge}`, { recursive: true });
                writeFileSync(`${this.pathMeta}/net/minecraftforge/forge/${targetVersion}-${forge}/forge-${targetVersion}-${forge}.json`, JSON.stringify(forgeResponse), {})
            }
        }

        const libraries = await this.getAllLibs(vanillaResponse, forgeResponse, false);

        mkdirSync(`${this.path}/packs/${targetID}/`, { recursive: true });
        const legacyJavaFixer = this.versionCompare(forge, '10.13.1.1217') === -1 ? { url: "https://gdevs.io/legacyjavafixer-1.0.jar", path: `${this.path}/packs/${targetID}/mods/LJF.jar` } : null;

        const installProfileJson =
            forgeResponse && JSON.parse(forgeResponse.installProfileJson);

        const allFiles =
            legacyJavaFixer !== null
                ? [ ...libraries, ...assets, ...mainJar, legacyJavaFixer ]
                : [ ...libraries, ...assets, ...mainJar ];

        for (const iterator of allFiles)
        {
            mkdirSync(iterator.path.substring(0, iterator.path.lastIndexOf('/')), { recursive: true });
            this.downloadFile(iterator.path, iterator.url);
        }


        if (vanillaResponse.assets === 'legacy')
            this.copyAssetsToLegacy(assets);
        else if (vanillaResponse.assets === 'pre-1.6')
            this.copyAssetsToResources(assets);

        // await extractNatives(libraries.filter(lib => 'natives' in lib), targetID);

    }
    async conextractNatives(libs, targetID)
    {
        const nativesPath = `${this.path}/packs/${targetID}/natvies/`;

        mkdirSync(nativesPath, { recursive: true });
        // for (const iterator of object)
        // {
        //     await extract(iterator.path, { dir: nativesPath })
        // }

    };
    async copyAssetsToLegacy(assets: { url: string; path: string; legacyPath: string; resourcesPath: string; }[])
    {
        assets.map(asset =>
        {
            try
            {
                accessSync(asset.legacyPath);
            } catch {
                mkdirSync(path.dirname(asset.legacyPath));
                copyFileSync(asset.path, asset.legacyPath);
            }
        });
    };
    async copyAssetsToResources(assets: { url: string; path: string; legacyPath: string; resourcesPath: string; }[])
    {
        assets.map(asset =>
        {
            try
            {
                accessSync(asset.resourcesPath);
            } catch {
                mkdirSync(path.dirname(asset.resourcesPath));
                copyFileSync(asset.path, asset.resourcesPath);
            }
        });
    };

    private async getAllLibs(vnlRsp: versionData, frgRsp: any, skipInstall = true)
    {
        return [
            ...(await this.extractVanillaLibs(vnlRsp)),
            ...(await this.getForgeLibraries(frgRsp, skipInstall))
        ]
    }
    private async getForgeLibraries(forge, skipInstall = true)
    {
        const forgeLibCalculator = async library =>
        {
            let completeUrl;
            // Check if it's >= 1.13
            if (typeof library.downloads !== "undefined")
                completeUrl = library.downloads.artifact.url;
            else
            {
                if (typeof library.url !== "undefined")
                    completeUrl = `https://modloaders.cursecdn.com/647622546/maven/${this.arraify(library.name).join('/')}`;
                else
                    completeUrl = `https://libraries.minecraft.net/${this.arraify(library.name).join('/')}`;
            }

            const partialPath = typeof library.downloads !== "undefined" && typeof library.downloads.artifact !== "undefined" ? library.downloads.artifact.path : this.arraify(library.name).join('/');

            return {
                url: completeUrl,
                path: `${this.path}/libraries/${partialPath}`
            };
        };

        const computeLibraries = libraries => Promise.all(
            libraries
                .filter(lib => !this.parseLibRules(lib.rules))
                .filter(lib => !lib.natives)
                .map(async lib => forgeLibCalculator(lib))
        )

        let libraries = [];
        libraries = await computeLibraries(JSON.parse(forge.versionJson).libraries);
        if (forge.installProfileJson !== null && !skipInstall)
        {
            // Handle >= 1.13
            const installForgeJson = (await computeLibraries(JSON.parse(forge.installProfileJson).libraries)).filter((lib: any) => lib.url !== "");
            libraries = libraries.concat(installForgeJson);
        }
        return libraries;
    };

    private arraify(s: string)
    {
        const pathSplit = s.split(':');
        const fileName = pathSplit[ 3 ] ? `${pathSplit[ 2 ]}-${pathSplit[ 3 ]}` : pathSplit[ 2 ];
        const finalFileName = fileName.includes('@') ? fileName.replace('@', '.') : `${fileName}.jar`;
        const initPath = pathSplit[ 0 ]
            .split('.')
            .concat(pathSplit[ 1 ])
            .concat(pathSplit[ 2 ].split('@')[ 0 ])
            .concat(`${pathSplit[ 1 ]}-${finalFileName}`);
        return initPath;
    };

    private async extractVanillaLibs(json: versionData)
    {
        const libs = [];
        const MC_OS_Lookup = {
            // Mojang gave osx different names in parts of different versions..
            Darwin: [ 'osx', 'macos' ],
            Windows_NT: [ 'windows', 'windows-64' ],
            Linux: [ 'linux' ]
        };
        await Promise.all(
            json.libraries
                .filter(lib => !this.parseLibRules(lib.rules))
                .map(async lib =>
                {
                    if ('artifact' in lib.downloads)
                    {
                        libs.push({
                            url: lib.downloads.artifact.url,
                            path: `${this.path}/libraries/${lib.downloads.artifact.path}`
                        });
                    }
                    if ('classifiers' in lib.downloads)
                    {
                        MC_OS_Lookup[ system.type() ].forEach((os_type: string) =>
                        {
                            if (`natives-${os_type}` in lib.downloads.classifiers)
                            {
                                libs.push({
                                    url: lib.downloads.classifiers[ `natives-${os_type}` ].url,
                                    path: `${this.path}/libraries/${lib.downloads.classifiers[ `natives-${os_type}` ].path}`,
                                    natives: true
                                });
                            }
                        });
                    }
                })
        );
        return libs;
    };

    private parseLibRules(rules: { action: "allow" | "disallow"; os?: { name: string; }; }[])
    {
        let skip = false;
        if (rules)
        {
            skip = true;
            rules.forEach(({ action, os }) =>
            {
                if (action === 'allow' && ((os && os.name === this.convertOSToMCFormat(system.type())) || !os))
                    skip = false;
                if (action === 'disallow' && ((os && os.name === this.convertOSToMCFormat(system.type())) || !os))
                    skip = true;
            });
        }
        return skip;
    }

    private convertOSToMCFormat(ElectronFormat: string)
    {
        switch (ElectronFormat)
        {
            case 'Windows_NT':
                return 'windows';
            case 'Darwin':
                return 'osx';
            case 'Linux':
                return 'linux';
            default:
                return false;
        }
    }

    private versionCompare(left: string, right: string)
    {
        if (typeof left + typeof right != 'stringstring') return false;
        const lft = left.split('.');
        const rht = right.split('.');
        const len = Math.max(lft.length, rht.length);
        for (let i = -1; i < len; i++)
        {
            if (
                (lft[ i ] && !rht[ i ] && parseInt(lft[ i ]) > 0) ||
                parseInt(lft[ i ]) > parseInt(rht[ i ])
            ) return 1;
            if (
                (rht[ i ] && !lft[ i ] && parseInt(rht[ i ]) > 0) ||
                parseInt(lft[ i ]) < parseInt(rht[ i ])
            ) return -1;
        }
        return 0;
    };
    private async downloadFile(path: string, url: string)
    {
        try
        {

            const file = createWriteStream(path);
            if (url.toLowerCase().startsWith('https://'))
                https.get(url, (response) => response.pipe(file));
            else if (url.toLowerCase().startsWith('http://'))
                http.get(url, (response) => response.pipe(file));
            else
                console.log(url, path);

        } catch (error)
        {
            console.log(path, error);
        }
    }
    private async checkForge(path: string)
    {
        return accessSync(`${this.path}/libraries/${this.arraify(path).join('/')}`)
    }

    private async getForgeMeta(forgeVersion)
    {
        return readFileSync(`${this.pathMeta}/net/minecraftforge/forge-${forgeVersion}/forge-${forgeVersion}.json`, "utf8")
    }

    private getMainJar(response: versionData)
    {
        return [ {
            url: response.downloads.client.url,
            path: `${this.path}/versions/${response.id}/${response.id}.jar`
        } ];
    }

    private async getAssets(response: versionData, targetID: string)
    {
        let res: { objects: { [ path: string ]: { hash: string, size: number } } };
        const assets: { url: string; path: string; legacyPath: string; resourcesPath: string; }[] = [];
        const assetsFile = `${this.path}/assets/indexes/${response.assets}.json`
        if (existsSync(`${this.path}/assets/`) && existsSync(`${this.path}/assets/indexes/`) && existsSync(assetsFile))
        {
            res = JSON.parse(readFileSync(assetsFile, "utf8"));
        } else
        {
            res = await (await fetch(response.assetIndex.url)).json();
            mkdirSync(`${this.path}/assets/indexes/`, { recursive: true });
            writeFileSync(assetsFile, JSON.stringify(res));
        }

        Object.keys(res.objects).map(asset =>
        {
            const assetCont = res.objects[ asset ];
            assets.push({
                url: `http://resources.download.minecraft.net/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`,
                path: `${this.path}/assets/objects/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`,
                legacyPath: `${this.path}/assets/virtual/legacy/${asset}`,
                resourcesPath: `${this.path}/packs/${targetID}/resources/asset`
            })
        });
        return assets;
    }
}
type launcherMeta = {
    latest: {
        release: string;
        snapshot: string;
    };
    versions: launcherMetaVersions[]
}

type launcherMetaVersions = {
    id: string;
    type: "snapshot" | "release" | "old_alpha" | "old_beta";
    url: string;
    time: string;
    releaseTime: string;
}

type versionDataDownloads = {
    sha1: string;
    size: string;
    url: string;
};
type versionDataDownloadsLib = {
    path: string;
    sha1: string;
    size: string;
    url: string;
};

type versionData = {
    arguments: {
        game: launcherMetaConfig[],
        jvm: launcherMetaConfig[],
    },
    assetIndex: {
        id: string,
        sha1: string,
        size: number,
        totalSize: string,
        url: string,
    },
    assets: string,
    downloads: {
        client: versionDataDownloads,
        client_mappings: versionDataDownloads,
        server: versionDataDownloads,
        server_mappings: versionDataDownloads,
    },
    id: string,
    libraries: {
        downloads: {
            artifact: versionDataDownloadsLib,
            name: string,
            classifiers?: {
                [ type: string ]: versionDataDownloadsLib
            }
        };
        rules?: {
            action: "allow" | "disallow",
            os?: {
                name: string
            }
        }[],
        navites?: {
            [ os: string ]: string;
        }
    }[],
    logging: {
        client: {
            argument: string,
            file: {
                id: string,
                sha1: string,
                size: number,
                url: string
            },
            type: string
        }
    };
    mainClass: string;
    releaseTime: string;
    time: string;
    type: "snapshot" | "release" | "old_alpha" | "old_beta"
}
type launcherMetaConfig = (
    string
    |
    {
        rules: {
            action: string,
            features: {
                [ type: string ]: boolean
            }
        }[],
        value: string | string[]
    }
);