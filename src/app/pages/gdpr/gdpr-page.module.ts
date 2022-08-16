import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from 'ish-shared/shared.module';

import { GDPRDataRequestComponent } from './gdpr-data-request/gdpr-data-request.component';

const gdprPageRoutes: Routes = [
  {
    path: '**',
    component: GDPRDataRequestComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(gdprPageRoutes), SharedModule],
  declarations: [GDPRDataRequestComponent],
})
export class GDPRPageModule {}
