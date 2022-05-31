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
  isLoggedIn!: boolean;
  adm: boolean = false;
  singleSelectGroupValue = [];

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
      this.adm = n == 99;
      this.headerTitle = t;
      this.showIcon = true;
      if (
        this.headerTitle.includes('Login') ||
        this.headerTitle.includes('usuário')
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
    this._sidebarService.toggle();
  }

  sair() {
    this._userService.logout();
    let n = this._userService.getNivel() || 0;
    this.adm = n == 99;
    this._router.navigateByUrl('');
  }
}
