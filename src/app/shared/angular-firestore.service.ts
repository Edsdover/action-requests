import { Injectable } from '@angular/core';
import { AngularFirestore, QueryFn } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { _throw as observableThrow } from 'rxjs/observable/throw';


@Injectable()
export class AngularFirestoreService {
  // current timestamp (time since the Unix epoch, in milliseconds), as determined server-side by Firebase
  timestamp = firebase.firestore.FieldValue.serverTimestamp();

  constructor(private afs: AngularFirestore) { }

  collection<T>(databasePath: string, queryFn?: QueryFn): Observable<T[]> {
    const query = queryFn || this.limit;

    return this.afs
      .collection<T>(`${databasePath}`, query)
      .valueChanges()
      .pipe(
        catchError(this.handleAngularFirestoreListObservableError)
      );
  }

  doc<T>(databasePath: string): Observable<T> {
    return this.afs
      .doc<T>(`${databasePath}`)
      .valueChanges()
      .pipe(
        catchError(this.handleAngularFirestoreObjectObservableError)
      );
  }

  add<T>(databasePath: string, data: {}): Promise<T> {
    const pushKey = this.afs.createId();
    const sanitizedData = this.sanitizeProperties({
      key: pushKey, ...data, createdAt: this.timestamp, updatedAt: this.timestamp
    });

    return this.afs
      .doc(`${databasePath}/${pushKey}`)
      .set(sanitizedData)
      .then(() => sanitizedData as T)
      .catch(this.handleFirebasePromiseError);
  }

  set(databasePath: string, data: {}): Promise<void> {
    const sanitizedData = this.sanitizeProperties({ ...data, updatedAt: this.timestamp });

    return this.afs
      .doc(`${databasePath}`)
      .set(sanitizedData)
      .catch(this.handleFirebasePromiseError);
  }

  update(databasePath: string, data: {}): Promise<void> {
    const sanitizedData = this.sanitizeProperties({ ...data, updatedAt: this.timestamp });

    return this.afs
      .doc(`${databasePath}`)
      .update(sanitizedData)
      .catch(this.handleFirebasePromiseError);
  }

  delete(databasePath: string): Promise<void> {
    return this.afs
      .doc(`${databasePath}`)
      .delete()
      .catch(this.handleFirebasePromiseError);
  }

  private handleAngularFirestoreListObservableError(error: any) {
    const errorDetails: string = (error && error.message)
      ? error.message
      : error && error.toString();
    const errorMessage = `Error occurred fetching list observable from Firebase: ${errorDetails}`;

    console.error(errorMessage);
    return observableThrow(errorMessage);
  }

  private handleAngularFirestoreObjectObservableError(error: any) {
    const errorDetails: string = (error && error.message)
      ? error.message
      : error && error.toString();
    const errorMessage = `Error occurred fetching object observable from Firebase: ${errorDetails}`;

    console.error(errorMessage);
    return observableThrow(errorMessage);
  }

  /**
   * TODO: Add remote logging to centrally capture and monitor errors.
   */
  private handleFirebasePromiseError(error: any): Promise<any> {
    const errorDetails: string = (error && error.message)
      ? error.message
      : error && error.toString();
    const errorMessage = `Error occured writing to Firebase: ${errorDetails}`;

    console.error(errorMessage);
    return Promise.reject(errorMessage);
  }

  /**
   * Provide a sane default upper limit for number of database records returned (when not specified).
   */
  private limit(ref: firebase.firestore.CollectionReference) {
    return ref.limit(1000);
  }

  /**
   * Replace any and all undefined properties with null values.
   * Why? Firebase will throw an error and refuse to save objects with undefined properties.
   */
  private sanitizeProperties(data: {}): {} {
    for (const prop in data) {
      if (prop === undefined) {
        data[prop] = null;
      }
    }
    return data;
  }

}
