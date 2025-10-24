import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CottageDetailsComponent } from './cottage-details.component';

describe('CottageDetailsComponent', () => {
  let component: CottageDetailsComponent;
  let fixture: ComponentFixture<CottageDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CottageDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CottageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
