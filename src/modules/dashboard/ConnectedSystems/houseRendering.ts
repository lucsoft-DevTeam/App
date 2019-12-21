import './style.css';

import { DataConnect, ElementResponse } from '@lucsoft/webgen';

export class HouseRendering
{
    constructor(web: ElementResponse, data: DataConnect)
    {
        if (data.profile.modules.homes.length == 0)
        {
            web.next.cards({
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
        const home = data.profile.modules.homes[ 0 ];
        web.next.window({
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
}