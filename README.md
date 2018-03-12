# Action Request

Action Requests app for Premier Pump & Power, LLC.

## Requirements

Create a [Firebase](http://firebase.google.com) account and a [Mailgun](https://www.mailgun.com) account.

Install the following.

* [Node.js >= 6.11.5 < 8.0.0](https://nodejs.org)
* [Yarn >= 1.3.2](https://yarnpkg.com)
* [Angular CLI >= 1.6.2](https://cli.angular.io)
* [Firebase CLI >= 3.16.0](https://firebase.google.com/docs/cli)

```shell
brew install node yarn
yarn global add @angular/cli
yarn global add firebase-tools
```

**Note**: Node 8 is not yet [supported by Firebase
Functions](https://cloud.google.com/functions/docs/writing/#the_cloud_functions_runtime).

## Setup

From the app's root directory, install the app's Node package dependencies.

```shell
yarn install
```

Initialize Firebase and populate your Firebase project configuration.

```shell
echo "
  export const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: ''
  };
" > ./src/environments/firebase.ts
```

Generate a Mailgun API key and register it with Firebase, as follows.

```shell
firebase functions:config:set mailgun.apikey="<MAILGUN_API_KEY>"
```

## Development server

Run `ng serve` from the app's root directory for a development server.

Navigate to `http://localhost:4200/`. The app will automatically reload if you
change any of the source files.

## Code scaffolding

Run `ng generate component <component-name>` to
generate a new component (shorthand: `ng g c <component-name>`). You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use `--aot --prod --build-optimizer` flags for production builds.

## Deploying to Firebase

Run `yarn run firebase:deploy` to deploy a production build to Firebase.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
