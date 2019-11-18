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
        var trends = web.elements.add(page).note({
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

        this.cards.next.window({
            title: "HomeSYS Stats",
            content: `${JSON.stringify(data.profile.modules.homesys, null, "<br>").replace('}', '').replace('{\n<br>', '')}`
        })
    }
}