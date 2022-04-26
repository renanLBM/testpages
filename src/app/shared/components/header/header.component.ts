import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbMenuItem, NbThemeService } from '@nebular/theme';
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
  nivel = 0;

  @Input() checked: boolean = true;

  constructor(
    private themeService: NbThemeService,
    private _setTitle: SetTitleServiceService,
    private _userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.nivel = this._userService.getNivel();
    this._setTitle.title.subscribe((t) => {
      this.headerTitle = t;
      this.showIcon = true;
      if (this.headerTitle.includes('Login')) {
        this.showIcon = false;
      }
    });
    this._userService.getLogged().subscribe((value) => {
      this.isLoggedIn = value;
    });
    this.isLoggedIn = this._userService.isLogged();
  }

  toggleTheme(): void {
    this.checked = !this.checked;
    if (this.checked) {
      this.themeService.changeTheme('default');
    } else {
      this.themeService.changeTheme('cosmic');
    }
  }

  sair() {
    this._userService.logout();
    this.router.navigateByUrl('');
  }
}
