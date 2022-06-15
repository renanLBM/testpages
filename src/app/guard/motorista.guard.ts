import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
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
    if (this._userService.getNivel() != 3 && this._userService.getNivel() != 99) {
      this._route.navigate(['login']);
      return false;
    }
    return true;
  }
}
