import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { ACTIVE_CAMUNDA_TYPE } from "src/camunda-type";

@Injectable({ providedIn: "root" })
export class TranslateLoaderHttpImpl extends TranslateHttpLoader {
  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      `/${ACTIVE_CAMUNDA_TYPE}/app/tasklist/scripts/camunda-task-activity-plugin/demo/assets/locales/`,
      ".json"
    );
  }
}
