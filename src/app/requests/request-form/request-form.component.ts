import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import * as hash from 'object-hash';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatMap';
import { Observable } from 'rxjs/Observable';

import { Upload, UploadService } from '../../uploads';
import { ActionRequest } from '../shared';

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
    '.pdf',
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
    private location: Location,
    private uploadService: UploadService
  ) { }

  ngOnInit() {
    this.getAttachments();
  }

  getAttachments(): void {
    // this.attachments = this.request.attachmentHashes
    //   .map((attachmentHash: string) => this.uploadService.getUploadByHash(attachmentHash));
    // this.attachments = this.request.attachmentUrls;
  }

  goBack(): void {
    this.location.back();
  }

  processFiles(event): void {
    const selectedFiles = event.target.files;

    if (!selectedFiles.length) {
      return;
    }

    for (const file of selectedFiles) {
      const upload = new Upload(file);
      // if (upload.file.type === 'application/pdf') {
      //   upload.thumbUrl = 'assets/pdf.jpg';
      // } else if (upload.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      //   upload.thumbUrl = 'assets/word.png';
      // } else {
      //   upload.thumbUrl = upload.url;
      // }

      this.currentUpload = upload;
      this.uploadService.push(upload);
      this.request.attachmentHashes.push(upload.fileHash);
      this.uploads.push(upload);
    }

    this.getAttachments();
  }

  save(): void {
    this.isSaving = true;

    for (const upload of this.uploads) {
      // if (upload.file.type === 'application/pdf') {
      //   upload.thumbUrl = 'assets/pdf.jpg';
      //   this.request.attachmentUrls.push('assets/pdf.jpg');
      // } else if (upload.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      //   upload.thumbUrl = 'assets/word.png';
      //   this.request.attachmentUrls.push('assets/word.png');
      // } else {
      //   upload.thumbUrl = upload.url;
      //   this.request.attachmentUrls.push(upload.url);
      // }
      this.request.attachmentUrls.push(upload.url);
    }

    this.onSave.emit(this.request);

    // HACK: reset form after 1.5 seconds to allow time for the Firebase save to complete

    setTimeout(() => {
      this.currentUpload = this.attachments = undefined;
      this.uploads = [];
      this.request = new ActionRequest();
      this.requestForm.resetForm();
    }, 1400);

    setTimeout(() => {
      this.isSaving = false;
      this.request.status = null;
      this.request.status = 'new';
    }, 1500);
  }

}
