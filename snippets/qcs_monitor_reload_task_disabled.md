# Monitoring for disabled reload tasks in QCS

In QCS, a scheduled reload task will automatically be disabled by the platform after 5 consecutive reload failures. There is no notification in the QMC of this action, so this document explains options to notify administrators of these issues.

## Process

The overall process for identifying a disabled task (in the absence of an event to track this):
1) Establish a regular schedule for the check and a distribution for the notification
2) Poll the reload task endpoint for events with the following message: "Scheduled reload has been disabled since exceeded limit of 5 consecutive reload failures. Please fix error and re-enable schedule."

This has the following general limitations:
- Loads all reload-tasks, irrespective of whether the corresponding apps are in a personal or shared space (e.g. in a space used for development or testing)
- Uses an experimental API which may change at any time

Possible enhancements include:
- Filtering the reload tasks to show only apps in managed spaces prior to hitting the API (as we really only care about tasks on production apps which generally should always be running)
- Loading the owner of the reload task or app and messaging them to notify it's been disabled

## In Qlik Application Automation

This automation does the following:
1) Starts on an hourly schedule
2) Sets variables for the tenant URL and the bearer token (in the screenshot using an input form)
3) Call the /reload-tasks endpoint (an experimental endpoint)
4) Loop over each value in the response
5) Filter the list to only those responses which are disabled, and which have a log value matching "Scheduled reload has been disabled since exceeded limit of 5"
6) Get the app information
7) Get the user information
8) For those reload tasks whose app has a stream set, send a slack message and print the output
9) For those reload tasks whose app doesn't have a stream set, just print the output
10) Stop the loop

In order:

![image](https://user-images.githubusercontent.com/825142/140746703-b40ce921-20e4-46d9-9c99-7f081281338d.png)

![image](https://user-images.githubusercontent.com/825142/140746768-cba2e22b-b01f-4990-a6e1-4b4c2568e8a0.png)

![image](https://user-images.githubusercontent.com/825142/140747441-1d06c320-4d72-4bef-8c35-4014adb96504.png)

A view of the slack message:

![image](https://user-images.githubusercontent.com/825142/140747899-bbd5ed35-be43-40a2-accd-2c0e1413557e.png)

Results in:

![image](https://user-images.githubusercontent.com/825142/140748130-a5ce1e0a-ac43-4edb-b8d3-eeae49259be2.png)


Notes:
- Excludes personal spaces as it's assumed that we only want to monitor apps in shared and managed spaces

Limitations: 
1) Doesn't load more than 100 reload tasks, pagination on the API needs to be added in. Currently there is no reload-tasks block in Qlik Application Automation
2) Notifies on all disabled apps every time it's run

## In an app

Load the log field from the reload-tasks API, matching the logic above.

Hoping for updates to the Reload Analyzer monitoring app...https://community.qlik.com/t5/Support-Updates-Blog/The-Reload-Analyzer-for-Qlik-SaaS-customers-is-available-NOW/ba-p/1826163

