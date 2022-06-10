import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(private _userService: UserService, private _route: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    if (this._userService.isLogged()) {
      let nivel = this._userService.getNivel();
      if (nivel == 1) {
        this._route.navigate(['auditor']);
      } else if (nivel == 2 || nivel == 99) {
        this._route.navigate(['pcp']);
      }
      return false;
    }
    return true;
  }
}
