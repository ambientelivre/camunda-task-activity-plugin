import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Activity } from "./activity";
import { ACTIVE_CAMUNDA_TYPE } from "src/camunda-type";

@Injectable({
  providedIn: "root",
})
export class ActivityRepository {
  constructor(private httpClient: HttpClient) {}

  findManyActivity(params) {
    return this.httpClient.get<Activity[]>(
      `/${ACTIVE_CAMUNDA_TYPE}/api/engine/engine/default/history/activity-instance`,
      { params }
    );
  }
}
