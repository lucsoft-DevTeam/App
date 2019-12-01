import React from 'react';

import { DataConnect } from '@lucsoft/webgen';
import { ElementResponse } from '@lucsoft/webgen/bin/classes/ElementsResponse';

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
    onSync(type: string, data: any)
    {
        console.log(type, data);
        if (type == "vdevice")
        {
            var element = Object.values(
                this.cards.modify.element.querySelectorAll('card'))
                .find(x => x.id == data.address);
            console.log('test', data);
            if (data.content == "on" || data.content == "unlock")
                element.classList.add('active');
            else
                element.classList.remove('active');

            element.querySelector('.value').innerHTML = translateENG(data.content);
        }
    }
    openDashboard(data: DataConnect)
    {
        web.elements.clear();
        data.onSync = (type, data) => this.onSync(type, data);
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
                toggleElement: (toggle, title, state, element, id) =>
                {
                    (data as any).triggerCommand('vdevices', { address: id, state: x.allowed.find(w => w != state.innerText.toLowerCase().replace('locked', 'lock')) });
                }
            } as cardbutton))
        });
        (window as any).data = data;
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
            text: "HomeSYS Connect"
        }).modify.element.style.marginTop = "4rem";
        if (!data.profile.modules.homesys.homsysConnectConnected)
        {
            this.cards.next.cards({
                small: false,
                columns: "1",
                hidden: false,
                cards: [
                    {
                        title: "Unable to Connect",
                        subtitle: "HomeSYS Connnect has not logged into HmSYS",
                        id: "homesysconnect"
                    }
                ]
            })
        }
        setInterval(() =>
        {
            document.querySelector('#hmsysrunningsince').querySelector('.title').innerHTML = timeAgo(data.profile.modules.homesys.runningSince);
        }, 1000);
        this.cards.next.pageTitle({
            text: "Online Modules"
        }).modify.element.style.marginTop = "4rem";
        this.cards.next.cardButtons({
            small: false,
            columns: "3",
            list: [
                {
                    title: "HomeSYS Settings",

                    toggleElement: () =>
                    {
                        this.openSettings();
                    }
                }
            ]
        })
    }
    private openSettings()
    {

    }
}