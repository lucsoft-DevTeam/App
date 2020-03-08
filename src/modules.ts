import type { DataConnect, WebGen } from '@lucsoft/webgen';
import type { WebGenElements } from '@lucsoft/webgen/bin/classes/WebGenElements';

export interface HomeSYSInterface
{
    title: string;
    value?: string;
    active?: boolean;
    id: string;
    onClick?: (toggleState: (state: string) => void, currentState: boolean, title: HTMLSpanElement, element: HTMLElement, id: string) => void;
}
export type actionTypes = "afterLoading" | "beginHTML" | "statistics" | "connectedSystems" | "connectedSystemsFeature" | "extraFeatures" | "afterComplete" | "moduleCommuncation";

export class HomeSYSAppModule
{
    protected web: WebGen;
    protected elements: WebGenElements;
    protected data: DataConnect;
    public moduleName: string = "Unnamed Module";
    constructor(web: WebGen, elements: WebGenElements, data: DataConnect)
    {
        this.web = web;
        this.elements = elements;
        this.data = data;
    }

    public emitEvent(type: actionTypes, data?: any)
    {
        console.error('Loaded an Empty Module...');
    }
}