import { ActivityType } from "./activity-type";

export interface Activity {
  activityId: string;
  activityName: string;
  activityType: ActivityType;
  assignee: string;
  calledProcessInstanceId: string;
  calledCaseInstanceId: null;
  canceled: boolean;
  completeScope: boolean;
  durationInMillis: number;
  endTime: string;
  executionId: string;
  id: string;
  parentActivityInstanceId: string;
  processDefinitionId: string;
  processInstanceId: string;
  startTime: string;
  taskId: string;
  tenantId: null;
  removalTime: string;
  rootProcessInstanceId: string;
}
