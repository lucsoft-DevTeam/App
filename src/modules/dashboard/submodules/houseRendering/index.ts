import './style.css';

import { actionTypes, HomeSYSAppModule } from '../../../../modules';

export default class houseRendering extends HomeSYSAppModule
{
    moduleName = "House Rendering";
    public emitEvent(type: actionTypes): void
    {
        switch (type)
        {
            case "connectedSystems":
                return this.renderConnectedSystems();
        }
    }
    renderConnectedSystems(): void
    {
        if (this.data.profile.modules.homes.length == 0)
        {
            this.elements.cards({
                small: false,
                columns: "1",
                hidden: false,
                cards: [
                    {
                        title: "Unable to Connect",
                        subtitle: "HomeSYS Connnect has not logged into HmSYS",
                        id: "homesysconnect"
                    }
                ]
            })
            return;
        }
        const home = this.data.profile.modules.homes[ 0 ];
        this.elements.window({
            content: `
            <span class="houseTag">${home.houseType == "private" ? "Private" : home.houseType}</span>
            <div class="houseRending">
                <span class="houseIcon">🏡</span class="homeIcon">
                <container-element>
                    <span class="houseName">${home.houseName}</span>
                    <span class="tagsList">
                        <span class="tag power">3 active devices</span>
                        <span class="tag plug">7 available devices</span>
                    </span>
                </container-element>
            </div>
                `
        })
    }

    renderTags(homes: any): string
    {
        return `<span class="tagsList">
            <span class="tag">${this.web.functions.timeAgo(homes.connectedTimestamp)}</span>
        </span>`;
    }
}