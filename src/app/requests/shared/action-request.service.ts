import { Injectable } from '@angular/core';
import { flow, orderBy } from 'lodash/fp';
import { Observable } from 'rxjs/Observable';
import { timer } from 'rxjs/observable/timer';
import { first, map, takeUntil } from 'rxjs/operators';

import { AngularFirestoreService } from '../../shared';
import { ActionRequest } from './action-request.model';

@Injectable()
export class ActionRequestService {
  private actionRequestsPath = '/actionRequests';
  private defaultEmailDomain = 'premier-pump.net';
  private initialCounter = 1000;
  private prefix = 'AR';

  constructor(private afs: AngularFirestoreService) { }

  getActionRequest(actionRequestKey: string): Observable<ActionRequest> {
    const databasePath = `${this.actionRequestsPath}/${actionRequestKey}`;
    return this.afs.doc<ActionRequest>(databasePath);
  }

  getActionRequests(limit = 10000): Observable<ActionRequest[]> {
    return this.afs.collection<ActionRequest>(
      this.actionRequestsPath, ref => ref.orderBy('createdAt', 'desc').limit(limit)
    );
  }

  getOpenActionRequests(limit = 10000): Observable<ActionRequest[]> {
    return this.afs.collection<ActionRequest>(
      this.actionRequestsPath, ref => ref.where('status', '<=', 'new').limit(limit)
    ).pipe(
      map((actionRequests: ActionRequest[]) => flow([orderBy('createdAt', 'desc')])(actionRequests))
    );
  }

  create(actionRequest: ActionRequest): Promise<ActionRequest> {
    return this
      ._incrementCounter(300)
      .then(() => this._incrementCounter())
      .then(counter => this.afs.add<ActionRequest>(
        this.actionRequestsPath, {
          ...actionRequest,
          assignee: this._formatEmailAddress(actionRequest.assignee),
          reporter: this._formatReporter(actionRequest.reporter),
          watchers: this._populateWatchers(actionRequest),
          humanReadableCode: this.addPrefix(counter)
        }
      ));
  }

  set(actionRequest: ActionRequest): Promise<void> {
    return this.afs.set(`${this.actionRequestsPath}/${actionRequest.key}`, actionRequest);
  }

  update(actionRequest: ActionRequest): Promise<void> {
    return this.afs.update(`${this.actionRequestsPath}/${actionRequest.key}`, {
      ...actionRequest,
      assignee: this._formatEmailAddress(actionRequest.assignee),
      reporter: this._formatReporter(actionRequest.reporter)
    });
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

  _formatReporter(reporter: string): string {
    if (!reporter.includes('@') && reporter.trim().includes(' ')) {
      return reporter.trim();
    }

    return this._formatEmailAddress(reporter);
  }

  _formatEmailAddress(addressee: string): string {
    const safeAddressee = addressee.replace(/ /g, '');
    if (safeAddressee.includes('@')) {
      return safeAddressee.trim().toLowerCase();
    }
    return `${safeAddressee}@${this.defaultEmailDomain}`.trim().toLowerCase();
  }

  _populateWatchers(actionRequest: ActionRequest): string[] {
    const watchers = [ this._formatEmailAddress(actionRequest.assignee) ];

    if (!actionRequest.reporter.trim().includes(' ')) {
      watchers.push(this._formatEmailAddress(actionRequest.reporter));
    }

    return watchers;
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
