import { DataConnect, ElementResponse } from '@lucsoft/webgen';

import { moduleList } from '../../moduleList';
import { HomeSYSAppModule } from '../../modules';
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
const times: any[] = [ [ "second", 1 ], [ "minute", 60 ], [ "hour", 3600 ], [ "day", 86400 ], [ "week", 604800 ], [ "month", 2592000 ], [ "year", 31536000 ] ]

function timeAgo(date)
{
    var diff = Math.round(((new Date().getTime()) - date) / 1000)
    for (var t = 0; t < times.length; t++)
    {
        if (diff < times[ t ][ 1 ])
        {
            if (t == 0)
            {
                return "Just now"
            } else
            {
                diff = Math.round(diff / times[ t - 1 ][ 1 ])
                return diff + " " + times[ t - 1 ][ 0 ] + (diff == 1 ? "" : "s")
            }
        }
    }
}
export class DashboardModule extends HomeSYSModule
{
    moduleID: string = "@lucsoft/dashboard";
    onWebGenLoaded: (page: HTMLElement) => void = (page) =>
    {
    }
    cards: ElementResponse;
    actionList: [] = [];
    data?: DataConnect;
    onSync(type: string, data: any)
    {
        console.log("DATASYNC", type, data);
        this.loadedModules.forEach((thisModule) => thisModule.emitEvent(type, data));
    }
    loadedModules: HomeSYSAppModule[] = [];
    private async loadModules()
    {
        const hmsys = this.data.profile.modules.hmsys;
        if (this.data.profile.modules.hmsys == undefined)
            return;

        for (const mod of moduleList)
        {
            if (hmsys.loadedModules.includes(mod.id))
            {
                const loadedModule: typeof HomeSYSAppModule = (await this.loadModule(mod.id))[ mod.id ];
                const thisModule = new loadedModule(web, this.cards, this.data);
                console.log(`Loaded ${thisModule.title}`);
                this.loadedModules.push(thisModule);
            }
        }

    }

    async openDashboard(data: DataConnect)
    {
        web.elements.clear();
        this.data = data;

        await this.loadModules();
        data.onSync = (type: string, data: string | object) => this.onSync(type, data);
        this.cards = web.elements.add(page).pageTitle({
            text: `HomeSYS – ${data.profile.modules.homesys.version}`
        }).next.note({
            text: "Welcome back! Here are youre Actions",
            type: "fire"
        });

        this.loadedModules.forEach((thisModule) => thisModule.renderModuleInStats());
        this.cards.next.cards({
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
                    title: timeAgo(data.profile.modules.homesys.runningSince),
                    subtitle: "HmSYS Uptime",
                    id: "hmsysrunningsince"
                }
            ]
        }).next.pageTitle({
            text: "Connected Systems"
        }).modify.element.style.marginTop = "4rem";

        const hRendering = require('./ConnectedSystems/houseRendering').HouseRendering;
        new hRendering(this.cards, data);

        setInterval(() =>
        {
            document.querySelector('#hmsysrunningsince').querySelector('.title').innerHTML = timeAgo(data.profile.modules.homesys.runningSince);
        }, 1000);
        const list = [];

        for (const mod of this.loadedModules)
        {
            list.push({
                title: mod.title,
                value: mod.subtitle,
                id: mod.id,
                onClick: async () => mod.buttonClicked()
            })
        }

        this.cards.next.cardButtons({
            small: false,
            columns: "3",
            list: list
        }).modify.element.style.marginBottom = "5rem";

    }

    private async loadModule(moduleID: string)
    {
        return eval(await (await fetch(`./module/${moduleID}.js`)).text());
    }
}