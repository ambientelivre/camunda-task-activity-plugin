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
import { TaskActivityTranslateLoader } from "./task-activity-translate-loader";
import { TaskActivityTranslateLoaderFallback } from "./task-activity-translate-loader-fallback";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { LoadingComponent } from './components/loading/loading.component';

@NgModule({
  declarations: [TaskActivityComponent, MediaComponent, LoadingComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: TaskActivityTranslateLoaderFallback,
        deps: [HttpClient],
      },
      loader: {
        provide: TranslateLoader,
        useClass: TaskActivityTranslateLoader,
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
