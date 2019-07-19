import { TestBed } from '@angular/core/testing';

import { FilepathService } from './filepath.service';

describe('FilepathService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FilepathService = TestBed.get(FilepathService);
    expect(service).toBeTruthy();
  });
});
