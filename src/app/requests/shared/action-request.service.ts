import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { timer } from 'rxjs/observable/timer';
import { first, takeUntil } from 'rxjs/operators';

import { AngularFirestoreService } from '../../shared';
import { ActionRequest } from './action-request.model';

@Injectable()
export class ActionRequestService {
  private actionRequestsPath = '/actionRequests';
  private defaultAssignee = 'bill@premier-pump.net';
  private initialCounter = 1000;
  private prefix = 'AR';

  constructor(private afs: AngularFirestoreService) { }

  getActionRequest(actionRequestKey: string): Observable<ActionRequest> {
    const databasePath = `${this.actionRequestsPath}/${actionRequestKey}`;
    return this.afs.doc<ActionRequest>(databasePath);
  }

  getActionRequests(): Observable<ActionRequest[]> {
    return this.afs.collection<ActionRequest>(
      this.actionRequestsPath, ref => ref.orderBy('createdAt', 'desc').limit(200)
    );
  }

  getOpenActionRequests(): Observable<ActionRequest[]> {
    return this.afs.collection<ActionRequest>(
      this.actionRequestsPath, ref => ref.where('status', '==', 'new').orderBy('createdAt', 'desc').limit(200)
    );
  }

  create(actionRequest: ActionRequest): Promise<ActionRequest> {
    return this
      ._incrementCounter(300)
      .then(() => this._incrementCounter())
      .then(counter => this.afs.add<ActionRequest>(
        this.actionRequestsPath, {
          ...actionRequest,
          assignee: this.defaultAssignee,
          humanReadableCode: this.addPrefix(counter)
        }
      ));
  }

  set(actionRequest: ActionRequest): Promise<void> {
    return this.afs.set(`${this.actionRequestsPath}/${actionRequest.key}`, actionRequest);
  }

  update(actionRequest: ActionRequest): Promise<void> {
    return this.afs.update(`${this.actionRequestsPath}/${actionRequest.key}`, actionRequest);
  }

  delete(actionRequestKey: string): Promise<void> {
    return this.afs.delete(`${this.actionRequestsPath}/${actionRequestKey}`);
  }

  addPrefix(counter: number): string {
    return `${this.prefix}${counter}`;
  }

  removePrefix(code: string): number {
    return +code.split(this.prefix)[1];
  }

  _incrementCounter(delay = 1000): Promise<number> {
    return this.afs
      .collection<ActionRequest>(this.actionRequestsPath, ref => ref.orderBy('humanReadableCode', 'desc').limit(1))
      .pipe(
        takeUntil(timer(delay))
      )
      .toPromise()
      .then(actionRequests => (actionRequests && actionRequests.length)
        ? this.removePrefix(actionRequests[0].humanReadableCode) + 1
        : this.initialCounter
      );
  }
}
