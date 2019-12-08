import { DataConnect, IDTokenAuth, ProtocolDC } from '@lucsoft/webgen';

import { page, web } from '../app';
import { HomeSYSModule } from '../app/modules';

export class LoginModule extends HomeSYSModule
{
    moduleID: string = "@lucsoft/login";
    isLoggedIn = false;
    data: DataConnect = new DataConnect(ProtocolDC.lsWS, web);
    onWebGenLoaded: (page: HTMLElement) => void = (page) =>
    {
    }
    onLogin: (data: DataConnect) => void = () => { };
    startLogin = () =>
    {
        if (localStorage.auth)
        {
            this.data.url = "wss://eu01.hmsys.de";

            this.data.onLogin = () => this.onLogin(this.data);
            this.data.relogin(JSON.parse(localStorage.auth) as IDTokenAuth);
            return;
        }
        web.elements.clear();
        web.elements.add(page).login({
            login: (password: HTMLInputElement, email: HTMLInputElement, url: HTMLInputElement, errormsg: HTMLElement) => this.data.loginWindow(password, email, { value: "wss://eu01.hmsys.de" } as HTMLInputElement, errormsg),
            email: "Email",
            password: "Password",
        });
        this.data.onLogin = () => this.onLogin(this.data);
    }
}