import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {TestCanvasComponent} from './test-canvas/test-canvas.component';


const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'canvas', component: HomeComponent },
    { path: 'playground', component: TestCanvasComponent},

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
