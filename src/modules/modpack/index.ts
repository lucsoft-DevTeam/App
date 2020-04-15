import { shell } from 'electron';

import { SearchEntry } from '@lucsoft/webgen/bin/classes/WebGenElements';

import { HomeSYSModule } from '../app/modules';

export class ModpackTestingModule extends HomeSYSModule
{
    moduleID: string = "@lucsoft/modpack";
    async afterLoaded()
    {
        this.page.innerHTML = "";

        this.renderFeaturedServer();
        this.renderModpackTest();
    }
    async renderFeaturedServer()
    {
        const list = document.createElement('div');
        list.append(this.modpackIcon('Nameless 1.15', 'http://cdn.hmsys.de/imgs/Nameless1.15.svg'))
        list.append(this.modpackIcon('Nameless 1.12', 'http://cdn.hmsys.de/imgs/Nameless.svg'))

        this.webgen.elements.add(this.page).pageTitle({
            text: 'Featured Modpacks'
        }).next.customElement({
            element: list
        });
    }

    // downloadForge()
    // {
    //     const http = require('http');
    //     const fs = require('fs');

    //     const file = fs.createWriteStream("forge.jar");
    //     http.get("http://files.minecraftforge.net/maven/net/minecraftforge/forge/1.15.2-31.1.35/forge-1.15.2-31.1.35-installer.jar", function (response)
    //     {
    //         response.pipe(file);
    //     });
    // }
    // async startMinecraft()
    // {
    //     const args = "-Djava.library.path="
    // }
    // async getMinecraftToken(username: string, password: string)
    // {
    //     const data = await fetch('https://authserver.mojang.com/authenticate', {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify({
    //             agent: {
    //                 name: "Minecraft",
    //                 version: 1
    //             },
    //             username,
    //             password
    //         })
    //     })

    //     if (data.status !== 200)
    //         return undefined;

    //     const json = await data.json();
    //     if (json.availableProfiles.length == 0)
    //         return undefined;
    //     return {
    //         username: json.selectedProfile.name,
    //         uuid: json.selectedProfile.id,
    //         token: json.accessToken
    //     };
    // }
    async renderModpackTest()
    {

        this.webgen.elements.add(this.page).pageTitle({
            text: 'MCModpack'
        }).next.cards({
            small: true,
            columns: "3",
            hidden: false,
            cards: [
                {
                    title: 'Loading',
                    subtitle: 'Mods',
                    id: 'mods'
                },
                {
                    title: '1.15.2',
                    subtitle: 'Version',
                    id: 'mods'
                },
                {
                    title: 'Loading',
                    subtitle: 'New Updates',
                    id: 'updates'
                }
            ]
        })
        const modsArray = await this.loadData();
        const cardtitle = this.page.querySelector('#mods').querySelector('.title');
        const pagetitle = this.page.querySelector('.pagetitle');
        const updates = this.page.querySelector('#updates').querySelector('.title');
        if (cardtitle)
            cardtitle.innerHTML = modsArray.length.toString();
        if (localStorage.data == undefined || localStorage.data == "")
        {
            let data = [];
            for (let index = 0; index < modsArray.length; index++)
            {
                const element = modsArray[ index ];
                data.push(await this.getModByID(element));
                pagetitle.innerHTML = `MCModpack - ${index + 1}/${modsArray.length}`;
            }
            localStorage.setItem('data', JSON.stringify(data));
        }
        const data: {
            name: string,
            id: string,
            websiteUrl: string,
            dateReleased: string,
            latestFiles:
            {
                gameVersion: string[],
                projectFileId: string,
                projectFileName: string,
                fileType: number,
                fileDate: string
            }[],
            authors:
            {
                name: string
            }[]
        }[] = JSON.parse(localStorage.data);
        updates.innerHTML = this.getNewUpdates(data);
        this.webgen.elements.add(this.page).search({
            type: "smart",
            onclose: () => { localStorage.removeItem('data'); location.href = location.href; },
            allowed: {
                donwload: false,
            },
            index: data.sort((a, b) => (a.dateReleased < b.dateReleased ? 1 : -1)).map((event): SearchEntry =>
            {
                const file = this.getFile(event);
                const obj = {
                    id: event.id,
                    name: event.name,
                    tags: [ this.webgen.functions.timeAgo(new Date(file.fileDate).getTime()) + `${file.is115 ? ' as 1.15' : ''}`, ...file.gameVersion.filter((x) => x != "Forge" && x != "Fabric" && !x.includes("Snapshot")) ]
                };
                return obj;
            }),
            actions: {
                remove: () => { },
                edit: () => { },
                click: (e) =>
                {
                    shell.openExternal(data.find(x => x.id == e).websiteUrl)
                },
                download: () =>
                {

                }
            }
        }).next.buttons({
            big: true,
            list: [
                {
                    onclick: () => { localStorage.removeItem('data'); location.href = location.href; },
                    text: 'Refresh Cache'
                },
                {
                    onclick: () => (shell.openExternal("https://github.com/lucsoft-devteam/app")),
                    text: 'Open GitHub (HomeSYS App)'
                }
            ]
        })
    }

