import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { GoogleAuthProvider } from 'firebase/auth';
import { take } from 'rxjs';
import { User } from '../models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedUser!: User;

  constructor(
    private toastrService: NbToastrService,
    private _router: Router,
    private _userService: UserService,
    private _auth: AngularFireAuth
  ) {}

  // onLogin(email: string, password: string) {
  //   this._auth
  //     .signInWithEmailAndPassword(email, password)
  //     .then((credential) => {
  //       this.checkUserData(credential.user as User);
  //     })
  //     .catch((err) => {
  //       let error = (err + '')
  //         .split('.')[0]
  //         .replace('FirebaseError: Firebase: ', '');
  //       if (
  //         error == 'There is no user record corresponding to this identifier'
  //       ) {
  //         error = 'Usuário não cadastrado.';
  //       } else if (error == 'The email address is badly formatted') {
  //         error = 'E-mail com formato inválido';
  //       } else if (
  //         error ==
  //         'The password is invalid or the user does not have a password'
  //       )
  //         error = 'Usuário ou senha incorreto';
  // this.toastrService.danger('Erro ao enviar a solicitação!', 'Erro!!!', {
  //   preventDuplicates: true,
  // });
  //       this.logout(true);
  //     });
  // }

  onLoginWithGoogle() {
    let googleAuthProvider = new GoogleAuthProvider();
    googleAuthProvider.setCustomParameters({
      prompt: 'select_account',
    });
    this._auth
      .signInWithPopup(googleAuthProvider)
      .then((credential) => {
        this.checkUserData(credential.user as User);
      })
      .catch((err) => {
        if (
          (err + '').includes(
            'The popup has been closed by the user before finalizing the operation'
          )
        ) {
          return;
        }
        this.logout(true);
        this.toastrService.danger('Erro ao enviar a solicitação!', 'Erro!!!', {
          preventDuplicates: true,
        });
      });
  }

  checkUserData(user: User) {
    // check domain
    const domain = user.email!.split('@')[1];
    if (domain !== 'labellamafia.com.br') {
      throw 'Dominio não aceito!';
    }

    user = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName?.toString() || '',
    };

    // get user from db
    this._userService
      .getUserFromDB(user)
      .pipe(take(1))
      .subscribe({
        next: (x) => {
          if (x.body.message != 'User logged!') {
            // inserir UID no banco

            const displayNameUser =
              user.displayName == null ? user.email : user.displayName;
            const data: User = {
              uid: user.uid,
              email: user.email,
              displayName: displayNameUser,
              role: 'Auditor',
              active: '1',
              nome: displayNameUser?.toString().replace(' ', '.'),
              nivel: 1,
            };
          }

          if (!this._userService.isLogged()) {
            this.toastrService.danger(
              'Erro ao enviar ao efetuar login!',
              'Erro!',
              {
                preventDuplicates: true,
              }
            );
            this.logout(true);
          } else {
            this._userService
              .getUser()
              .pipe(take(1))
              .subscribe((_) => {
                if (_.active != '1') {
                  this.logout(true);
                  this.toastrService.danger(
                    'Erro ao enviar ao efetuar login!',
                    'Erro!',
                    {
                      preventDuplicates: true,
                    }
                  );
                } else {
                  this.toastrService.success(
                    'Login efetuado com sucesso!',
                    'Sucesso!',
                    {
                      preventDuplicates: true,
                    }
                  );
                }
                return this._router.navigate(['']);
              });
          }
          return this._router.navigate(['pcp']);
        },
        error: (e) => {
          console.warn(e);
          this.logout();
        },
      });
  }

  logout(err?: boolean) {
    if (err) {
      this._auth.signOut().then(() => {
        this._router.navigate(['login']);
      });
      this._userService.logout();
      return;
    }
    this._auth.signOut().then(() => {
      this._router.navigate(['login']);
      this.toastrService.warning('Sair!', 'Logout', {
        preventDuplicates: true,
      });
    });
    this._userService.logout();
  }
}
