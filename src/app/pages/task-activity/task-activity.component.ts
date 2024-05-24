import { Component, Input, OnInit } from "@angular/core";
import { Observable, concatAll, from, map, of, switchMap, toArray } from "rxjs";
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
      : activity.activityName;
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
        activity.map((_activity: TaskActivity, i) => {
          _activity.activityName =
            _activity.activityName || _activity.activityId;

          switch (_activity.activityType) {
            case ActivityType.multiInstanceBody: {
              const multiInstanceBody = _activity.activityId.split("#")[0];

              if (multiInstanceBody) {
                this.multiInstanceBody.set(multiInstanceBody);
              }

              break;
            }

            case ActivityType.subProcess: {
              this.subProcessActivityName.set(
                _activity.activityId,
                _activity.activityName
              );

              break;
            }

            default: {
              break;
            }

            case ActivityType.userTask: {
              return from(
                _activity.assignee
                  ? this.userService.findOneUserById(_activity.assignee)
                  : of(null)
              ).pipe(
                map((user) => {
                  _activity.user = user;

                  ++i;

                  const i2 = activity
                    .slice(i)
                    .findIndex(
                      ({
                        activityType,
                        parentActivityInstanceId,
                        activityId,
                        assignee,
                      }) =>
                        activityType === ActivityType.userTask &&
                        ((parentActivityInstanceId ===
                          _activity.parentActivityInstanceId &&
                          activityId !== _activity.activityId) ||
                          parentActivityInstanceId !==
                            _activity.parentActivityInstanceId ||
                          _activity.assignee === assignee)
                    );

                  _activity.parentUserTaskActivityIndex =
                    i2 === -1 ? -1 : i2 + i;

                  return _activity;
                })
              );
            }
          }

          return of(_activity);
        })
      ),
      concatAll(),
      toArray()
    );
  }
}
