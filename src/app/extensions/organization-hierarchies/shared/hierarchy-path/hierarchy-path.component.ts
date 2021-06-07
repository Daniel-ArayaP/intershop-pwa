import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Basket } from 'ish-core/models/basket/basket.model';
import { Order } from 'ish-core/models/order/order.model';
import { GenerateLazyComponent } from 'ish-core/utils/module-loader/generate-lazy-component.decorator';

import { OrganizationHierarchiesFacade } from '../../facades/organization-hierarchies.facade';
import { OrderGroupPath } from '../../models/order-group-path/order-group-path.model';

@Component({
  selector: 'ish-hierarchy-path',
  templateUrl: './hierarchy-path.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@GenerateLazyComponent()
export class HierarchyPathComponent implements OnInit {
  @Input() object: Basket | Order;

  path$: Observable<OrderGroupPath>;

  constructor(private organizationHierarchiesFacade: OrganizationHierarchiesFacade) {}

  ngOnInit() {
    this.path$ = this.organizationHierarchiesFacade.getDetailsOfOrderGroupPath$((this.object as Order).documentNo);
  }
}