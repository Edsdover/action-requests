import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import 'rxjs/add/operator/first';
import { Observable } from 'rxjs/Observable';
import { concatMap, map, switchMap } from 'rxjs/operators';

import { ActionRequest, ActionRequestService } from '../shared';

@Component({
  selector: 'app-request-edit',
  templateUrl: './request-edit.component.html',
  styleUrls: ['./request-edit.component.css']
})
export class RequestEditComponent implements OnInit {
  request: ActionRequest;
  requestKey: string;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private actionRequestService: ActionRequestService
  ) { }

  ngOnInit() {
    this.getActionRequest();
  }

  getActionRequest(): void {
    const actionRequest$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.actionRequestService.getActionRequest(params.get('key')))
    );

    actionRequest$.subscribe((actionRequest: ActionRequest) => {
      this.request = actionRequest;
      this.requestKey = actionRequest.key;
    });
  }

  goBack(): void {
    // this.location.back();
    this.router.navigate(['requests', this.requestKey]);
  }

  save(request: ActionRequest): void {
    this.actionRequestService
      .update(request)
      .then(() => this.router.navigate(['requests', this.requestKey]));
  }

}
