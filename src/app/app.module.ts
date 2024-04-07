import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AuthModule } from './component/auth/auth.module';
import { CustomerModule } from './component/customer/customer.module';
import { HomeModule } from './component/home/home.module';
import { InvoiceModule } from './component/invoice/invoice.module';
import { NotificationModule } from './notification.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    // HttpClientModule, //should just be in core.module.ts
    CoreModule,
    AuthModule,
    CustomerModule,
    // UserModule, //because of app-routing.module.ts, we are lazily loading it
    InvoiceModule,
    HomeModule,
    AppRoutingModule, //order matters
    NotificationModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
