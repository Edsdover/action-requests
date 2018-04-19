import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchersChipListComponent } from './watchers-chip-list-input.component';

describe('WatchersChipListComponent', () => {
  let component: WatchersChipListComponent;
  let fixture: ComponentFixture<WatchersChipListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WatchersChipListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchersChipListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
