import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Activity } from "./activity";

@Injectable({
  providedIn: "root",
})
export class ActivityRepository {
  constructor(private httpClient: HttpClient) {}

  findManyActivity(params) {
    return this.httpClient.get<Activity[]>(
      "/camunda/api/engine/engine/default/history/activity-instance",
      { params }
    );
  }
}
