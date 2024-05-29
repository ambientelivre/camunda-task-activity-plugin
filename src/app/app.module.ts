import { Injector } from "@angular/core";
import { createCustomElement } from "@angular/elements";

import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import {
  MissingTranslationHandler,
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { NgHttpCachingModule } from "ng-http-caching";
import { MediaComponent } from "./components/activity/media/media.component";
import { TaskActivityComponent } from "./pages/task-activity/task-activity.component";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { LoadingComponent } from "./components/loading/loading.component";
import { TranslateLoaderFallback } from "./translate-loader-fallback";
import { TranslateLoaderImpl } from "./translate-loader-impl";

@NgModule({
  declarations: [TaskActivityComponent, MediaComponent, LoadingComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: TranslateLoaderFallback,
        deps: [HttpClient],
      },
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderImpl,
        deps: [HttpClient],
      },
    }),
    InfiniteScrollModule,
    NgHttpCachingModule.forRoot({ lifetime: 10_000 }),
  ],
  entryComponents: [TaskActivityComponent],
})
export class AppModule {
  constructor(
    private translateService: TranslateService,
    private injector: Injector
  ) {
    this.translateService.setDefaultLang(
      this.translateService.getBrowserLang()
    );

    customElements.define(
      "task-activity",
      customElements.get("task-activity") ||
        createCustomElement(TaskActivityComponent, {
          injector: this.injector,
        })
    );
  }

  ngDoBootstrap() {}
}
