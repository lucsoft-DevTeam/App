import { DataConnect, ElementResponse, WebGen } from '@lucsoft/webgen';

export class HomeSYSAppModule
{
    constructor(web: WebGen, elements: ElementResponse, data: DataConnect)
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