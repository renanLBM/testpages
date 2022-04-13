import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class NivelGuard implements CanActivateChild {

  constructor(private _userService: UserService, private _route: Router) {}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let nivel = 0;
    this._userService.getNivel();
    if (nivel == 1) {
      this._route.navigate(['auditor']);
      // return true;
    } else if (nivel == 2) {
      this._route.navigate(['pcp']);
      // return true;
    }
    this._route.navigate(['login']);
    return false;
  }

}
