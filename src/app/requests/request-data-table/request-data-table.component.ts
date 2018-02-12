import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';

import { ActionRequest, ActionRequestService } from '../shared';

@Component({
  selector: 'app-request-data-table',
  templateUrl: './request-data-table.component.html',
  styleUrls: ['./request-data-table.component.css']
})
export class RequestDataTableComponent implements OnInit, AfterViewInit {
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
    'photoHashes',
    'approvedActionPlan',
    'status'
  ];
  loading = true;
  urgentColumn: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private actionRequestService: ActionRequestService,
    private router: Router
  ) { }

  ngOnInit() {
    this.actionRequestService.getActionRequests().subscribe(actionRequests => {
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

  gotoRequest(request: ActionRequest): void {
    this.router.navigate(['requests', request.key]);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.displayedColumns = this.calculateColumns(event.target.innerWidth);
  }
}
