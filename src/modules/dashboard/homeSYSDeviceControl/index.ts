import { DataConnect, ElementResponse, WebGen } from '@lucsoft/webgen';
import { CardButtonList } from '@lucsoft/webgen/bin/classes/WebGenElements';

import { HomeSYSAppModule } from '../../../modules';

export class DeviceEvent
{
    action?: "update" | "create" = "update";
    id: string = "";
    address: string = "";
    type: "unknown" | "lamp" | "switch" | "usbdeivce" | "outlet" | "door" = "unknown";
    allowed: string[] = [];
    state: "on" | "off" | "lock" | "unlock" | "unknow" = "unknow";
}
export class homeSYSDeviceControl implements HomeSYSAppModule
{
    public title = "Device Control";
    public subtitle = "Control Smart Devices";
    public id = "homeSYSDeviceControl";

    public renderModuleInStats(): void { }

    public renderModuleConnectedSystems(): void { }

    public renderModuleAfterAll(): void { }

    private web: WebGen;
    private elements: ElementResponse;
    private data: DataConnect;
    private cardButtons?: ElementResponse;
    private currentDevices = [];
    constructor(web: WebGen, elements: ElementResponse, data: DataConnect)
    {
        this.web = web;
        this.elements = elements;
        this.data = data;

        if (this.currentDevices.length == 0)
            this.currentDevices = this.data.profile.modules.vdevice;

    }

    public isActive(state)
    {
        return (state == "on"
            || state == "ring"
            || state == "unlock");
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
        const content = document.createElement('div');
        const contentWeb = this.web.elements.add(content);

        this.cardButtons = contentWeb.cardButtons({
            list: this.currentDevices.map((device) =>
            {
                return {
                    title: device.name,
                    id: device.address,
                    icon: this.getIcon(device.type, this.isActive(device.state)),
                    active: this.isActive(device.state),
                    onClick: (_, state) =>
                    {
                        this.data.triggerCommand('vdevices', { address: device.address, state: device.allowed[ state ? 1 : 0 ] });
                    }
                } as CardButtonList;
            })
        })
        this.web.elements.add(settings.element).window({
            title: "Youre Device",
            maxWidth: "40rem",
            content: content,
        });
    }

    private getIcon(type, state)
    {
        if (type == "lamp")
            if (state == true)
                return "https://hmsys.de/lightOn"
            else
                return "https://hmsys.de/lightOff"
        else if (type == "ring")
            if (state == true)
                return "https://hmsys.de/RingOn"
            else
                return "https://hmsys.de/RingOff"
        else if (type == "outlet")
            if (state == true)
                return "https://hmsys.de/outletOn"
            else
                return "https://hmsys.de/outletOff"
        else
            return undefined;

    }

    public emitEvent(type: string, data: {
        type: string;
        address: string;
        content: "on" | "off" | "lock" | "unlock" | "unknow" | "ring";
        devicetype: "unknown" | "lamp" | "switch" | "usbdeivce" | "outlet" | "door";
    }): void
    {
        if (type == "vdevice")
        {
            var element = this.cardButtons.modify.element.querySelector(`#${data.address}`);

            if (this.isActive(data.content))
            {
                element.classList.add('active');
                const imgE = element.querySelector('img');
                if (imgE)
                    imgE.src = this.getIcon(data.devicetype, true)
            }
            else
            {
                element.classList.remove('active');
                const imgE = element.querySelector('img');
                if (imgE)
                    imgE.src = this.getIcon(data.devicetype, false)
            }

            let device = this.currentDevices.find((x) => x.address == data.address)
            if (device)
            {
                device.state = data.content;
                device.type = data.devicetype;
            }

        }
    }
}