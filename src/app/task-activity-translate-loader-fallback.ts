import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
} from "@ngx-translate/core";

@Injectable({ providedIn: "root" })
export class TaskActivityTranslateLoaderFallback
  implements MissingTranslationHandler
{
  constructor(private httpClient: HttpClient) {}

  handle(params: MissingTranslationHandlerParams) {
    params.translateService.setDefaultLang("en");

    return this.httpClient.get(
      "/camunda/app/tasklist/scripts/task-activity/demo/assets/locales/en.json"
    );
  }
}
