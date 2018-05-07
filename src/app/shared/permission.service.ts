import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError, concatMap, map } from 'rxjs/operators';


import { AuthService } from './auth.service';

@Injectable()
export class PermissionService {

  constructor(
    public authService: AuthService
  ) { }

  private handleError(): Observable<boolean> {
    return observableOf(false);
  }

  isAdmin(): Observable<boolean> {
    return observableOf(true);
  }

  isAuthenticated(): Observable<boolean> {
    return this.authService.user$.map(user => !!user);
  }

}
