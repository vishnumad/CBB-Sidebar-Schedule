// Copyright (c) 2014 Max Goodman.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
// 3. The name of the author or contributors may not be used to endorse or
//    promote products derived from this software without specific prior
//    written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
// OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
// OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.



// This script is based on the Google Calendar script by Max Goodman and has
// been modified by Vishnu M. (/u/vishnumad on reddit)




var SUBREDDIT = 'CollegeBasketball'

//OAuth2 ID and SECRET found at https://ssl.reddit.com/prefs/apps/
var ID = ''
var SECRET = ''

//Credentials for the mod account with wiki permissions
var USERNAME = ''
var PASSWORD = ''

//The id of the spreadsheet https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
var SPREADSHEET_ID = ''


//Main function
function updateSpreadsheet() {
  //Calls clearSpreadsheet to initially clear the sheet
  clearSpreadsheet()
  
  //Initializes spreadsheet
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  var sheet = SpreadsheetApp.setActiveSheet(ss.getSheets()[0])
   
  //Gets current date in EST format and sets the date in the url
  var currentDate = new Date()
  var today = Utilities.formatDate(currentDate, "EST", "yyyy/MM/d")
  
  var url = 'http://data.ncaa.com/jsonp/scoreboard/basketball-men/d1/' + today + '/scoreboard.html';
  
  //Fetches the json data from url
  var response = UrlFetchApp.fetch(url)
  
  var json = response.getContentText()
  
  //Removes the callbackWrapper from the json data. GAS doesn't like it for some reason
  json = json.replace("callbackWrapper(", "")
  json = json.replace("});", "}")
  
  //Parses the json data
  var dataSet = JSON.parse(json)
  var gamesList = dataSet.scoreboard[0].games
  var team1Flair = ''
  var team2Flair = ''
  var rowData = []
  rowData.length = 0;

  //Update spreadsheet with schedule
  for(i=0; i < gamesList.length; i++) {
    if(gamesList[i].tournament_id == 1) {
      team1Flair = gamesList[i].home.nameSeo
      team2Flair = gamesList[i].away.nameSeo
      
      team1Flair = team1Flair
         .replace('-u', '')
         .replace('-', '')
      
      team2Flair = team2Flair
         .replace('-u', '')
         .replace('-', '')
      
      team1Flair = "[](#f/" + team1Flair + ")"
      team2Flair = "[](#f/" + team2Flair + ")"
      
      rowData.push([gamesList[i].home.teamSeed, gamesList[i].home.nameRaw, gamesList[i].away.teamSeed, gamesList[i].away.nameRaw, gamesList[i].venue, gamesList[i].bracketRound, gamesList[i].startTime, gamesList[i].network, gamesList[i].url, gamesList[i].champInfo.watchLiveUrl, team1Flair, team2Flair])
    }
  }
  if(rowData[0] != null) { 
    var dataRange = sheet.getRange(2, 1, rowData.length, 12)
    dataRange.setValues(rowData)
  }
  
  //Calls the updateWiki() function to update sidebar
  updateWiki()
}



//Clears the spreadsheet
function clearSpreadsheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  var sheet = SpreadsheetApp.setActiveSheet(ss.getSheets()[0])
  var endRow = sheet.getLastRow()
  sheet.deleteRows(2, endRow-1)
}



//Edits the wiki
function updateWiki() {
  
  //Sets timeNow to current time for reason on updating wiki
  var currentDate = new Date()
  var timeNow = Utilities.formatDate(currentDate, "EST", "MM/d/yyyy h:mma z")
  
  //Initializes spreadsheet
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  var sheet = SpreadsheetApp.setActiveSheet(ss.getSheets()[0])
  var endRow = sheet.getLastRow()
  
  //Gets the access token from the reddit
  var tokenData = UrlFetchApp.fetch('https://ssl.reddit.com/api/v1/access_token', {
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode(ID + ':' + SECRET)
    },
    payload: {
      grant_type: 'password',
      scope: 'wikiread,wikiedit',
      username: USERNAME,
      password: PASSWORD
    }
    
  })
  tokenData = JSON.parse(tokenData)
  var accessToken = tokenData['access_token']
  
  // load the sidebar template from reddit's wiki into templateData
  var templateData = UrlFetchApp.fetch('https://oauth.reddit.com/r/' + SUBREDDIT + '/wiki/sidebar_template.json', {
    headers: {'Authorization': 'bearer ' + accessToken}
  })
  templateData = JSON.parse(templateData)
  var template = templateData['data']['content_md']
  template = template
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
  
  //Header for the table of daily schedule
  var team1Seed, team1Name, team2Seed, team2Name, location, time, network, gameURL, liveURL, flair1, flair2
  var table = "\n\nTime (EST) | Game (Preview) | Network (Live)" + "\n" + "---|:---|---" + "\n"
  
  //Loops through and creates schedule table
  for(var i = 2; i <= endRow; i++) {
    team1Seed = sheet.getRange(i, 1).getValue()
    team1Name = sheet.getRange(i, 2).getValue()
    team2Seed = sheet.getRange(i, 3).getValue()
    team2Name = sheet.getRange(i, 4).getValue()
    location = sheet.getRange(i, 5).getValue()
    time = sheet.getRange(i, 7).getValue().replace(" ET", "")
    network = sheet.getRange(i, 8).getValue()
    gameURL = sheet.getRange(i, 9).getValue()
    liveURL = sheet.getRange(i, 10).getValue()
    flair1 = sheet.getRange(i, 11).getValue()
    flair2 = sheet.getRange(i, 12).getValue()
    
    
    var tableLine = [
      time + " ",
      " " + flair1 + " " + team1Seed + " " + team1Name + " vs. " + flair2 + " " + team2Seed + " " + team2Name + " ([Preview](http://www.ncaa.com" + gameURL + "))",
      " " + network + " ([Live](" + liveURL + "))"
    ].join('|') + "\n"
    table += tableLine
  }

  //Replaces the {{NCAAT_SCHEDULE}} text with the actual schedule table
  var sidebar = template.replace('{{NCAAT_SCHEDULE}}', table)

  //Updates the wiki with the contents of sidebar
  UrlFetchApp.fetch('https://oauth.reddit.com/r/' + SUBREDDIT + '/api/wiki/edit', {
    payload: {
      content: sidebar,
      page: 'config/sidebar',
      reason: 'Automated Google Apps Script update: ' + timeNow
    },
    method: 'post',
    headers: {'Authorization': 'bearer ' + accessToken}
  })
}
