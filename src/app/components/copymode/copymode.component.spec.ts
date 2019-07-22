import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopymodeComponent } from './copymode.component';

describe('CopymodeComponent', () => {
  let component: CopymodeComponent;
  let fixture: ComponentFixture<CopymodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopymodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopymodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
