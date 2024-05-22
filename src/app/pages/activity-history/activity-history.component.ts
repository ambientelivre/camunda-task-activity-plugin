import { Component, Input, OnInit } from "@angular/core";
import { Observable, concat, map, of, switchMap, tap, toArray } from "rxjs";
import { ActivityType } from "src/app/process-instance/activity/activity-type";
import { User } from "src/app/user/user";
import { UserService } from "src/app/user/user.service";
import { Activity } from "../../process-instance/activity/activity";
import { ActivityService } from "../../process-instance/activity/activity.service";
import { TaskService } from "../../process-instance/task/task.service";

export type TaskActivity = Activity &
  Partial<{
    user: User;
    parentUserTaskActivityIndex: number;
  }>;

@Component({
  selector: "custom-activity-history",
  templateUrl: "./activity-history.component.html",
  styleUrls: ["./activity-history.component.css"],
})
export class ActivityHistoryComponent implements OnInit {
  activity$: Observable<TaskActivity[]>;
  activityType = ActivityType;
  subProcessActivityName = new Map<string, string>();

  @Input() taskid!: string;

  constructor(
    private taskService: TaskService,
    private activityService: ActivityService,
    private userService: UserService
  ) {}

  getUserFullName(user: User) {
    return `${user.firstName} ${user.lastName}`;
  }

  getSubProcessActivityName(activity: Activity) {
    const subProcessActivityName = this.subProcessActivityName.get(
      activity.parentActivityInstanceId.split(":")[0]
    );

    return subProcessActivityName
      ? subProcessActivityName
      : activity.activityName || activity.activityId;
  }

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
          ...activity.map((_activity, i) =>
            _activity.assignee
              ? this.userService.findOneUserById(_activity.assignee).pipe(
                  map((user) => {
                    ++i;

                    const findIndex = activity
                      .slice(i)
                      .findIndex(
                        ({ activityType, parentActivityInstanceId }) =>
                          activityType === ActivityType.userTask &&
                          parentActivityInstanceId ===
                            _activity.parentActivityInstanceId
                      );

                    return {
                      ..._activity,
                      user,
                      parentUserTaskActivityIndex:
                        findIndex === -1 ? -1 : findIndex + i,
                    };
                  })
                )
              : of(_activity).pipe(
                  tap((_activity) => {
                    if (_activity.activityType === ActivityType.subProcess) {
                      this.subProcessActivityName.set(
                        _activity.activityId,
                        _activity.activityName || _activity.activityId
                      );
                    }
                  })
                )
          )
        )
      ),
      toArray()
    );
  }
}
