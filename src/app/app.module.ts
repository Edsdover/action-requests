import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { FileDropModule } from 'ngx-file-drop';
import 'hammerjs';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppMaterialModule } from './app-material.module';
import { AppRoutingModule } from './app-routing.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AssigneeAutocompleteComponent, ActionRequestService, CloseConfirmationComponent, RequestDataTableComponent,
         RequestDetailComponent, RequestEditComponent, RequestFormComponent } from './requests';
import { AngularFirestoreService, AuthService, PermissionService } from './shared';
import { UploadService } from './uploads';

@NgModule({
  declarations: [
    AppComponent,
    AssigneeAutocompleteComponent,
    CloseConfirmationComponent,
    LandingPageComponent,
    RequestDataTableComponent,
    RequestDetailComponent,
    RequestEditComponent,
    RequestFormComponent
  ],
  imports: [
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireModule.initializeApp(environment.firebase),
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    FileDropModule,
    AppMaterialModule
  ],
  providers: [
    ActionRequestService,
    AngularFirestoreService,
    AuthService,
    PermissionService,
    UploadService
  ],
  entryComponents: [ CloseConfirmationComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
