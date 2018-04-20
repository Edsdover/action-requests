import { TestBed, inject } from '@angular/core/testing';

import { XlsxService } from './xlsx.service';

describe('XlsxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XlsxService]
    });
  });

  it('should be created', inject([XlsxService], (service: XlsxService) => {
    expect(service).toBeTruthy();
  }));
});
