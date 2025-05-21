import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolSetupComponent } from './school-setup.component';

describe('SchoolSetupComponent', () => {
  let component: SchoolSetupComponent;
  let fixture: ComponentFixture<SchoolSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchoolSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
