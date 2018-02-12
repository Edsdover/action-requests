import { TestBed, inject } from '@angular/core/testing';

import { ActionRequestService } from './action-request.service';

describe('ActionRequestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActionRequestService]
    });
  });

  it('should be created', inject([ActionRequestService], (service: ActionRequestService) => {
    expect(service).toBeTruthy();
  }));
});
