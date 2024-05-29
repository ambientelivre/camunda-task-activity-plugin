import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

@Injectable({ providedIn: "root" })
export class TranslateLoaderHttpImpl extends TranslateHttpLoader {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      "/camunda/app/tasklist/scripts/camunda-task-activity-plugin/demo/assets/locales/",
      ".json"
    );
  }
}
