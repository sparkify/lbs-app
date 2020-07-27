import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import { HomeComponent } from './home/home.component';
import { CanvasComponent } from './home/canvas/canvas.component';
import { TestCanvasComponent } from './test-canvas/test-canvas.component';
import { UploadFeatureComponent } from './home/features/upload-feature/upload-feature.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        CanvasComponent,
        TestCanvasComponent,
        UploadFeatureComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpClientModule,
        ReactiveFormsModule
    ],
    providers: [],
    bootstrap: [AppComponent],
    entryComponents: [
        UploadFeatureComponent
    ]
})
export class AppModule {
}
