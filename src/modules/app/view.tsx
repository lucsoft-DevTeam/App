import React from 'react';

import { WebGen } from '@lucsoft/webgen';

import { DashboardModule } from '../dashboard';
import { LoginModule } from '../login';
import { modules } from './modulelist';
import { HomeSYSModule } from './modules';

export const web = new WebGen();

export class HomeSYS extends React.Component
{

    render()
    {
        return (
            <article id="page"></article>

        )
    }
}
export let page: HTMLElement;
export const getModule = (ModuleType: any) =>
{
    return modules.find(x => x instanceof ModuleType);
};
web.ready = () =>
{
    page = document.getElementById('page');
    page.style.maxWidth = "48rem";
    page.style.left = "50%";
    page.style.transform = "translate(-50%, 0)";
    page.style.position = "relative";
    page.style.marginTop = "5rem";
    modules.forEach((x: HomeSYSModule) =>
    {
        x.onWebGenLoaded(page);
    })

    var login = getModule(LoginModule) as LoginModule;
    var dasboard = getModule(DashboardModule) as DashboardModule;
    login.startLogin();
    login.onLogin = () =>
    {
        localStorage.auth = JSON.stringify(login.data.profile.auth);
        dasboard.openDashboard(login.data);
    };

};

document.addEventListener("DOMContentLoaded", () => web.enable(web.supported.blur));
