import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { ActionRequest, ActionRequestService } from '../requests';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  env = environment;
  request: ActionRequest;

  constructor(
    private snackBar: MatSnackBar,
    private actionRequestService: ActionRequestService
  ) {
    this.request = new ActionRequest();
  }

  ngOnInit() {
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 4000
    });
  }

  save(request: ActionRequest): void {
    this.actionRequestService
      .create(request)
      .then(() => this.openSnackBar('Success: Action Request submitted!'))
      .catch(error => this.openSnackBar(error));
  }
}
