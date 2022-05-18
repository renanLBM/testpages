import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { NbRouteTab } from '@nebular/theme';
import { UserService } from './services/user.service';
import { SetTitleServiceService } from './shared/set-title-service.service';

@Component({
  selector: 'fc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterContentChecked {
  title = 'facControl';

  tabs: NbRouteTab[] = [
    {
      title: 'PCP',
      // icon: 'person',
      route: ['./pcp'],
    },
    {
      title: 'Auditor',
      // icon: 'paper-plane-outline',
      responsive: true,
      route: ['./auditor'],
    },
    // {
    //   title: 'Query params',
    //   icon: 'flash-outline',
    //   responsive: true,
    //   disabled: false,
    //   route: './tab3',
    //   queryParams: { param1: 123456, param2: 'test' },
    // },
  ];

  isLoggedIn!: boolean;
  adm: boolean = false;

  constructor(
    private _setTitle: SetTitleServiceService,
    private _userService: UserService,
  ) {}

  ngAfterContentChecked(): void {
    this._setTitle.title.subscribe((t) => {
      let n = this._userService.getNivel() || 0;
      this.adm = n == 99;
    });
    this.isLoggedIn = this._userService.isLogged();
  }
}
