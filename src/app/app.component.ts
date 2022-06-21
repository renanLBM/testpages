import { AfterContentChecked, Component } from '@angular/core';
import { NbMenuItem, NbSidebarService } from '@nebular/theme';
import { UserService } from './services/user.service';
import { SetTitleServiceService } from './shared/set-title-service.service';

@Component({
  selector: 'fc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterContentChecked {
  title = 'facControl';

  items: NbMenuItem[] = [
    {
      title: 'PCP',
      icon: 'keypad-outline',
      // link: './pcp',
      // expanded: true,
      children: [
        {
          title: 'Gerencial',
          link: './pcp'
        },
        // {
        //   title: 'Em andamento',
        //   link: './pcp/descricao/Em andamento'
        // },
        // {
        //   title: 'Em atraso',
        //   link: './pcp/descricao/Em atraso'
        // },
      ],
    },
    {
      title: 'Auditor',
      link: './auditor',
      icon: 'file-text-outline',
    },
    {
      title: 'Motorista',
      link: './motorista',
      icon: 'car-outline',
    },
  ];

  isLoggedIn!: boolean;
  adm: boolean = false;

  constructor(
    private _sidebarService: NbSidebarService,
    private _setTitle: SetTitleServiceService,
    private _userService: UserService
  ) {}

  ngAfterContentChecked(): void {
    this._setTitle.title.subscribe((t) => {
      let n = this._userService.getNivel() || 0;
      this.adm = n == 99;
    });
    this.isLoggedIn = this._userService.isLogged();
  }

  toggle(): void {
    this._sidebarService.toggle();
  }
}
