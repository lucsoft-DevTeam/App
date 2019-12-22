import { DataConnect, ElementResponse, WebGen } from '@lucsoft/webgen';

import { HomeSYSAppModule } from '../../../modules';

export class homeSYSSettings implements HomeSYSAppModule
{
    public title = "Settings";
    public subtitle = undefined;
    public id = "homeSYSSettings";
    private web: WebGen;
    private elements: ElementResponse;
    private data: DataConnect;

    constructor(web: WebGen, elements: ElementResponse, data: DataConnect)
    {
        this.web = web;
        this.elements = elements;
        this.data = data;
    }

    public renderModuleInStats(): void
    {
    }

    public renderModuleConnectedSystems(): void
    {
    }

    public renderModuleAfterAll(): void
    {
    }

    public buttonClicked(): void
    {
        const settings = this.web.elements.layout("fixedWindow").element;
        settings.element.onclick = (ev: any) =>
        {
            if (ev.path[ 0 ].nodeName == "ARTICLE")
            {
                settings.element.remove();
            }
        }
        var test = document.createElement('button');
        test.onclick = () => this.web.elements.layout("fixedWindow", true);
        test.innerHTML = "Close";
        this.web.elements.add(settings.element).window({
            title: "Settings",
            maxWidth: "30rem",
            content: [ `NEEE`, test ],
        });
    }

    public emitEvent(type: string, data: any): void
    {
    }
}