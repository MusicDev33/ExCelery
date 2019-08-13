[![Maintainability](https://api.codeclimate.com/v1/badges/d7724c0e23521306ece7/maintainability)](https://codeclimate.com/github/MusicDev33/ExCelery/maintainability)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/1652a86dfd2f4826bd54dadaf3c6e779)](https://www.codacy.com/app/SM1/ExCelery?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=MusicDev33/ExCelery&amp;utm_campaign=Badge_Grade)

# Introduction
Built off of [angular-electron](https://github.com/maximegris/angular-electron.git), big thanks to [Maxime GRIS](https://github.com/maximegris).

Currently runs with:

- Angular v8.0.0
- Electron v5.0.2
- Electron Builder v20.41.0

/!\ Angular 8.0 CLI needs Node 10.9 or later to work.

## Getting Started

Clone this repository locally :

``` bash
git clone https://github.com/MusicDev33/ExCelery.git
```

Install dependencies with npm :

``` bash
npm install
```

There is an issue with `yarn` and `node_modules` that are only used in Electron on the backend when the application is built by the packager. Please use `npm` as the dependency manager.


If you want to generate Angular components with Angular-CLI , you **MUST** install `@angular/cli` in npm global context. Follow [Angular-CLI documentation](https://github.com/angular/angular-cli) if you installed a previous version of `angular-cli`.

``` bash
npm install -g @angular/cli
```

## Build for Development

- **in a terminal window** -> npm start

Now ExCelery is running as an Electron application with hot reload.

The application code is managed by `main.ts`, and runs with a simple Angular app (http://localhost:4200) and an Electron window.
The Angular component contains an example of Electron and NodeJS native lib import.
You can disable "Developer Tools" by commenting out `win.webContents.openDevTools();` in `main.ts`.

## Included Commands

|Command|Description|
|--|--|
|`npm run ng:serve:web`| Execute the app in the browser. |
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular AoT. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and starts Electron.
|`npm run electron:linux`| Builds your application and creates an app consumable on Linux. |
|`npm run electron:windows`| On a Windows OS, builds your application and creates an app consumable on Windows 32/64 bit systems. |
|`npm run electron:mac`|  Builds your application and generates a `.app` file of your application that can be run on macOS. |

**Application is optimised. Only /dist folder and node dependencies are included in the executable.**

## Using a specific library (like rxjs) in Electron main thread

Import your library in npm dependencies (not devDependencies) with `npm install --save`. It will be loaded by Electron during build phase and added to the final package. Then use your library by importing it in `main.ts` file.

## Browser Mode

If you want to run the app in the browser with hot reload, you can do it with `npm run ng:serve:web`.

**Note that you can't use Electron or NodeJS native libraries in this case.**
Please check `providers/electron.service.ts` to watch how conditional import of Electron/native libraries is done.
