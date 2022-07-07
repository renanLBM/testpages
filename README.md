# FacaoControl

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## Controle de versionamento

Versionamento feito de acordo com o padrãoo [SemVer](https://semver.org/);

### Front-End
  Link para o [BitBucket](https://GarciaRenan@bitbucket.org/GarciaRenan/faccao-control.git);
  
    - branch Dev_test:
      - Stage deploy para testes
      - Ao fazer o commit para esse branch o [Netlify](https://app.netlify.com/sites/controleops-lbm/deploys) atualiza automaticamente
      Link para o site de testes: [controleops-lbm](https://controleops-lbm.netlify.app)
      
    - branch Main:
      - Branch principal onde deve ser mantido todo o código que está rodando no ambiente de desenvolvimento;

### Back-End
  Feito em [Flask](https://flask.palletsprojects.com/en/2.1.x/quickstart/)
  Link para o [BitBucket](https://bitbucket.org/GarciaRenan/api_gerenciarops/src/master/);


## Deploy

### Front-End
  Run  `firebase deploy` to deploy the aplication to [Firebase](https://console.firebase.google.com/project/faccaocontrol/overview?hl=pt-br)
  > [help to deploy Firebase](https://www.c-sharpcorner.com/article/how-to-deploy-and-host-an-angular-application-on-firebase/)

### Back-End
  Run ```git push heroku master``` to deploy the aplication to [Heroku](https://dashboard.heroku.com/login)
  > [help to deploy Heroku](https://devcenter.heroku.com/articles/git)

