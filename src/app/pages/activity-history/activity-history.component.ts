import { Component, Input, OnInit } from "@angular/core";
import { Observable, concat, map, of, switchMap, tap, toArray } from "rxjs";
import { ActivityType } from "src/app/process-instance/activity/activity-type";
import { User } from "src/app/user/user";
import { UserService } from "src/app/user/user.service";
import { Activity } from "../../process-instance/activity/activity";
import { ActivityService } from "../../process-instance/activity/activity.service";
import { TaskService } from "../../process-instance/task/task.service";

export type TaskActivity = Activity & {
  user?: User;
  parentUserTaskActivity?: number;
};

@Component({
  selector: "custom-activity-history",
  templateUrl: "./activity-history.component.html",
  styleUrls: ["./activity-history.component.css"],
})
export class ActivityHistoryComponent implements OnInit {
  activity$: Observable<TaskActivity[]>;
  activityType = ActivityType;
  subProcessActivity = new Map<string, Activity>();

  @Input() taskid!: string;

  constructor(
    private taskService: TaskService,
    private activityService: ActivityService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.activity$ = this.taskService.findOneTaskById(this.taskid).pipe(
      switchMap(({ processInstanceId }) =>
        this.activityService.findManyActivity({
          processInstanceId,
          sortBy: "occurrence",
          sortOrder: "desc",
        })
      ),
      switchMap((activity) =>
        concat(
          ...activity.map((activity) =>
            activity.assignee
              ? this.userService
                  .findOneUser(activity.assignee)
                  .pipe(map((user) => ({ ...activity, user })))
              : of(activity)
          )
        ).pipe(
          map(
            (_activity, i) => (
              _activity.activityType === ActivityType.subProcess &&
                this.subProcessActivity.set(_activity.activityId, _activity),
              {
                ..._activity,
                parentUserTaskActivity: activity.findIndex(
                  ({ activityType, parentActivityInstanceId }, i2) =>
                    i < i2 &&
                    activityType === ActivityType.userTask &&
                    parentActivityInstanceId ===
                      _activity.parentActivityInstanceId
                ),
              }
            )
          )
        )
      ),
      toArray()
    );
  }
}
