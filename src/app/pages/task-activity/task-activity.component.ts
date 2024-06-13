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

export interface IActivity extends Activity {
  user: User;
}

@Component({
  selector: "custom-task-activity",
  templateUrl: "./task-activity.component.html",
  styleUrls: ["./task-activity.component.css"],
})
export class TaskActivityComponent implements OnInit {
  activity$: Observable<IActivity[]>;
  activityType = ActivityType;
  loading = false;
  hasNextPage = true;
  activityInstances = new Map<string, Activity>();

  private activity: IActivity[] = [];
  private currentPage = new BehaviorSubject(0);
  private maxResults = 15;

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

  getActivityInstanceName(activity: Activity) {
    const activityName = this.activityInstances.get(
      activity.parentActivityInstanceId
    );

    return activityName ? activityName.activityName : activity.activityName;
  }

  getParentActivity(
    activityType: ActivityType,
    activity: IActivity[],
    currentIndex: number
  ) {
    const startIndex = currentIndex + 1;

    const index = activity
      .slice(startIndex)
      .findIndex(
        ({
          activityType: _activityType,
          activityId,
          parentActivityInstanceId,
        }) =>
          activityType === _activityType &&
          activityId !== activity[currentIndex].activityId &&
          (parentActivityInstanceId ===
            activity[currentIndex].parentActivityInstanceId ||
            activity[currentIndex].parentActivityInstanceId ===
              this.activityInstances.get(parentActivityInstanceId)
                ?.parentActivityInstanceId)
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
                  activity.map((activity: IActivity) => {
                    activity.activityName =
                      activity.activityName || activity.activityId;

                    switch (activity.activityType) {
                      case ActivityType.multiInstanceBody:
                      case ActivityType.subProcess: {
                        this.activityInstances.set(activity.id, activity);

                        break;
                      }

                      case ActivityType.userTask: {
                        return this.userService
                          .findOneUserById(activity.assignee)
                          .pipe(
                            map((user) => {
                              activity.user = user;

                              return activity;
                            })
                          );
                      }

                      default: {
                        break;
                      }
                    }

                    return of(activity);
                  })
                ),
                concatAll(),
                toArray(),
                tap((activity) => {
                  this.loading = false;
                  this.hasNextPage = activity.length === this.maxResults;
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
