import { Component, Input, OnInit } from "@angular/core";
import {
  Observable,
  concat,
  from,
  map,
  of,
  switchMap,
  tap,
  toArray,
} from "rxjs";
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
  selector: "custom-task-activity",
  templateUrl: "./task-activity.component.html",
  styleUrls: ["./task-activity.component.css"],
})
export class TaskActivityComponent implements OnInit {
  activity$: Observable<TaskActivity[]>;
  activityType = ActivityType;
  private subProcessActivityName = new Map<string, string>();
  private multiInstanceBody = new Map<string, void>();

  @Input() taskid!: string;

  constructor(
    private taskService: TaskService,
    private activityService: ActivityService,
    private userService: UserService
  ) {}

  getUserFullName(user?: User) {
    return `${user?.firstName || ""} ${user?.lastName || ""}`;
  }

  getSubProcessActivityName(activity: Activity) {
    const subProcessActivityName = this.subProcessActivityName.get(
      activity.parentActivityInstanceId.split(":")[0]
    );

    return subProcessActivityName
      ? subProcessActivityName
      : activity.activityName || activity.activityId;
  }

  activityIdHasMultiInstanceBody(activityId: string) {
    return this.multiInstanceBody.has(activityId);
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
            _activity.activityType === ActivityType.userTask
              ? from(
                  _activity.assignee
                    ? this.userService.findOneUserById(_activity.assignee)
                    : of(null)
                ).pipe(
                  map((user) => {
                    ++i;

                    const i2 = activity
                      .slice(i)
                      .findIndex(
                        ({
                          activityType,
                          parentActivityInstanceId,
                          activityId,
                        }) =>
                          activityType === ActivityType.userTask &&
                          ((parentActivityInstanceId ===
                            _activity.parentActivityInstanceId &&
                            activityId !== _activity.activityId) ||
                            (parentActivityInstanceId !==
                              _activity.parentActivityInstanceId &&
                              activityId === _activity.activityId))
                      );

                    return {
                      ..._activity,
                      user,
                      parentUserTaskActivityIndex: i2 === -1 ? -1 : i2 + i,
                    };
                  })
                )
              : of(_activity).pipe(
                  tap((_activity) => {
                    switch (_activity.activityType) {
                      case ActivityType.multiInstanceBody: {
                        const multiInstanceBody =
                          _activity.activityId.split("#")[0];

                        if (multiInstanceBody) {
                          this.multiInstanceBody.set(multiInstanceBody);
                        }

                        return;
                      }

                      case ActivityType.subProcess:
                        return this.subProcessActivityName.set(
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
