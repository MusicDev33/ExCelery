import { HomeComponent } from './components/home/home.component';
import { CopymodeComponent } from './components/copymode/copymode.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {path: '', component: CopymodeComponent},
    {path: 'copymode', component: CopymodeComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
