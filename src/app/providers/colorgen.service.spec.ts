import { TestBed } from '@angular/core/testing';

import { ColorgenService } from './colorgen.service';

describe('ColorgenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ColorgenService = TestBed.get(ColorgenService);
    expect(service).toBeTruthy();
  });
});
