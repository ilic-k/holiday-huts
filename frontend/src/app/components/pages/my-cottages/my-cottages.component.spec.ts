import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCottagesComponent } from './my-cottages.component';

describe('MyCottagesComponent', () => {
  let component: MyCottagesComponent;
  let fixture: ComponentFixture<MyCottagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCottagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCottagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
