import { actionTypes, HomeSYSAppModule } from '../../../../modules';

export default class settings extends HomeSYSAppModule
{
    moduleName = "Settings";

    public buttonClicked()
    {
        return {
            type: "buttonlist",
            id: "settings",
            title: this.moduleName,
            onClick: () =>
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
        };
    }

    public emitEvent(type: actionTypes)
    {
        switch (type)
        {
            case "extraFeatures":
                return this.buttonClicked();

        }
    }
}