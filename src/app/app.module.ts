import { Injector } from "@angular/core";
import { createCustomElement } from "@angular/elements";

import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NgHttpCachingModule } from "ng-http-caching";
import { CardComponent } from "./components/activity/card/card.component";
import { ActivityHistoryComponent } from "./pages/activity-history/activity-history.component";

@NgModule({
  declarations: [ActivityHistoryComponent, CardComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgHttpCachingModule.forRoot({ lifetime: 10_000 }),
  ],
  entryComponents: [ActivityHistoryComponent],
})
export class AppModule {
  constructor(private injector: Injector) {
    customElements.define(
      "activity-history",
      createCustomElement(ActivityHistoryComponent, {
        injector: this.injector,
      })
    );
  }

  ngDoBootstrap() {}
}
