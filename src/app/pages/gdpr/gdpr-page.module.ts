import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from 'ish-shared/shared.module';

import { DataRequestComponent } from './data-request/data-request.component';

const gdprPageRoutes: Routes = [
  {
    path: 'confirmRequest',
    component: DataRequestComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(gdprPageRoutes), SharedModule],
  declarations: [DataRequestComponent],
})
export class GDPRPageModule {}
