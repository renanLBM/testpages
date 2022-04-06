import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbThemeService } from '@nebular/theme';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'fc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() checked = false;
  isLoggedIn!: boolean;

  constructor(
    private themeService: NbThemeService,
    private _userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this._userService.getLogged().subscribe((value) => {
      this.isLoggedIn = value;
    });
    this.isLoggedIn = this._userService.isLogged();
  }

  toggleTheme(): void {
    this.checked = !this.checked;
    if (this.checked) {
      this.themeService.changeTheme('cosmic');
    } else {
      this.themeService.changeTheme('default');
    }
  }

  sair() {
    this._userService.logout();
    this.router.navigateByUrl('');
  }
}
