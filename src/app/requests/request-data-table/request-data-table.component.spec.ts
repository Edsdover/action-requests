import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestDataTableComponent } from './request-data-table.component';

describe('RequestDataTableComponent', () => {
  let component: RequestDataTableComponent;
  let fixture: ComponentFixture<RequestDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
