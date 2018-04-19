import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import * as hash from 'object-hash';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatMap';
import { Observable } from 'rxjs/Observable';
import { interval } from 'rxjs/observable/interval';
import { map, startWith } from 'rxjs/operators';
import { FileSystemFileEntry, UploadEvent } from 'ngx-file-drop';

import { Upload, UploadService } from '../../uploads';
import { ActionRequest, ActionRequestService } from '../shared';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.css']
})
export class RequestFormComponent implements OnInit {
  currentUpload: Upload;
  attachments: Observable<Upload>[];
  uploads: Upload[] = [];
  isSaving = false;

  assigneeControl: FormControl = new FormControl();
  assigneeOptions: string[] = [];
  filteredAssignees: Observable<string[]>;

  reporterControl: FormControl = new FormControl();
  reporterOptions: string[] = [];
  filteredReporters: Observable<string[]>;

  acceptedFileTypes = [
    'application/msword',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/xml',
    'image/*',
    'text/csv',
    '.csv',
    '.doc',
    '.docx',
    '.gif',
    '.jpg',
    '.pdf',
    '.png',
    '.txt',
    '.xls',
    '.xlsx'
  ];

  @Input() request: ActionRequest;
  @Input() showBackButton = false;
  @Input() title: string;

  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter();

  @ViewChild('requestForm') requestForm: NgForm;

  categories = [
    'admin', 'assembly', 'engineering', 'priority', 'purchasing', 'shipping', 'vendor', 'welding'
  ];
  statuses = [
    'new',
    'approved',
    'resolved'
  ];

  constructor(
    private actionRequestService: ActionRequestService,
    private ref: ChangeDetectorRef,
    private location: Location,
    private uploadService: UploadService
  ) { }

  ngOnInit() {
    const tick = interval(3000); // run check every 3 seconds
    const subscription = tick.subscribe(() => {
      if (this.currentUpload && this.currentUpload.progress === 100) {
        setTimeout(() => {
          this.currentUpload = undefined;
        }, 3500);
      }
    });

    this.actionRequestService.getActionRequests(250).subscribe(actionRequests => {
      this.assigneeOptions = Array.from(new Set(actionRequests
        .map(actionRequest => actionRequest.assignee ? actionRequest.assignee.toLowerCase() : null)
        .filter(assignee => assignee)
        .sort()
      ));

      this.reporterOptions = Array.from(new Set(actionRequests
        .map(actionRequest => actionRequest.reporter ? actionRequest.reporter.toLowerCase() : null)
        .filter(assignee => assignee)
        .sort()
      ));
    });

    this.filteredAssignees = this.assigneeControl.valueChanges
      .pipe(
        startWith(''),
        map(val => this.filterAssignees(val))
      );

    this.filteredReporters = this.reporterControl.valueChanges
      .pipe(
        startWith(''),
        map(val => this.filterReporters(val))
      );
  }

  filterAssignees(val: string): string[] {
    return this.assigneeOptions.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  filterReporters(val: string): string[] {
    return this.reporterOptions.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  goBack(): void {
    this.location.back();
  }

  droppedFiles(event: UploadEvent): void {
    for (const droppedFile of event.files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => this.uploadFile(file));
      }
    }
  }

  processFiles(event): void {
    const selectedFiles = event.target.files;

    if (!selectedFiles.length) {
      return;
    }

    for (const file of selectedFiles) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File): void {
    const upload = new Upload(file);

    this.currentUpload = upload;
    this.uploadService.push(upload);
    this.request.attachmentHashes.push(upload.fileHash);
    this.uploads.push(upload);
  }

  save(): void {
    this.isSaving = true;
    this.requestForm.control.disable();
    this.ref.detectChanges();
    this.ref.detach();

    for (const upload of this.uploads) {
      this.request.attachments.push({
        filename: upload.file.name,
        attachmentUrl: upload.url,
        thumbUrl: upload.thumbUrl || upload.url
      });
    }

    this.onSave.emit(this.request);

    // HACK: reset form after 1.5 seconds to allow time for the Firebase save to complete

    setTimeout(() => {
      this.currentUpload = this.attachments = undefined;
      this.uploads = [];
      this.request = new ActionRequest();
      this.requestForm.resetForm();
      this.ref.reattach();
      this.requestForm.control.enable();
    }, 1400);

    setTimeout(() => {
      this.isSaving = false;
      this.request.status = null;
      this.request.status = 'new';
      this.ref.reattach();
      this.requestForm.control.enable();
    }, 1500);
  }

}
