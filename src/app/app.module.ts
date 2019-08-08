import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { TooltipModule } from 'ng2-tooltip-directive';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';
import { ExcelService } from './providers/excel.service';
import { FilepathService } from './providers/filepath.service';
import { AbstracterizerService } from './providers/abstracterizer.service';
import { CopyStoreService } from './providers/copymode/copystore.service';

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CopymodeComponent } from './components/copymode/copymode.component';
import { WorkbookComponent } from './components/copymode/subcomponents/workbook/workbook.component';
import { HeaderComponent } from './components/copymode/subcomponents/header/header.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    WebviewDirective,
    SidebarComponent,
    CopymodeComponent,
    WorkbookComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TooltipModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    ElectronService,
    ExcelService,
    FilepathService,
    AbstracterizerService,
    CopyStoreService],
  bootstrap: [AppComponent]
})
export class AppModule { }
