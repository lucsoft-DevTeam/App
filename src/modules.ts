import { DataConnect, ElementResponse, WebGen } from '@lucsoft/webgen';

export interface HomeSYSInterface
{
    title: string;
    value?: string;
    active?: boolean;
    id: string;
    onClick?: (toggleState: (state: string) => void, currentState: boolean, title: HTMLSpanElement, element: HTMLElement, id: string) => void;
}

export class HomeSYSAppModule
{
    public title = "";
    public subtitle = "";
    public id = "";

    constructor(web: WebGen, elements: ElementResponse, data: DataConnect)
    {

    }

    public renderModuleInStats()
    {

    }

    public renderModuleConnectedSystems()
    {
    }

    public renderModuleAfterAll()
    {
    }

    public buttonClicked()
    {

    }

    public emitEvent(type: string, data: any)
    {

    }
}