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
        var test = web.elements.add(page).login({
            login: (password: HTMLInputElement, email: HTMLInputElement, url: HTMLInputElement, errormsg: HTMLElement) => this.data.loginWindow(password, email, { value: "wss://eu01.hmsys.de" } as HTMLInputElement, errormsg),
            email: "Email",
            password: "Password",
        });

        this.data.onLogout = () =>
        {
            if (document.getElementById('errorMessage2') == null)
            {
                var element = document.createElement('span');
                element.id = "errorMessage2";
                element.classList.add('errormsg');
                element.style.color = "red";
                element.style.margin = "1.3rem 1rem";
                element.style.fontWeight = "300";
                element.style.fontSize = "1.5rem";
                element.innerHTML = "Login Failed.";
                test.modify.element.querySelector('form').append(element)
            }
        };
        this.data.onLogin = () => this.onLogin(this.data);
    }
}