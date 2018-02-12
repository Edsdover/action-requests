import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import 'rxjs/add/operator/first';
import { Observable } from 'rxjs/Observable';

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
    this.route.params.subscribe((params: Params) => {
      this.requestKey = params['key'];

      if (this.requestKey) {
        this.actionRequestService
          .getActionRequest(this.requestKey)
          .first()
          .subscribe((request: ActionRequest) => this.request = request);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  save(request: ActionRequest): void {
    this.actionRequestService
      .update(request)
      .then(() => this.router.navigate(['requests', this.requestKey]));
  }

}
