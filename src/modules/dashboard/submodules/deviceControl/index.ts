import type { DataConnect, ElementResponse, WebGen } from '@lucsoft/webgen';
import type { CardButtonList } from '@lucsoft/webgen/bin/classes/WebGenElements';

import { actionTypes, HomeSYSAppModule } from '../../../../modules';
import { getIcon } from '../../functions/icons';

import type { DeviceState, DeviceType, UserDevices } from '../../../types/devices';
export class DeviceEvent
{
    action?: "update" | "create" = "update";
    id: string = "";
    address: string = "";
    type: "unknown" | "lamp" | "switch" | "usbdeivce" | "outlet" | "door" = "unknown";
    allowed: string[] = [];
    state: "on" | "off" | "lock" | "unlock" | "unknow" = "unknow";
}
export default class deviceControl extends HomeSYSAppModule
{
    moduleName = "Device Control";
    public subtitle = "Control Smart Devices";
    private cardButtons?: ElementResponse;
    private currentDevices: UserDevices[] = [];

    public isActive(state: DeviceState)
    {
        return (state == "on"
            || state == "ring"
            || state == "unlock");
    }

    public buttonClicked()
    {

        return {
            type: "buttonlist",
            id: "deviceControl",
            title: this.moduleName,
            value: this.subtitle,
            onClick: () =>
            {
                const settings = this.web.elements.layout("fixedWindow").element;
                settings.element.onclick = (ev: any) =>
                {
                    if (ev.path[ 0 ].nodeName == "ARTICLE")
                        settings.element.remove();

                }
                var test = document.createElement('button');
                test.onclick = () => this.web.elements.layout("fixedWindow", true);
                test.innerHTML = "Close";
                const content = document.createElement('div');
                const contentWeb = this.web.elements.add(content);

                this.cardButtons = contentWeb.cardButtons({
                    list: this.currentDevices.map((device) =>
                        ({
                            title: device.name,
                            id: device.address,
                            icon: getIcon(device.type, this.isActive(device.state)),
                            active: this.isActive(device.state),
                            onClick: (_, state) =>
                            {
                                this.data.triggerCommand('vdevices', { address: device.address, state: device.allowed[ state ? 1 : 0 ] });
                            }
                        } as CardButtonList)
                    )
                })
                this.web.elements.add(settings.element).window({
                    title: "Youre Device",
                    maxWidth: "40rem",
                    content: content,
                });
            }

        };
    }

    public emitEvent(type: actionTypes, data: any)
    {
        switch (type)
        {
            case "afterLoading":

                if (this.currentDevices.length == 0)
                    this.currentDevices = this.data.profile.modules.vdevice;

                return;
            case "extraFeatures":
                return this.buttonClicked();
            case "moduleCommuncation":
                return this.handleModuleCommuncation(data);
        }
    }

    handleModuleCommuncation(data: { module: string; type: string; address: string; content: DeviceState; devicetype: DeviceType; }): void
    {
        switch (data.module)
        {
            case "vdevice":
                {

                    var element = this.cardButtons.modify.element.querySelector(`#${data.address}`);
                    this.updateIcon(element, data.devicetype, this.isActive(data.content));

                    let device = this.currentDevices.find((x) => x.address == data.address)
                    if (device)
                    {
                        device.state = data.content;
                        device.type = data.devicetype;
                    }

                    break;
                }

        }
    }
    updateIcon(element: Element, deviceType: DeviceType, action: boolean)
    {
        if (action)
            element.classList.add('active');
        else
            element.classList.remove('active');

        const imgE = element.querySelector('img');
        if (imgE)
            imgE.src = getIcon(deviceType, action)
    }
}