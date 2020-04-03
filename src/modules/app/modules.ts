import type { DataConnect, WebGen } from "@lucsoft/webgen";

export class HomeSYSModule
{
    constructor(webgen: WebGen, page: HTMLElement) {
        this.webgen = webgen;
        this.page = page;
        this.afterLoaded();
    }
    protected webgen: WebGen;
    protected page: HTMLElement;
    public moduleID: string;
    protected async afterLoaded() {

    }
    public onWebGenLoaded(_page: HTMLElement) {

    };
    public afterLogin (_data: DataConnect) {
        
    };
}
