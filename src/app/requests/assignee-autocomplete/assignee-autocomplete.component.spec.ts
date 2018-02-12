import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigneeAutocompleteComponent } from './assignee-autocomplete.component';

describe('AssigneeAutocompleteComponent', () => {
  let component: AssigneeAutocompleteComponent;
  let fixture: ComponentFixture<AssigneeAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssigneeAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssigneeAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
