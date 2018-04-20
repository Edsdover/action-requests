import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { flow, sortBy } from 'lodash/fp';
import { Subscription } from 'rxjs/Subscription';

import { ActionRequest, ActionRequestService } from '../shared';
import { XlsxService } from '../../shared/xlsx.service';

@Component({
  selector: 'app-request-data-table',
  templateUrl: './request-data-table.component.html',
  styleUrls: ['./request-data-table.component.css']
})
export class RequestDataTableComponent implements OnInit, AfterViewInit {
  activeSubscription: Subscription;
  checked = false;
  dataSource = new MatTableDataSource<ActionRequest>();
  displayedColumns: string[] = [];
  tinyScreenColumns = [
    'salesOrderNumber',
    'reporter',
    'status'
  ];
  smallScreenColumns = [
    'salesOrderNumber',
    'createdAt',
    'reporter',
    'assignee',
    'status'
  ];
  largeScreenColumns = [
    'humanReadableCode',
    'salesOrderNumber',
    'createdAtVerbose',
    'reporter',
    'assignee',
    'category',
    'attachments',
    'approvedActionPlan',
    'status'
  ];
  loading = true;
  urgentColumn: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private actionRequestService: ActionRequestService,
    private router: Router,
    private xlsxService: XlsxService
  ) { }

  ngOnInit() {
    this.activeSubscription = this.actionRequestService.getOpenActionRequests().subscribe(actionRequests => {
      this.dataSource.data = actionRequests;
      this.loading = false;
    });
    this.displayedColumns = this.calculateColumns(window.innerWidth);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // remove whitespace
    filterValue = filterValue.toLowerCase(); // datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  calculateColumns(windowWidth: number): string[] {
    if (windowWidth >= 1299) {
      this.urgentColumn = 'humanReadableCode';
      return this.largeScreenColumns;
    }
    if (windowWidth > 599 && windowWidth < 1299) {
      this.urgentColumn = 'salesOrderNumber';
      return this.smallScreenColumns;
    }
    this.urgentColumn = 'salesOrderNumber';
    return this.tinyScreenColumns;
  }

  export(): void {
    const spreadsheet = flow([sortBy('No.')])(this.dataSource.data.map((actionRequest: ActionRequest) => {
      return {
        'No.': actionRequest.humanReadableCode,
        'Sales Order': actionRequest.salesOrderNumber,
        'Created': actionRequest.createdAt,
        'Updated': actionRequest.updatedAt,
        'Reporter': actionRequest.reporter,
        'Assignee': actionRequest.assignee,
        'Category': this._titlecase(actionRequest.category),
        'ECN': actionRequest.ecn,
        'Attachments': !!(actionRequest.attachments && actionRequest.attachments.length),
        'Urgent': !!actionRequest.isUrgent,
        'Status': this._titlecase(actionRequest.status),
        'Discrepancy': actionRequest.discrepancy,
        'Action Plan': actionRequest.approvedActionPlan,
        'Resolution': actionRequest.resolution
      };
    }));

    this.xlsxService.export(spreadsheet);
  }

  gotoRequest(request: ActionRequest): void {
    this.router.navigate(['requests', request.key]);
  }

  toggleOpenActionRequests(): void {
    if (this.checked) {
      this.loading = true;
      this.activeSubscription.unsubscribe();
      this.activeSubscription = this.actionRequestService.getActionRequests().subscribe(actionRequests => {
        this.dataSource.data = actionRequests;
        this.loading = false;
      });
    } else {
      this.activeSubscription.unsubscribe();
      this.activeSubscription = this.actionRequestService.getOpenActionRequests().subscribe(actionRequests => {
        this.dataSource.data = actionRequests;
        this.loading = false;
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.displayedColumns = this.calculateColumns(event.target.innerWidth);
  }

  _titlecase(str) {
    if (!str) { return ''; }
    return str.replace(/\b\S/g, function(t) { return t.toUpperCase(); });
  }
}