    modpackIcon(title: string, url: string): HTMLElement
    {
        const element = document.createElement('div');
        element.style.background = "var(--default-background-color)";
        element.style.padding = "1rem";
        element.style.borderRadius = "1rem";
        element.style.display = "inline-block";
        element.style.margin = "0.6rem";
        element.style.width = "9rem";
        const img = document.createElement('img');
        img.src = url;
        img.style.height = "8rem";
        img.style.margin = "auto";
        img.style.display = "block";
        const span = document.createElement('span');
        span.style.display = "block";
        span.style.textAlign = "center";
        span.style.fontSize = "1.1rem";
        span.style.margin = "0.6rem 0 -0.2rem";
        span.innerText = title;
        element.append(img)
        element.append(span);
        return element;
    }
    getNewUpdates(data: { name: string; id: string; websiteUrl: string; dateReleased: string; latestFiles: { gameVersion: string[]; projectFileId: string; projectFileName: string; fileType: number; fileDate: string; }[]; authors: { name: string }[]; }[]): string
    {
        data;
        return 'Soon';
    }

    private getFile(event: { name: string; id: string; websiteUrl: string; dateReleased: string; latestFiles: { gameVersion: string[]; projectFileId: string; projectFileName: string; fileType: number; fileDate: string; }[]; authors: { name: string; }[]; })
    {
        const file = event.latestFiles.sort((a, b) => (a.fileDate < b.fileDate ? 1 : -1)).find((x) => x.gameVersion.includes("1.15.1") || x.gameVersion.includes("1.15.2"));
        const last = event.latestFiles.sort((a, b) => (a.fileDate < b.fileDate ? 1 : -1))[ 0 ];
        if (file)
            return { ...file, is115: true };
        return { ...last, is115: false };
    }

    private async getModByID(id: number)
    {
        return (await fetch(`https://curse.nikky.moe/api/addon/${id}`)).json();
    }
    private loadData(): Promise<number[]>
    {
        return new Promise((done) =>
        {
            done([ 271856, 220318, 353794, 291874, 265894, 270466, 328085, 353999, 349460, 233019, 231484, 352222, 223099, 282001, 316582, 366140, 335051, 280294, 228756, 238222, 360438, 268560, 245506, 354143, 222967, 226410, 353775, 243076, 223852, 245211, 263420, 317780, 303115, 238794, 366667, 268495, 289712, 246939, 267006, 306187, 306770, 309927, 225643, 298187, 313866, 351748, 261442, 272302, 344209, 293425, 333396, 309830, 248787, 326599, 226889, 256717, 250398, 266228, 267866, 341131, 324952, 250832, 310305, 327968, 240783, 240633, 352622, 240630, 241895, 351948, 238747, 69118, 296468, 284904, 250898, 295373, 300331, 264353, 271740, 317134, 353399, 280510, 272515, 344036, 239197, 242195, 319716, 349447, 351725, 291493, 243121, 296686, 327554, 344445, 277616, 254268, 284742, 227875, 226254, 241721, 64578, 69163, 242638, 61811, 59751, 250603, 235279, 267602, 233398, 323596, 323043, 282837, 291509 ]);
        });
    }
    // public async afterLogin(data: DataConnect)
    // {
    //     super.afterLogin(data);
    // }
}