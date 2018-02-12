import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseConfirmationComponent } from './close-confirmation.component';

describe('CloseConfirmationComponent', () => {
  let component: CloseConfirmationComponent;
  let fixture: ComponentFixture<CloseConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
