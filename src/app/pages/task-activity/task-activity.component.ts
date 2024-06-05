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

export interface UserActivity extends Activity {
  user: User;
}

@Component({
  selector: "custom-task-activity",
  templateUrl: "./task-activity.component.html",
  styleUrls: ["./task-activity.component.css"],
})
export class TaskActivityComponent implements OnInit {
  activity$: Observable<UserActivity[]>;
  activityType = ActivityType;
  loading = false;
  hasNextPage = true;

  private activity: UserActivity[] = [];
  private currentPage = new BehaviorSubject(0);
  private maxResults = 15;
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

  getSubProcessActivityId(parentActivityInstanceId: string) {
    return parentActivityInstanceId.split(":")[0];
  }

  getSubProcessActivityName(activity: Activity) {
    const subProcessActivityName = this.subProcessActivityName.get(
      this.getSubProcessActivityId(activity.parentActivityInstanceId)
    );

    return subProcessActivityName
      ? subProcessActivityName
      : activity.activityName;
  }

  parentActivityHasSubProcess(parentActivityInstanceId: string) {
    return this.subProcessActivityName.has(
      this.getSubProcessActivityId(parentActivityInstanceId)
    );
  }

  activityIdHasMultiInstanceBody(activityId: string) {
    return this.activityIdMultiInstanceBody.has(activityId);
  }

  getMultiInstanceBodyActivityId(activityId: string) {
    return activityId.split("#")[0];
  }

  getParentUserTaskActivity(activity: UserActivity[], currentIndex: number) {
    const startIndex = currentIndex + 1;

    const index = activity
      .slice(startIndex)
      .findIndex(
        ({
          activityType,
          activityId,
          parentActivityInstanceId,
          rootProcessInstanceId,
        }) =>
          activityType === ActivityType.userTask &&
          activityId !== activity[currentIndex].activityId &&
          (parentActivityInstanceId ===
            activity[currentIndex].parentActivityInstanceId ||
            rootProcessInstanceId ===
              activity[currentIndex].parentActivityInstanceId)
      );

    return index === -1 ? null : activity[index + startIndex];
  }

  nextPage() {
    this.currentPage.next(this.currentPage.value + 1);
  }

  ngOnInit() {
    this.loading = true;

    this.activity$ = this.taskService.findOneTaskById(this.taskid).pipe(
      switchMap(({ processInstanceId }) =>
        this.currentPage.pipe(
          tap(() => {
            this.loading = true;
          }),
          switchMap((firstResult) =>
            this.activityService
              .findManyActivity({
                processInstanceId,
                sortBy: "endTime",
                sortOrder: "desc",
                firstResult: firstResult * this.maxResults,
                maxResults: this.maxResults,
              })
              .pipe(
                switchMap((activity) =>
                  activity.map((_activity: UserActivity) => {
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

                              const multiInstanceBody =
                                this.getMultiInstanceBodyActivityId(
                                  _activity.activityId
                                );

                              if (multiInstanceBody) {
                                this.activityIdMultiInstanceBody.set(
                                  multiInstanceBody
                                );
                              }

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
                  this.activity = this.activity
                    .concat(activity)
                    .sort(
                      ({ endTime: asc }, { endTime: desc }) =>
                        (desc ? new Date(desc) : new Date()).getTime() -
                        (asc ? new Date(asc) : new Date()).getTime()
                    );
                  this.hasNextPage = activity.length === this.maxResults;
                }),
                map(() => this.activity)
              )
          )
        )
      )
    );
  }
}
