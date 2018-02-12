import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { map, startWith } from 'rxjs/operators';

import { ActionRequest, ActionRequestService } from '../shared';

@Component({
  selector: 'app-assignee-autocomplete',
  templateUrl: './assignee-autocomplete.component.html',
  styleUrls: ['./assignee-autocomplete.component.css']
})
export class AssigneeAutocompleteComponent implements OnInit {
  assigneeControl: FormControl = new FormControl();
  options: string[] = [];

  filteredOptions: Observable<string[]>;

  @Input() assignee: string;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter();

  constructor(private actionRequestService: ActionRequestService) { }

  ngOnInit() {
    this.actionRequestService.getActionRequests().subscribe(actionRequests => {
      this.options = Array.from(new Set(actionRequests
        .map(actionRequest => actionRequest.assignee ? actionRequest.assignee.toLowerCase() : null)
        .filter(assignee => assignee)
        .sort()
      ));
    });
    this.filteredOptions = this.assigneeControl.valueChanges
      .pipe(
        startWith(''),
        map(val => this.filter(val))
      );
  }

  filter(val: string): string[] {
    return this.options.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  cancel(): void {
    this.onCancel.emit();
  }

  save(): void {
    const assignee = this.assigneeControl.value;
    this.onSave.emit(assignee);
  }
}
