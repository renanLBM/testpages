import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pages } from 'src/app/models/enums/enumPages';
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
  nivel = 0;

  constructor(
    private _router: Router,
    private _setTitle: SetTitleServiceService,
    private _userService: UserService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('FacçãoControl - Acessar');
  }

  login() {
    this._setTitle.setTitle('Verificando usuário...');
    this._userService.login(this.usuario, this.senha).subscribe({
      next: (user) => {
        this._userService.getUser().subscribe((userLoggin) => this.nivel = userLoggin.nivel);
        let finalRoute = Pages[this.nivel];

        if (this.nivel == 4) {
          finalRoute = 'auditor';
        }
        this._router.navigate([finalRoute]);
      },
      error: (err) => {
        this._setTitle.setTitle('FacControl - Acessar');
        this._router.navigate(['login']);
        alert('Erro de login ou senha!');
      },
    });
  }
}
