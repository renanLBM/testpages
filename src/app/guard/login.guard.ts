import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { Pages } from '../models/enums/enumPages';
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
      let finalRoute = Pages[nivel];

      if (nivel == 4 || nivel == 0) {
        finalRoute = 'auditor';
      }
      this._route.navigate([finalRoute]);
      return false;
    }
    return true;
  }
}
