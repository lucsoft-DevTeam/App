import { DataConnect, ElementResponse } from '@lucsoft/webgen';

import { page, web } from '../app';
import { HomeSYSModule } from '../app/modules';
import { FightOfLife } from './FightOfLife';
import { HomeSYSAppModule } from './modules';

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
        if (type == "vdevice")
        {

            var element = this.cards.modify.element.querySelector(`card#${data.address}`);

            if (data.content == "on" || data.content == "unlock")
                element.classList.add('active');
            else
                element.classList.remove('active');

            element.querySelector('.value').innerHTML = translateENG(data.content);
        } else if (type == "clmpChat")
        {
            console.log(data);
        }
    }
    openDashboard(data: DataConnect)
    {
        web.elements.clear();
        this.data = data;
        data.onSync = (type: string, data: string | object) => this.onSync(type, data);
        var trends = web.elements.add(page).pageTitle({
            text: `HomeSYS – ${data.profile.modules.homesys.version}`
        }).next.note({
            text: "Welcome back! Here are youre Actions",
            type: "fire"
        });
        var devices = data.profile.modules.vdevice as { name: string, state: string, allowed: string[], address: string }[];

        this.cards = trends.next.cardButtons({
            list: devices.map(x => ({
                active: x.state == "on" || x.state == "unlock",
                title: x.name,
                id: x.address,
                value: translateENG(x.state),
                onClick: (toggle, state, title, element, id) =>
                {
                    data.triggerCommand('vdevices', { address: id, state: x.allowed[ state ? 1 : 0 ] });
                }
            } as cardbutton))
        });
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
        const hmsys = data.profile.modules.hmsys;
        if (data.profile.modules.hmsys == undefined)
            return;

        var moduleList = [
            {
                title: "Global Settings",
                value: " ",
                id: "homeSYSSettings"
            },
            {
                title: "FightOfLife",
                subtitle: "Proof of Concept Game",
                id: "FightOfLife"
            }
        ];

        for (const mod of moduleList)
        {
            if (hmsys.loadedModules.includes(mod.id))
                list.push({
                    title: mod.title,
                    value: mod.subtitle,
                    id: mod.id,
                    onClick: async () =>
                    {
                        const loadedModule: typeof HomeSYSAppModule = (await this.loadModule(mod.id))[ mod.id ];
                        new loadedModule(web, this.cards, data);
                    }
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