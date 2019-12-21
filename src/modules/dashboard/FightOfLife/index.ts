import { DataConnect, ElementResponse, WebGen } from '@lucsoft/webgen';

import { HomeSYSAppModule } from '../modules';

export class FightOfLife implements HomeSYSAppModule
{
    constructor(web: WebGen, elements: ElementResponse, data: DataConnect)
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
                console.log(data);
                data.triggerCommand("registerCLMP", { username: email });
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
}