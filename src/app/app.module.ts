import { Injector } from "@angular/core";
import { createCustomElement } from "@angular/elements";

import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NgHttpCachingModule } from "ng-http-caching";
import { CardComponent } from "./components/activity/card/card.component";
import { ActivityHistoryComponent } from "./pages/activity-history/activity-history.component";
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { TaskActivityTranslateLoader } from "./task-activity-translate-loader";

@NgModule({
  declarations: [ActivityHistoryComponent, CardComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TaskActivityTranslateLoader,
        deps: [HttpClient],
      },
    }),
    NgHttpCachingModule.forRoot({ lifetime: 10_000 }),
  ],
  entryComponents: [ActivityHistoryComponent],
})
export class AppModule {
  constructor(
    private translateService: TranslateService,
    private injector: Injector
  ) {
    this.translateService.setDefaultLang(
      this.translateService.getBrowserCultureLang()
    );

    customElements.define(
      "activity-history",
      createCustomElement(ActivityHistoryComponent, {
        injector: this.injector,
      })
    );
  }

  ngDoBootstrap() {}
}
