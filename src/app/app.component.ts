import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { NbMenuItem, NbSidebarService } from '@nebular/theme';
import { Pages } from './models/enums/enumPages';
import { AppUpdateService } from './providers/app-update.service';
import { UserService } from './services/user.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { SetTitleServiceService } from './shared/set-title-service.service';

@Component({
  selector: 'fc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterContentChecked {
  title = 'facControl';
  nivelLogado = -1;
  isMenuOpen!: boolean;

  items: NbMenuItem[] = [];

  isLoggedIn!: boolean;

  constructor(
    private _sidebarService: NbSidebarService,
    private _setTitle: SetTitleServiceService,
    private _userService: UserService,
    private _appUpdate: AppUpdateService
  ) {}
  ngOnInit(): void {
    this._setTitle.title.subscribe((t) => {
      this.items = [];
      this.nivelLogado = this._userService.getNivel() || 0;
      if (this.nivelLogado == Pages['pcp']) {
        this.items.push({
          title: 'PCP',
          icon: 'keypad-outline',
          // link: './pcp',
          // expanded: true,
          children: [
            {
              title: 'Gerencial',
              link: './pcp',
            },
            // {
            //   title: 'Alterações',
            //   link: './pcp/alteracoes'
            // },
            // {
            //   title: 'Em atraso',
            //   link: './pcp/descricao/Em atraso'
            // },
          ],
        });
      }
      if (
        this.nivelLogado == Pages['pcp'] ||
        this.nivelLogado == Pages['auditor'] ||
        this.nivelLogado == Pages['fornecedor']
      ) {
        this.items.push({
          title: 'Auditor',
          icon: 'file-text-outline',
          children: [
            {
              title: 'Lista de Facções',
              link: './auditor',
            },
            {
              title: 'Minhas Pendências',
              link: './minhas_pendencias',
            },
          ]
        });
      }
      if (
        this.nivelLogado == Pages['pcp']
        // || this.nivelLogado == Pages['motorista']
      ) {
        this.items.push({
          title: 'Motorista',
          link: './motorista',
          icon: 'car-outline',
        });
      }
    });
  }

  ngAfterContentChecked(): void {
    this._setTitle.title.subscribe((t) => {
      this.nivelLogado = this._userService.getNivel() || 0;
    });
    this.isLoggedIn = this._userService.isLogged();
  }

  toggle(event: Event): void {
    this._setTitle.isMenuOpen.subscribe((_) => this.isMenuOpen = _);
    let ehSpan = (event.target as HTMLElement).tagName == "SPAN";
    let btClicado = (event.target as HTMLElement).innerText;

    let ehCabecalho = btClicado == "Auditor" || btClicado == "PCP";

    // se clicou em um span
    if(ehSpan) {
      // se não for cabeçalho executar o toggle
      if(!ehCabecalho) {
        this._setTitle.isMenuOpen.next(!this.isMenuOpen);
        this._sidebarService.toggle();
      }
    }else {
      // se não clicou em span
      // verificar se o menu está aberto
      if(this.isMenuOpen) {
        // se sim executar o toggle
        this._setTitle.isMenuOpen.subscribe((_) => this.isMenuOpen = _);
        this._sidebarService.toggle();
      }
    }
  }
}
