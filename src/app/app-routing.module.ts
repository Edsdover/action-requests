import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingPageComponent } from './landing-page/landing-page.component';
import { RequestDataTableComponent, RequestDetailComponent, RequestEditComponent, RequestFormComponent,
         RequestListComponent } from './requests';

const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'requests-deprecated',
    component: RequestListComponent
  },
  {
    path: 'requests',
    component: RequestDataTableComponent
  },
  {
    path: 'requests/:key/edit',
    component: RequestEditComponent
  },
  {
    path: 'requests/:key',
    component: RequestDetailComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
