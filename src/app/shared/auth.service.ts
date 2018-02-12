import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService {
  currentUser: firebase.User;
  user$: Observable<firebase.User>;

  constructor(public auth: AngularFireAuth) {
    this.user$ = auth.authState;
    this.user$.subscribe((user: firebase.User) => this.currentUser = user);
  }

  login() {
    this.auth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
  }

  logout() {
    this.auth.auth.signOut();
  }

}
