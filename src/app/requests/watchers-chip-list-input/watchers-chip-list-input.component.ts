import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { MatChipInputEvent } from '@angular/material';
import { ENTER, COMMA } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-watchers-chip-list-input',
  templateUrl: './watchers-chip-list-input.component.html',
  styleUrls: ['./watchers-chip-list-input.component.css']
})
export class WatchersChipListComponent implements OnInit {
  selectable = true;
  removable = true;
  addOnBlur = true;

  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];

  @Input() watchers: string[] = [];
  @Output() watchersUpdated = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      const sanitizedValue = value.trim().toLowerCase();
      if (!this.watchers.includes(sanitizedValue)) {
        this.watchers.push(value.trim().toLowerCase());
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.watchersUpdated.emit(this.watchers);
  }

  remove(fruit: any): void {
    const index = this.watchers.indexOf(fruit);

    if (index >= 0) {
      this.watchers.splice(index, 1);
    }

    this.watchersUpdated.emit(this.watchers);
  }
}
