import { DataConnect, ElementResponse } from '@lucsoft/webgen';
import { CardButtonList, WebGenElements } from '@lucsoft/webgen/bin/classes/WebGenElements';

import { moduleList } from '../../moduleList';
import { actionTypes, HomeSYSAppModule } from '../../modules';
import { page, web } from '../app';
import { HomeSYSModule } from '../app/modules';

class cardbutton
{
    title: string;
    value: string;
    active: boolean;
    id: string;
    toggleElement?: (toggleState: (state: string) => void, state: HTMLSpanElement, title: HTMLSpanElement, element: HTMLElement) => void;
};

const translateENG = (trans: string) =>
{
    switch (trans)
    {
        case "off":
            return "Off";
        case "on":
            return "On";
        case "lock":
            return "Locked";
        case "locked":
            return "Locked";
        case "unlock":
            return "Unlocked";
        default:
            return trans;
    }
}

export class DashboardModule extends HomeSYSModule
{
    moduleID: string = "@lucsoft/dashboard";
    actionList: [] = [];
    data?: DataConnect;
    content?: WebGenElements;

    onWebGenLoaded: (page: HTMLElement) => void = (page) => (this.content = web.elements.add(page));
    onSync(type: string, data: any)
    {
        console.log("DATASYNC", type, data);
        this.loadedModules.forEach((thisModule) => thisModule.emitEvent("moduleCommuncation", { ...data, module: "vdevice" }));
    }
    loadedModules: HomeSYSAppModule[] = [];

    private brodcastModuleAction = (type: actionTypes) => this.loadedModules.map((thisModule) => thisModule.emitEvent(type));

    private async loadModules()
    {
        const hmsys = this.data.profile.modules.hmsys;
        if (this.data.profile.modules.hmsys == undefined)
            return;

        for (const mod of moduleList)
        {
            if (!hmsys.loadedModules.includes(mod))
            {
                let loadedModuleClass = await import(/* webpackChunkName: "modules" */`./submodules/${mod}/index.ts`);
                if (loadedModuleClass.default === undefined)
                    throw new Error(mod + ' is an invalid module, kill it with fire!');
                const newModule = new loadedModuleClass.default(web, this.content, this.data);
                console.log(`Loaded ${newModule.moduleName}`);
                this.loadedModules.push(newModule);
                this.brodcastModuleAction("afterLoading");
            }
        }

        this.brodcastModuleAction("afterComplete");

    }
    async openDashboard(data: DataConnect)
    {
        web.elements.clear();
        this.data = data;

        await this.loadModules();
        data.onSync = (type: string, data: string | object) => this.onSync(type, data);

        this.brodcastModuleAction("beginHTML");
        this.content.pageTitle({
            text: `HomeSYS – ${data.profile.modules.homesys.version}`
        }).next.cards({
            small: true,
            columns: "3",
            hidden: false,
            cards: [
                {
                    title: data.profile.modules.homesys.accounts,
                    subtitle: "HomeSYS User",
                    id: "hmsysid"
                },
                {
                    title: data.profile.modules.homesys.connectedOn,
                    subtitle: "HmSYS Node",
                    id: "hmsysnode"
                },
                {
                    title: web.functions.timeAgo(data.profile.modules.homesys.runningSince),
                    subtitle: "HmSYS Uptime",
                    id: "hmsysrunningsince"
                }
            ]
        });

        this.brodcastModuleAction("statistics");
        this.content.pageTitle({
            text: "Connected Systems"
        }).modify.element.style.marginTop = "4rem";

        this.brodcastModuleAction("connectedSystems");
        this.renderButtonList(this.brodcastModuleAction("extraFeatures"));
        setInterval(() =>
        {
            document.querySelector('#hmsysrunningsince').querySelector('.title').innerHTML = web.functions.timeAgo(data.profile.modules.homesys.runningSince);
        }, 1000);
        // const list = [];

        // for (const mod of this.loadedModules)
        // {
        //     list.push({
        //         title: mod.title,
        //         value: mod.subtitle,
        //         id: mod.id,
        //         onClick: async () => mod.buttonClicked()
        //     })
        // }

        // this.cards.next.cardButtons({
        //     small: false,
        //     columns: "3",
        //     list: []
        // }).modify.element.style.marginBottom = "5rem";

    }
    renderButtonList(response: any[])
    {
        const filteredUndefined = response.filter(x => x != undefined);
        if (filteredUndefined.length == 0)
            return;
        const filtered: (CardButtonList & { type?: string })[] = filteredUndefined.filter((x: CardButtonList & { type?: string }) => x.type == "buttonlist");
        if (filtered.length == 0)
            return;
        this.content.cardButtons({
            list: filtered
        })
    }

    private async loadModule(moduleID: string)
    {
        return eval(await (await fetch(`./module/${moduleID}.js`)).text());
    }
}