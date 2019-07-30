import { TestBed } from '@angular/core/testing';

import { AbstracterizerService } from './abstracterizer.service';

describe('AbstracterizerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AbstracterizerService = TestBed.get(AbstracterizerService);
    expect(service).toBeTruthy();
  });
});
