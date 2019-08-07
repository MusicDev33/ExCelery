import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkbookComponent } from './workbook.component';

describe('WorkbookComponent', () => {
  let component: WorkbookComponent;
  let fixture: ComponentFixture<WorkbookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkbookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
