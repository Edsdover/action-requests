import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { Upload, UploadService } from '../../uploads';
import { ActionRequest, ActionRequestService } from '../shared';
import { CloseConfirmationComponent } from '../close-confirmation/close-confirmation.component';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.css']
})
export class RequestDetailComponent implements OnInit {
  loading = true;
  attachments: Observable<Upload>[];
  request: ActionRequest;
  request$: Observable<ActionRequest>;
  requestKey: string;

  assigneeEditable = false;

  constructor(
    public dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private actionRequestService: ActionRequestService,
    private uploadService: UploadService
  ) { }

  ngOnInit() {
    this.getActionRequest();
  }

  closePrompt(): void {
    const dialogRef = this.dialog.open(CloseConfirmationComponent, {
      width: '500px',
      data: { resolution: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.request.resolution = result;
        this.request.status = 'resolved';
        this.resolve();
      }
    });
  }

  getActionRequest(): void {
    this.route.params.subscribe((params: Params) => {
      this.requestKey = params['key'];

      if (this.requestKey) {
        this.request$ = this.actionRequestService.getActionRequest(this.requestKey);
        this.request$.subscribe((request: ActionRequest) => {
          this.loading = false;
          this.request = request;
          this.attachments = (request && request.attachmentHashes && request.attachmentHashes.length)
            ? request.attachmentHashes.map((attachmentHash: string) => this.uploadService.getUploadByHash(attachmentHash))
            : null;
        });
      }
    });
  }

  goBack(): void {
    // this.location.back();
    this.router.navigate(['requests']);
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 4000
    });
  }

  reassign(assignee: string): void {
    const santizedAssignee = assignee.trim().toLowerCase();

    if (this.request.assignee !== santizedAssignee) {
      if (this.request.watchers && !this.request.watchers.includes(this.request.assignee)) {
        this.request.watchers.push(this.request.assignee);
      }

      this.request.assignee = santizedAssignee;
      this.save().then(() => this.openSnackBar('Success: Action Request reassigned!'));
    }
    this.assigneeEditable = false;
  }

  resolve(): void {
    this.save().then(() => this.openSnackBar('Success: Action Request resolved!'));
    // .then(() => this.goBack())
  }

  save(): Promise<void> {
    return this.actionRequestService
      .update(this.request)
      .catch(error => this.openSnackBar(error));
  }

  update(): void {
    this.router.navigate(['requests', this.requestKey, 'edit']);
  }

}
