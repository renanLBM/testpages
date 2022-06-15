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
    this._setTitle.setTitle('FacçãoControl - Acessar');
  }

  login() {
    this._setTitle.setTitle('Verificando usuário...');
    this._userService.login(this.usuario, this.senha).subscribe({
      next: (x) => {
        let nivel = JSON.parse(x.body).nivel;
        if (nivel == 1) {
          this._router.navigate(['auditor']);
        } else if (nivel == 3) {
          this._router.navigate(['motorista']);
        } else {
          this._router.navigate(['pcp']);
        }
      },
      error: (err) => {
        this._setTitle.setTitle('FacControl - Acessar');
        this._router.navigate(['login']);
        alert('Erro de login ou senha!');
      },
    });
  }

}
