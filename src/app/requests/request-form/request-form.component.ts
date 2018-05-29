import { Location } from '@angular/common';
import {
  ApplicationRef, ChangeDetectorRef, Component, EventEmitter, Input, Output, OnInit, NgZone, ViewChild, OnChanges, DoCheck
} from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatMap';
import { Observable } from 'rxjs/Observable';
import { interval } from 'rxjs/observable/interval';
import { range } from 'rxjs/observable/range';
import { delay, map, startWith, take } from 'rxjs/operators';
import { FileSystemFileEntry, UploadEvent } from 'ngx-file-drop';

import { environment } from '../../../environments/environment';
import { Upload, UploadService } from '../../uploads';
import { ActionRequest, ActionRequestService } from '../shared';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.css']
})
export class RequestFormComponent implements OnInit, DoCheck {
  clearInProgress = false;
  debug: Observable<string>;
  env = environment;
  increment: any = '...';

  currentUpload: Upload;
  attachments: Observable<Upload>[];
  uploads: Upload[] = [];
  isSaving = false;

  actionRequestNumbers: string[];

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
    '.dwg', // autocad
    '.dwt', // autocad
    '.dxf', // autocad
    '.eml', // outlook
    '.gif',
    '.jpg',
    '.msg',
    '.pdf',
    '.png',
    '.pst', // outlook
    '.tif',
    '.tiff',
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
    private app: ApplicationRef,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private location: Location,
    private ngZone: NgZone,
    private uploadService: UploadService
  ) { }

  ngOnInit() {
    this.actionRequestService.getActionRequests(250).subscribe(actionRequests => {
      this.actionRequestNumbers = Array.from(new Set(actionRequests
        .map(actionRequest => actionRequest.humanReadableCode || null)
        .filter(humanReadableCode => humanReadableCode)
        .sort()
        .reverse()
      ));

      this.assigneeOptions = Array.from(new Set(actionRequests
        .map(actionRequest => actionRequest.assignee ? actionRequest.assignee.toLowerCase() : null)
        .filter(assignee => assignee)
        .sort()
      ));

      this.reporterOptions = Array.from(new Set(actionRequests
        .map(actionRequest => actionRequest.reporter || null)
        .filter(reporter => reporter)
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

    this.reloadPageEvery30Minutes();

    // this.app.isStable.subscribe((isStable) => console.log('isStable', isStable));

    this.debug = this.route
      .queryParamMap
      .pipe(
        map(params => params.get('debug'))
      );
  }

  ngDoCheck(): void {
    if (!this.clearInProgress && this.currentUpload && this.currentUpload.progress === 100) {
      this.clearInProgress = true;
      setTimeout(() => {
        this.currentUpload = undefined;
        this.clearInProgress = false;
      }, 3500);
    }
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
    this.refreshFor90seconds();

    if (!this.currentUpload) {
      this.currentUpload = { progress: 0 } as Upload;
    }

    for (const droppedFile of event.files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => this.uploadFile(file));
      }
    }
  }

  reloadPageEvery30Minutes(): void {
    this.ngZone.runOutsideAngular(() => {
      const tick = interval(30 * 60 * 1000).pipe(take(1));
      tick.subscribe(() => {
        location.reload();
      });
    });
  }

  refreshFor90seconds(): void {
    // run check every 3 seconds for 90 seconds
    const tick = interval(3000).pipe(take(30));

    const subscription = tick.subscribe(() => {
      this.app.tick();
      if (!this.currentUpload) {
        subscription.unsubscribe();
      }
    });

    // this.ngZone.runOutsideAngular(() => {
    //   const tick = interval(3000); // run check every 3 seconds
    //   const subscription = tick.subscribe(() => {
    //     if (this.currentUpload && this.currentUpload.progress === 100) {
    //       setTimeout(() => {
    //         this.ngZone.run(() => {
    //           this.currentUpload = undefined;
    //         });
    //       }, 3500);
    //     }
    //     this.ngZone.run(() => {
    //       this.app.tick();
    //     });
    //   });
    // });
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
    this.uploads.push(upload);
  }

  resetForm(): void {
    // HACK: reset form after 1.5 seconds to allow time for the Firebase save to complete

    setTimeout(() => {
      this.currentUpload = this.attachments = undefined;
      this.uploads = [];
      this.request = new ActionRequest();
      this.requestForm.resetForm();
      this.assigneeControl.setValue('');
      this.assigneeControl.markAsPristine();
      this.assigneeControl.markAsUntouched();
      this.reporterControl.setValue('');
      this.reporterControl.markAsPristine();
      this.reporterControl.markAsUntouched();
      this.ref.reattach();
      this.requestForm.control.enable();
    }, 1900);

    setTimeout(() => {
      this.isSaving = false;
      this.request.status = null;
      this.request.status = 'new';
      this.ref.reattach();
      this.requestForm.control.enable();
    }, 2000);
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

    if (!this.request.humanReadableCode && this.actionRequestNumbers && this.actionRequestNumbers.length) {
      this.request.humanReadableCode = this.actionRequestNumbers[0];
    }

    this.onSave.emit(this.request);

    this.resetForm();
  }

  checkIncrement() {
    this.increment = '...';
    this.actionRequestService
      ._incrementCounter(300)
      .then(() => this.actionRequestService._incrementCounter())
      .then(value => this.increment = value);
  }
}
