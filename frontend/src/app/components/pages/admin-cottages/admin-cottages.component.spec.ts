import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCottagesComponent } from './admin-cottages.component';

describe('AdminCottagesComponent', () => {
  let component: AdminCottagesComponent;
  let fixture: ComponentFixture<AdminCottagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCottagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCottagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
