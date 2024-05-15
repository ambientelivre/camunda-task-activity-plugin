import { Injectable } from "@angular/core";
import { ActivityRepository } from "./activity.repository";

@Injectable({
  providedIn: "root",
})
export class ActivityService {
  constructor(private activityRepository: ActivityRepository) {}

  findManyActivity(params) {
    return this.activityRepository.findManyActivity(params);
  }
}
