import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { schoolConfigGuard } from './school-config.guard';

describe('schoolConfigGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => schoolConfigGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
