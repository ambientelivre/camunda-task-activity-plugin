import { Component, Input, OnInit } from "@angular/core";
import { Observable, from, map, mergeMap, of, switchMap, toArray } from "rxjs";
import { ActivityType } from "src/app/process-instance/activity/activity-type";
import { User } from "src/app/user/user";
import { UserService } from "src/app/user/user.service";
import { Activity } from "../../process-instance/activity/activity";
import { ActivityService } from "../../process-instance/activity/activity.service";
import { TaskService } from "../../process-instance/task/task.service";

@Component({
  selector: "custom-activity-history",
  templateUrl: "./activity-history.component.html",
  styleUrls: ["./activity-history.component.css"],
})
export class ActivityHistoryComponent implements OnInit {
  activity$: Observable<
    (Activity & { user?: User; parentUserTaskActivity?: Activity })[]
  >;
  activityType = ActivityType;

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
        from(activity).pipe(
          mergeMap((_activity, i) =>
            (_activity.assignee
              ? this.userService
                  .findOneUser(_activity.assignee)
                  .pipe(map((user) => ({ ..._activity, user })))
              : of(_activity)
            ).pipe(
              map((_activity) => ({
                ..._activity,
                parentUserTaskActivity: activity
                  .slice((i || 0) - 1)
                  .find(
                    ({ activityType }) => activityType === ActivityType.userTask
                  ),
              }))
            )
          )
        )
      ),
      toArray(),
      map((activity) =>
        activity.sort(({ endTime: asc, activityType }, { endTime: desc }) =>
          new Date(desc).getTime() < new Date(asc).getTime()
            ? activityType !== ActivityType.userTask
              ? 1
              : -1
            : 1
        )
      )
    );
  }
}
