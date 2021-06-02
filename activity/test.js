const puppeteer = require("puppeteer");
const fs = require("fs");
const xl = require('excel4node');
const wb = new xl.Workbook();
const ws = wb.addWorksheet('Worksheet Name');

let trainList = [];
let trainNoList = [];
let sourceStationList = [];
let destinationStationList = [];
let endTimeList = [];
let startTimeList = [];
let a = [];

async function openRail(){

    // Launching the broswer
    let browser = await puppeteer.launch({headless : false , 
        defaultViewport : null, 
        args: ["--start-maximized"]});
        let page = await browser.newPage();


    // Opening up the Website easeMyTrip.com & then going to Trains section */
    await page.goto("https://www.easemytrip.com/");
    await page.waitForSelector('div[class="emt_nav"] a',{visible : true});
    let linkBar = await page.$$('div[class="emt_nav"] a');
    let aTag = linkBar[2];
    await page.waitForTimeout(1500);
    let train_link = await page.evaluate(function(elt){ return elt.getAttribute("href"); },aTag );
    await page.goto(train_link);
    await page.waitForTimeout(1500);
   
    
    /* Writting the Source point , destination point and the date for which we want the details of trains running from source to destination.*/
    await page.type('input[placeholder="From"]', "Delhi",{delay : 300});
    await page.waitForTimeout(1000);
    await page.type('input[placeholder="To"]', "Varanasi" , {delay : 300});
    await page.waitForTimeout(1000);
    await page.click('span[id="NextSecondDayName"]');
    await page.waitForTimeout(1000);
    await page.click('input[value="Search Train"]');
    

    /*Took the screenshot of the Page where all the details of trains are mentioned that are running from source to destination.*/
    await page.waitForTimeout(3000);
    await page.waitForSelector('.right_pannel',{visible : true});
    let  element = await page.$('.right_pannel');
    await element.screenshot({path:'track_trains.png'});
           

   /*Using functions to get the Train_Name , Source_Station_Name , Destination_Station_Name , Train_Number , Starting_Time , Arriving_Time*/
   await page.waitForTimeout(2000);
   let trainNm = await getTrainNames(page);
   let trainNo = await getTrainNumber(page);
   let sourceStationNm = await getSourceStationName(page);
   let destinationStationNm = await getDestinationStationName(page);
   let startTime = await getStartTime(page)
   let arrivingTime = await getEndTime(page)
   

   /*Made a JSON file that will have all the deatils Train_Name , Source_Station_Name , Destination_Station_Name , Train_Number , Starting_Time , Arriving_Time */
   for (let i = 0 ; i < 11 ; i++){
       let data = {};
       data["Train_Name"] = trainNm[i];
       data["Source_Station_Name"] =  sourceStationNm[i];
       data["Destination_Station_Name"] = destinationStationNm[i];
       data["Train_Number"] = trainNo[i];
       data["Starting_Time"] = startTime[i];
       data["Arriving_Time"] = arrivingTime[i];
       a.push(data);
   }
   fs.writeFileSync("jsonfile.JSON" , JSON.stringify(a)); // JSON file


   /*Provided Column Names for Excel Sheet*/
   const headingColumnNames = [
    "Train_Name",
    "Source_Station_Name",
    "Destination_Station_Name",
    "Train_Number",
    "Starting_Time",
    "Arriving_Time"
]


let headingColumnIndex = 1;
headingColumnNames.forEach(heading => {
    ws.cell(1, headingColumnIndex++)
        .string(heading)
});

/* Wrote  Data in Excel file of all the running trians for the particular date */
let rowIndex = 2;
a.forEach( record => {
    let columnIndex = 1;
    Object.keys(record ).forEach(columnName =>{
        ws.cell(rowIndex,columnIndex++)
            .string(record [columnName])
    });
    rowIndex++;
}); 
wb.write('Trains_Data.xlsx'); 
   
   await browser.close();
}
openRail();



async function getTrainNames(page){
    await page.waitForTimeout(2000);
    let allTrainNames = await page.$$(".tr-name.ng-binding");
    for(let i = 0 ; i < allTrainNames.length ; i++){
        let trainName = await page.evaluate(function(elt){ return elt.innerText ; }, allTrainNames[i]); 
        trainList.push(trainName);   
    }
   return trainList;
}

async function getTrainNumber(page){
    await page.waitForTimeout(2000);
    let allTrainNo = await page.$$(".tr-no.ng-binding");
    for(let i = 0 ; i < allTrainNo.length ; i++){
        let trainNo = await page.evaluate(function(elt){ return elt.innerText.slice(11) ; }, allTrainNo[i]); 
       trainNoList.push(trainNo);   
    }
  return trainNoList;
}

async function getSourceStationName(page){
    await page.waitForTimeout(2000);
    let allStationName = await page.$$(".tr-statn.ng-binding");

    for(let i = 0 ; i < allStationName.length ; i++){
        if(i % 2 == 0 ){
        let stationName = await page.evaluate(function(elt){ return elt.innerText ; }, allStationName[i]); 
       sourceStationList.push(stationName);
        }   
    }
    return sourceStationList;
}

async function getDestinationStationName(page){

    await page.waitForTimeout(2000);
    let allStationName = await page.$$(".tr-statn.ng-binding");

    for(let i = 0 ; i < allStationName.length ; i++){
        if(i % 2 == 1 ){
        let stationName = await page.evaluate(function(elt){ return elt.innerText ; }, allStationName[i]); 
       destinationStationList.push(stationName);

        }   
    }
    return destinationStationList;
}

async function getStartTime(page){
    await page.waitForTimeout(2000);
    let allStartTimes = await page.$$(".tr-tme.ng-binding");

    for(let i = 0 ; i < allStartTimes.length ; i++){
        if(i % 2 == 0 ){
        let startTime = await page.evaluate(function(elt){ return elt.innerText ; }, allStartTimes[i]); 
       startTimeList.push(startTime);
        }   
    }
    return startTimeList;
}

async function getEndTime(page){
    await page.waitForTimeout(2000);
    let allEndTimes = await page.$$(".tr-tme.ng-binding ");

    for(let i = 0 ; i < allEndTimes.length ; i++){
        if(i % 2 == 1 ){
        let endTime = await page.evaluate(function(elt){ return elt.innerText ; }, allEndTimes[i]); 
       endTimeList.push(endTime);
        }   
    }
    return endTimeList;
}

