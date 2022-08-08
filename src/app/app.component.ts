import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { NbMenuItem, NbSidebarService } from '@nebular/theme';
import { Pages } from './models/enums/enumPages';
import { AppUpdateService } from './providers/app-update.service';
import { UserService } from './services/user.service';
import { SetTitleServiceService } from './shared/set-title-service.service';

@Component({
  selector: 'fc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, AfterContentChecked {
  title = 'facControl';
  nivelLogado = -1;
  isMenuOpen!: boolean;

  menuAuditor = [
    'Atraso',
    'Adiantamento',
    'Apontamento de Produção',
    'Pendências',
  ];
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
          expanded: true,
          children: [
            {
              title: 'Gerencial',
              link: './pcp',
            },
            // {
            //   title: 'Alterações',
            //   link: './pcp/alteracoes'
            // },
            {
              title: 'Pendências',
              link: './pcp/pendencias'
            },
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
          expanded: true,
          children: [
            {
              title: 'Lista de Facções',
              link: './auditor',
            },
            {
              title: 'Minhas Pendências',
              link: './auditor/minhas_pendencias',
            },
          ],
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
    this._setTitle.isMenuOpen.subscribe((_) => (this.isMenuOpen = _));
    let ehMenu = (event.target as HTMLElement).className.includes('menu-title');
    let btClicado = (event.target as HTMLElement).innerText;

    let ehCabecalho = btClicado == 'Auditor' || btClicado == 'PCP';
    let ehMenuSidebar = !this.menuAuditor.includes(btClicado);

    if (ehMenu && !ehCabecalho && ehMenuSidebar) {
      // se não for cabeçalho executar o toggle
      this._setTitle.isMenuOpen.next(false);
      this._sidebarService.toggle();
    } else if (this.isMenuOpen) {
      // se não clicou em span
      // verificar se o menu está aberto
      // se sim executar o toggle
      this._setTitle.isMenuOpen.subscribe((_) => (this.isMenuOpen = _));
      this._sidebarService.toggle();
    }
  }
}
