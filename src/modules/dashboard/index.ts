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
    actionList: [] = [];
    data?: DataConnect;
    onSync(type: string, data: any)
    {
        if (type == "vdevice")
        {
            var element = Object.values(
                this.cards.modify.element.querySelectorAll('card'))
                .find(x => x.id == data.address);
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
                    value: "Global",
                    id: "homsys",
                    onClick: () =>
                    {
                        this.openSettings();
                    }
                },
                {
                    title: "FightOfLife",
                    value: "Proof of Concept",
                    id: "fol",
                    onClick: () =>
                    {
                        this.openGame();
                    }
                }
            ]
        }).modify.element.style.marginBottom = "5rem";

    }

    private openGame()
    {
        const game = web.elements.layout("fixedWindow").element;
        game.element.onclick = (ev: any) =>
        {
            if (ev.path[ 0 ].nodeName == "ARTICLE")
            {
                // game.element.remove();
                // document.body.style.overflow = "unset";
            }
        }
        var login = web.elements.add(game.element).login({
            email: "Gabe Newell",
            button: "Join eu01",
            text: "What's your name?",
            login: (_, email) =>
            {
                console.log(this.data);
                this.data.triggerCommand("registerCLMP", { username: email });
                login.modify.element.remove();
                this.gameLogic(login);
            }
        });

    }

    private gameLogic(windowElement: ElementResponse)
    {
        document.body.style.overflow = "hidden";
        var gameBlock = document.createElement('div');
        var canvas = document.createElement('canvas') as HTMLCanvasElement;
        var game = canvas.getContext("2d");
        game.fillStyle = "#FFFFFF";
        game.fillRect(0, 0, 3000, 2000);
        game.fillStyle = "#000000";
        for (let index = 0; index < 40; index++)
        {
            game.fillRect(10 + index, 10 + index, 1, 1);
        }
        canvas.style.imageRendering = "pixelated";
        canvas.style.height = "2000px";
        canvas.style.width = "3000px";

        gameBlock.append(canvas);
        gameBlock.style.overflow = "auto";
        gameBlock.style.overflowX = "hidden";
        gameBlock.style.height = "20rem";
        gameBlock.style.width = "35rem";
        gameBlock.style.margin = "0 auto";
        gameBlock.scrollTop = 1;
        var currentScale = 1.2;
        gameBlock.style.position = "relative";
        canvas.style.position = "relative";

        canvas.style.transform = `scale(${currentScale})`;
        gameBlock.addEventListener('scroll', (e) =>
        {
            if (gameBlock.scrollTop == 0)
            {
                currentScale += 0.1;
                gameBlock.scrollTop = 1;
            } else if (gameBlock.scrollTop > 1)
            {
                if (currentScale > 0.11)
                    currentScale -= 0.1;
                gameBlock.scrollTop = 1;
            }
            this.changeTransfrom(canvas, currentScale)
        });

        var isDown = false;
        var offset = [ 0, 0 ];
        var mousePosition;
        canvas.addEventListener('mousedown', (e) =>
        {
            isDown = true;
            offset = [
                canvas.offsetLeft - e.clientX,
                canvas.offsetTop - e.clientY
            ];
        }, true);

        document.addEventListener('mouseup', () =>
        {
            isDown = false;
        }, true);

        document.addEventListener('mousemove', (event) =>
        {
            event.preventDefault();
            if (isDown)
            {
                mousePosition = {

                    x: event.clientX,
                    y: event.clientY

                };

                canvas.style.left = (mousePosition.x + offset[ 0 ]) + 'px';
                canvas.style.top = (mousePosition.y + offset[ 1 ]) + 'px';

            }
        }, true);
        windowElement.next.window({
            title: "FightOfLife playling on eu01.hmsys.de",
            content: gameBlock,
            maxWidth: "40rem"
        });
    }

    private changeTransfrom(canvas: HTMLCanvasElement, currentScale: number, )
    {
        canvas.style.transform = `scale(${currentScale})`;
    }
    private openSettings()
    {
        const settings = web.elements.layout("fixedWindow").element;
        settings.element.onclick = (ev: any) =>
        {
            if (ev.path[ 0 ].nodeName == "ARTICLE")
            {
                settings.element.remove();
            }
        }
        var test = document.createElement('button');
        test.onclick = () => web.elements.layout("fixedWindow", true);
        test.innerHTML = "Close";
        web.elements.add(settings.element).window({
            title: "Settings",
            content: [ `NEEE`, test ],
        });
    }
}