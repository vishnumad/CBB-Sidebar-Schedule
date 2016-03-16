# /r/CollegeBasketball Sidebar NCAAT Schedule
Updates the sidebar of a subreddit with the daily schedule of ncaa tournament games

To use it, you'll need:

 * a mod account with "wiki" permissions
 * an OAuth2 app owned by your mod account
 * a wiki page called "sidebar_template" with your current sidebar (with
   `{{NCAAT_SCHEDULE}}` in place where you'd like it to be inserted)


## installation instructions

1. Create a [Google Drive Spreadsheet](https://drive.google.com). Open the Script Editor by going to Tools > Script Editor... and copy the contents of cbb-sidbar-schedule.js
2. Create a reddit account for the script and mod with with "wiki" permissions.
   Enter the username/password into your script.
3. Get the id of the spreadsheet. It should be a long string of number and letters in the url of your spreadsheet. (e.g. If your spreadsheet url is https://docs.google.com/spreadsheets/d/15ltC0icv34Be4Dvm1drBmvDaAHLA94kQJkYLNm4sp8E/edit, then your spreadsheet id would be 15ltC0icv34Be4Dvm1drBmvDaAHLA94kQJkYLNm4sp8E)
4. Create an [OAuth2 app](https://ssl.reddit.com/prefs/apps/) for the script to
   authenticate with. Make sure to choose the "script" app type, which is
   necessary for the password OAuth2 flow this script uses. Enter the OAuth2
   app client id and client secret into the script.
5. Copy your existing sidebar into a wiki page called "sidebar_template",
   adding `{{NCAAT_SCHEDULE}}` where you wish for the schedule to be.

You can then give the script a test run by clicking "Run -> updateSpreadsheet" in
the menu on Google Apps Script. Then check the sidebar edit history for your
subreddit (e.g. http://www.reddit.com/r/IAmA/wiki/revisions/config/sidebar) to
verify what the script changed.


## running periodically

Finally, if everything seems to be working properly, you can turn on periodic
runs. In the Google Apps Script page menu, click "Resources -> Current
project's triggers". Then choose to add a new trigger. Create a trigger for the updateSpreadsheet function to run once a day, ideally between 1am-2am. I'd also recommend clicking the
"notifications" button and setting it up to email you immediately if the script
fails for some reason.


