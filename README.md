# Task Activity Plugin

This plugin shows activity history and tasks during the process

## Features

### Parent task

![image](https://github.com/ambientelivre/camunda-task-activity-plugin/assets/89039740/d35b5168-d934-431a-8108-448712122913)

![image](https://github.com/ambientelivre/camunda-task-activity-plugin/assets/89039740/13d4122f-124a-407e-972f-508fed34e4c9)

### Multi-instance

#### Note: Peter not finished its task

![image](https://github.com/ambientelivre/camunda-task-activity-plugin/assets/89039740/b810eb3e-b9ec-49c2-815e-f1fd3aa284a7)

![image](https://github.com/ambientelivre/camunda-task-activity-plugin/assets/89039740/bc560ba6-2aa2-42cf-8190-93ff07d80d3d)

#### Completed task

![image](https://github.com/ambientelivre/camunda-task-activity-plugin/assets/89039740/b0f31407-292c-416d-b423-520c5989bb42)

![image](https://github.com/ambientelivre/camunda-task-activity-plugin/assets/89039740/6104bdc7-b583-4622-9201-0f5acfcb2549)

### Other activities

![image](https://github.com/ambientelivre/camunda-task-activity-plugin/assets/89039740/c4b2b5be-8d2b-4e17-8642-c6158177464f)

### Infinite scroll

![screen-recorder](https://github.com/ambientelivre/camunda-task-activity-plugin/assets/89039740/252e060e-bc30-44d4-8c72-a69003519c4d)

## Install

1. Download **camunda-task-activity-plugin.zip** package
1. Unzip package in **server/apache-tomcat-9.0.75/webapps/camunda/app/tasklist/scripts**
1. Modify **config.js** to plugin directory path

   - ```js
     customScripts: [
       // ...
       "scripts/camunda-task-activity-plugin/plugin.js",
     ];
     ```

1. Reboot Tomcat
