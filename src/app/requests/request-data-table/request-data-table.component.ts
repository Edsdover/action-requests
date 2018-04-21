import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { flow, sortBy } from 'lodash/fp';
import { Observable } from 'rxjs/Observable';
import { map, switchMap } from 'rxjs/operators';
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

  // navigation
  params: any = {};
  search: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private actionRequestService: ActionRequestService,
    private route: ActivatedRoute,
    private router: Router,
    private xlsxService: XlsxService
  ) { }

  ngOnInit() {
    this.route
      .paramMap
      .pipe(switchMap((params: ParamMap) => this.processShowAll(params.get('showAll') === 'true')))
      .subscribe(actionRequests => {
        this.dataSource.data = actionRequests;
        this.loading = false;

        this.params.showAll = this.checked;
        this.processFilters(this.params);
      });

    this.route
      .paramMap
      .pipe(map((params: ParamMap) => this.paramsToFilters(params)))
      .subscribe((filters: any) => this.processFilters(filters));

    this.displayedColumns = this.calculateColumns(window.innerWidth);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(sort => this.persistSort(sort));
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
    const spreadsheet = flow([sortBy('No.')])(this.dataSource.filteredData.map((actionRequest: ActionRequest) => {
      return {
        'No.': actionRequest.humanReadableCode,
        'Sales Order': actionRequest.salesOrderNumber,
        'Created': actionRequest.createdAt,
        'Updated': actionRequest.updatedAt,
        'Reporter': actionRequest.reporter,
        'Assignee': actionRequest.assignee,
        'Category': this.titlecase(actionRequest.category),
        'ECN': actionRequest.ecn,
        'Attachments': !!(actionRequest.attachments && actionRequest.attachments.length),
        'Urgent': !!actionRequest.isUrgent,
        'Status': this.titlecase(actionRequest.status),
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

  titlecase(str) {
    if (!str) { return ''; }
    return str.replace(/\b\S/g, function(t) { return t.toUpperCase(); });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.displayedColumns = this.calculateColumns(event.target.innerWidth);
  }

  // navigation

  persistPage(page: any): void {
    delete page.length;
    const stringifiedPage = JSON.stringify(page);
    this.router.navigate(['requests', this.sanitizeParams({ ...this.params, page: stringifiedPage })]);
  }

  persistShowAll(checked): void {
    this.router.navigate(['requests', this.sanitizeParams({ ...this.params, showAll: checked.checked })]);
  }

  persistSearch(filterValue: string) {
    this.router.navigate(['requests', this.sanitizeParams({ ...this.params, search: filterValue })]);
  }

  persistSort(sort: any): void {
    // {active: "assignee", direction: "asc"}
    // {active: "assignee", direction: "desc"}
    // {active: "createdAt", direction: ""}

    const stringifiedSort = JSON.stringify(sort);
    this.router.navigate(['requests', this.sanitizeParams({ ...this.params, sort: stringifiedSort })]);
  }

  processFilters(filters: any) {
    // order matters
    if (this.search !== filters.search) {
      this.processSearch(filters.search || '');
    }
    if (filters.page) {
      this.processPage(JSON.parse(filters.page));
    }
    if (filters.sort) {
      this.processSort(JSON.parse(filters.sort));
    }
  }

  processPage(page: any): void {
    // {pageIndex: 0, pageSize: 5, length: 21}
    // {pageIndex: 1, pageSize: 10, length: 21}

    if (this.loading) {
      setTimeout(() => {
        this.processPage(page);
      }, 100);
    } else {
      if (page.pageIndex * page.pageSize <= this.paginator.length) {
        this.paginator.pageIndex = page.pageIndex;
        this.paginator.pageSize = page.pageSize;
        this.processSearch(this.search);
      } else {
        const stringifiedPage = JSON.stringify({ pageIndex: 0, pageSize: page.pageSize });
        this.router.navigate(['requests', this.sanitizeParams({ ...this.params, page: stringifiedPage })]);
      }
    }
  }

  processSearch(search: string): void {
    this.search = search;
    this.applyFilter(search);
  }

  processSort(sort: any): void {
    this.sort.active = sort.active;
    this.sort.direction = sort.direction;
  }

  processShowAll(showAll: boolean) {
    if (this.checked !== showAll) {
      this.loading = true;
    }
    this.checked = showAll;

    return showAll
      ? this.actionRequestService.getActionRequests()
      : this.actionRequestService.getOpenActionRequests();
  }

  paramsToFilters(params: ParamMap) {
    this.params =  {
      itemsPerPage: params.get('itemsPerPage'),
      page: params.get('page'),
      search: params.get('search'),
      showAll: params.get('showAll'),
      sort: params.get('sort')
    };
    return this.params;
  }

  sanitizeParams({ ...params }: Object) {
    Object.keys(params).forEach((key) => !params[key] && delete params[key]);
    return params;
  }
}
