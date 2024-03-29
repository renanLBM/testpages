import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Pages } from '../models/enums/enumPages';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class MotoristaGuard implements CanLoad {
  constructor(private _userService: UserService, private _route: Router) {}
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    let nivelLogin = this._userService.getNivel();
    const nivel = Pages[nivelLogin] || '';
    if (!['motorista', 'pcp'].includes(nivel)) {
      this._route.navigate(['login']);
      return false;
    }
    return true;
  }
}
