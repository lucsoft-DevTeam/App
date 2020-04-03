import { WebGen } from '@lucsoft/webgen';
import { LoginModule } from '../login';
import { HomeSYSModule } from './modules';
//@ts-ignore
import mcmodpack from '../../../res/MCModpack.svg';

export const web = new WebGen();

export let page: HTMLElement;
let loadedModules: HomeSYSModule[] = []; 

const runAction = (list: HomeSYSModule[], action: (module: HomeSYSModule) => void) => list.forEach(action);

web.ready = async () =>
{
    page = document.getElementById('page');
    page.style.maxWidth = "48rem";
    page.style.left = "50%";
    page.style.transform = "translate(-50%, 0)";
    page.style.position = "relative";
    page.style.marginTop = "5rem";
    web.elements.add(page).pageTitle({ text: 'Select Start'}).next.cardButtons({
        small: true,
        columns: "1",
        list: [
            {
                id: 'mcmodpack',
                title: 'MCModpack',
                icon: mcmodpack,
                onClick: async () => {
                    new (await import('../modpack')).ModpackTestingModule(web,page);
                }
            },
            {
                id: 'login',
                title: 'Dashboard',
                value: 'Disabled for now',
                onClick: async () => {
                    return;
                    // var login = new LoginModule(web,page);
                    // new (await import('../dashboard')).DashboardModule(web,page);
                    // login.startLogin();
                    // login.onLogin = async () =>
                    // {
                    //     localStorage.auth = JSON.stringify(login.data.profile.auth);

                    //     runAction(loadedModules, (x) => x.afterLogin(login.data));
                    //     console.log(login.data)
                    
                    // };
                }
            },
            
        ]
    })  

};

document.addEventListener("DOMContentLoaded", () => web.enable(web.supported.dark));
