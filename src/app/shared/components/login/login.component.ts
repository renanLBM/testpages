import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from '../../set-title-service.service';

@Component({
  selector: 'fc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  usuario = '';
  senha = '';

  constructor(
    private _router: Router,
    private _setTitle: SetTitleServiceService,
    private _userService: UserService,
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('FacControl - Login');
  }

  login() {
    this._userService.login(this.usuario, this.senha).subscribe({
      next: (x) => {
        let nivel = JSON.parse(x.body).nivel;
        if (nivel == 1) {
          this._router.navigate(['auditor']);
        } else {
          this._router.navigate(['pcp']);
        }
      },
      error: (err) => {
        this._router.navigate(['login']);
        alert('Erro de login ou senha!');
        console.log('error log', err);
      },
    });
  }

}
