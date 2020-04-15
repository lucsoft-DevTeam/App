const { app, BrowserWindow } = require('electron')
function createWindow()
{

    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        icon: __dirname + '/res/AppIcon.icns',
        title: 'HomeSYS',
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    })
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('message', 'Hello second window!');
    });
    if (process.argv[ 2 ] === "--dev")
    {
        mainWindow.loadURL(`http://localhost:8080`);
    }
    else
        mainWindow.loadFile(`./dist/index.html`)

}
app.name = 'HomeSYS';
app.allowRendererProcessReuse = true;
app.on('ready', createWindow)