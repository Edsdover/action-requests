import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ActionRequest, ActionRequestService } from '../shared';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css']
})
export class RequestListComponent implements OnInit {
  error: any;
  requests$: Observable<ActionRequest[]>;

  constructor(
    private router: Router,
    private actionRequestService: ActionRequestService
  ) { }

  ngOnInit() {
    this.requests$ = this.actionRequestService
      .getActionRequests();
      // .map((requests: ActionRequest[]) => requests.sort((a, b) => +b.dateCreated - +a.dateCreated));
  }

  gotoRequest(request: ActionRequest): void {
    this.router.navigate(['requests', request.key]);
  }

}
