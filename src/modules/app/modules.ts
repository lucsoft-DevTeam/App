export abstract class HomeSYSModule
{
    abstract moduleID: string;
    abstract onWebGenLoaded: (page: HTMLElement) => void;
}
