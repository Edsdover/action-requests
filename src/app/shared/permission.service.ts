import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError, concatMap, map } from 'rxjs/operators';


import { AuthService } from './auth.service';

@Injectable()
export class PermissionService {

  constructor(
    private db: AngularFireDatabase,
    public authService: AuthService
  ) { }

  private handleError(): Observable<boolean> {
    return observableOf(false);
  }

  isAdmin(): Observable<boolean> {
    return this.isAuthenticated().pipe(concatMap((isAuthenticated: boolean) => {
      if (!isAuthenticated) { return observableOf(false); }

      const userEmail = this.authService.currentUser.email;

      return this.db
        .list('/admins')
        .valueChanges()
        .pipe(
          map((admins: any[]) => isAuthenticated && !!admins.filter(admin => admin.email === userEmail).length),
          catchError(this.handleError)
        );
    }));
  }

  isAuthenticated(): Observable<boolean> {
    return this.authService.user$.map(user => !!user);
  }

}
