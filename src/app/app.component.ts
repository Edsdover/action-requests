import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

import { AuthService, PermissionService } from './shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Action Requests';
  isAdmin$: Observable<boolean>;
  user$: Observable<firebase.User>;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) {
    this.isAdmin$ = this.permissionService.isAdmin();
    this.user$ = this.authService.user$;
  }

  goHome(): void {
    this.router.navigate(['']);
  }

  gotoRequests(): void {
    this.router.navigate(['requests']);
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }
}
