import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import {
  NbSidebarService,
  NbThemeService
} from '@nebular/theme';
import { Pages } from 'src/app/models/enums/enumPages';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from '../../set-title-service.service';

@Component({
  selector: 'fc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  headerTitle: string = 'FacControl';
  showIcon: boolean = false;
  showMenu: boolean = false;
  isLoggedIn!: boolean;
  adm: boolean = false;
  singleSelectGroupValue = [];

  isMenuOpen!: boolean;

  @Input() checked: boolean = true;

  constructor(
    private _sidebarService: NbSidebarService,
    private _themeService: NbThemeService,
    private _setTitle: SetTitleServiceService,
    private _userService: UserService,
    private _router: Router,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._setTitle.title.subscribe((t) => {
      let n = this._userService.getNivel() || 0;
      this.adm = n == Pages['pcp'];
      this.headerTitle = t;
      this.showIcon = true;

      this.showMenu = n == Pages['motorista'] ? false : true;

      if (
        this.headerTitle.includes('Acessar')
      ) {
        this.showIcon = false;
      }
    });
    this._userService.getLogged().subscribe((value) => {
      this.isLoggedIn = value;
    });
    this.isLoggedIn = this._userService.isLogged();
  }

  updateSingleSelectGroupValue(value: any): void {
    this.singleSelectGroupValue = value;
    this._cd.markForCheck();
  }

  toggleTheme(): void {
    this.checked = !this.checked;
    if (this.checked) {
      this._themeService.changeTheme('default');
    } else {
      this._themeService.changeTheme('dark');
    }
  }

  toggleSidebar(): void {
    this._setTitle.isMenuOpen.subscribe((_) => this.isMenuOpen = _);
    this._setTitle.isMenuOpen.next(!this.isMenuOpen);

    this._sidebarService.toggle();
  }

  sair() {
    this.showIcon = false;
    this._userService.logout();
    this._router.navigateByUrl('');
  }
}
