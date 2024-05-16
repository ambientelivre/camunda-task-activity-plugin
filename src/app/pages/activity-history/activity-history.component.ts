import { Component, Input, OnInit } from "@angular/core";
import { Observable, concat, map, of, switchMap, toArray } from "rxjs";
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
        concat(
          ...activity.map((activity) =>
            activity.assignee
              ? this.userService
                  .findOneUser(activity.assignee)
                  .pipe(map((user) => ({ ...activity, user })))
              : of(activity)
          )
        ).pipe(
          map((_activity, i) => ({
            ..._activity,
            parentUserTaskActivity: activity
              .slice(i + 1)
              .find(
                ({ activityType }) => activityType === ActivityType.userTask
              ),
          }))
        )
      ),
      toArray()
    );
  }
}
