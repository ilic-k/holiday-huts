import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CottagesListComponent } from './cottages-list.component';

describe('CottagesListComponent', () => {
  let component: CottagesListComponent;
  let fixture: ComponentFixture<CottagesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CottagesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CottagesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
