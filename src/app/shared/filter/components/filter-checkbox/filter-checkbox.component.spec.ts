import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

import { IconModule } from 'ish-core/icon.module';
import { Filter } from 'ish-core/models/filter/filter.model';
import { PipesModule } from 'ish-core/pipes.module';

import { FilterCheckboxComponent } from './filter-checkbox.component';

describe('Filter Checkbox Component', () => {
  let component: FilterCheckboxComponent;
  let fixture: ComponentFixture<FilterCheckboxComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IconModule, NgbCollapseModule, PipesModule],
      declarations: [FilterCheckboxComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    const filterElement = {
      name: 'Brands',
      facets: [
        { name: 'AsusName', count: 4, displayName: 'Asus' },
        { name: 'LogitechName', count: 5, displayName: 'Logitech', selected: true },
      ],
    } as Filter;
    fixture = TestBed.createComponent(FilterCheckboxComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    component.filterElement = filterElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(element).toMatchSnapshot();
  });

  it('should toggle unselected filter facets when filter group header is clicked', fakeAsync(() => {
    fixture.detectChanges();
    const filterGroupHead = fixture.nativeElement.querySelectorAll('h3')[0];
    filterGroupHead.click();
    tick(500);
    fixture.detectChanges();

    const selectedFilterFacet = element.getElementsByClassName('filter-selected')[0];
    expect(selectedFilterFacet.textContent).toContain('Logitech');

    const hiddenFilterFacet = element.querySelector('a[data-testing-id=filter-link-AsusName]');
    expect(hiddenFilterFacet.parentNode.parentElement.className).not.toContain('show');
  }));
});
