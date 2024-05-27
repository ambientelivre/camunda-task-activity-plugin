import { Component, Input, OnInit } from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  concatAll,
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

export interface UserTaskActivity extends Activity {
  user: User;
  parentUserTaskActivityIndex: number;
}

@Component({
  selector: "custom-task-activity",
  templateUrl: "./task-activity.component.html",
  styleUrls: ["./task-activity.component.css"],
})
export class TaskActivityComponent implements OnInit {
  activity$: Observable<UserTaskActivity[]>;
  activityType = ActivityType;
  taskDetailsContainer = document.querySelector(".task-details .content");
  loading = false;
  private activity: UserTaskActivity[] = [];
  private currentPage = new BehaviorSubject(0);
  private maxResults = 20;
  private subProcessActivityName = new Map<string, string>();
  private activityIdMultiInstanceBody = new Map<string, void>();

  @Input() taskid!: string;

  constructor(
    private taskService: TaskService,
    private activityService: ActivityService,
    private userService: UserService
  ) {}

  getUserFullName(user?: User) {
    if (!user || !user.firstName) {
      return "";
    }

    return user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;
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
    return this.activityIdMultiInstanceBody.has(activityId);
  }

  getMultiInstanceBodyActivityId(activityId: string) {
    return activityId.split("#")[0];
  }

  getParentUserTaskActivityIndex(activity: Activity[], currentIndex: number) {
    const startIndex = currentIndex + 1;

    const index = activity
      .slice(startIndex)
      .findIndex(
        ({ activityType, executionId }) =>
          activityType === ActivityType.userTask &&
          executionId !== activity[currentIndex].executionId
      );

    return index === -1 ? -1 : index + startIndex;
  }

  nextPage() {
    this.currentPage.next(this.currentPage.value + 1);
  }

  ngOnInit() {
    const task = this.taskService.findOneTaskById(this.taskid);

    this.activity$ = task.pipe(
      switchMap(({ processInstanceId }) =>
        this.currentPage.pipe(
          tap(() => {
            this.loading = true;
          }),
          switchMap((firstResult) =>
            this.activityService
              .findManyActivity({
                processInstanceId,
                sortBy: "occurrence",
                sortOrder: "desc",
                firstResult: firstResult * this.maxResults,
                maxResults: this.maxResults,
              })
              .pipe(
                switchMap((activity) =>
                  activity.map((_activity: UserTaskActivity, i) => {
                    _activity.activityName =
                      _activity.activityName || _activity.activityId;

                    switch (_activity.activityType) {
                      case ActivityType.multiInstanceBody: {
                        const activityId = this.getMultiInstanceBodyActivityId(
                          _activity.activityId
                        );

                        if (activityId) {
                          this.activityIdMultiInstanceBody.set(activityId);
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
                        return this.userService
                          .findOneUserById(_activity.assignee)
                          .pipe(
                            map((user) => {
                              _activity.user = user;

                              _activity.parentUserTaskActivityIndex =
                                this.getParentUserTaskActivityIndex(
                                  activity,
                                  i
                                );

                              return _activity;
                            })
                          );
                      }
                    }

                    return of(_activity);
                  })
                ),
                concatAll(),
                toArray(),
                tap((activity) => {
                  this.loading = false;
                  this.activity = this.activity.concat(activity);
                }),
                map(() => this.activity)
              )
          )
        )
      )
    );
  }
}
