// Overall TODO ::
// - Let user filter by location (city, state) instead of just country
// - Let user save jobs to localstorage
// Chart Analysis TODO ::
// remove html tags from titles for accurate analylsis
var str = "";
var currentAdzunaResponse = {};
let property = "description"
// Chamber's Data
var jobDataForChart = []; // Contains all of the "jobObjectTemplate" objects that have all the revised data for charts
// The following 2 arrays contain the properties and values of the calculated mode of the jobDataForChart. 
// DONT SORT THESE ARRAYS! They are paired in order (so index 0 on properties is paired with index 0 on values)
var chartLabels = [];
var chartValues = [];

// ANCHOR Queries 🤔
function makeAdzunaQuery(){
    let searchBarEl = document.getElementById("search-bar");

    let countryCode = "us";
    let resultsToAnalyze = 50;
    let titleToSearch = "";
    let keywordsToSearch = searchBarEl.value;

    if(keywordsToSearch === undefined) {
        keywordsToSearch = ""; // If keywords is undefined, set it to "" so it doesn't break the query
    }
    let URL = "https://api.adzuna.com/v1/api/jobs/" + countryCode + "/search/1?app_id=" + adzunaAppID + "&app_key=" + adzunaAPIKey + 
        "&results_per_page=" + resultsToAnalyze + "&what=" + keywordsToSearch + "&title_only=" + titleToSearch;

    // Show Loading Symbol
    $("#spinner").attr("data-active", true);

    $.ajax({
        url: URL,
        method: "GET"
    }).then(function(response) {
        // Hide Loading Symbol
        $("#spinner").attr("data-active", false);

        // Reset Chart and Count
        jobDataForChart = [];
        chartLabels = [];
        chartValues = [];

        console.log("Adzuna Response: ", response);
        
        // responsesToAdd, a new variable that lets us pick the responses we want to use
        let responsesToAdd = filterOutDuplicateResponsesFromAdzuna(response);

        // then, populate the job data array using those new responses
        populateJobDataFromAdzuna(responsesToAdd);

        if(property === "title" || property === "description") {
            // If we're sorting by title or description, get the counts of individual words
            getCountOfWords();
        }
        else {
            // Otherwise, get the count of the full strings
            getCountOfProperties();
        }

        // Populates and displays job listing elements
        displayJobListings();

        // And then create and display the chart
        updateChart();

    });
}

function filterOutDuplicateResponsesFromAdzuna(response) {
    // Make sure there are no identical jobs in the responses.
    // I left in some console.log's, uncomment them to get a better understanding.

    let responsesToAdd = []; // The responses we will end up returning (aka approved responses)
    let companyTitlePairs = []; // array of objects with 'company: title' pairs. We store new approved response company and titles in here.

    // Go through each response
    for (let i = 0; i < response.results.length; i++) {
        let thisResult = response.results[i];

        // If the company of thisResult is equal to a company inside of companyTitlePairs, then proceed
        if(companyTitlePairs.some(el => el.company === thisResult.company.display_name)) {
            // Company exists in responses added!
            
            // Check all of the companyTitlePairs. thisCompaniesPairs are the objects in companyTitlePairs that have the same company name
            let thisCompaniesPairs = companyTitlePairs.filter(el => el.company === thisResult.company.display_name)
            
            // Now we need to see if any of thisCompaniesPairs title's equal thisResult's title
            for(let j = 0; j < thisCompaniesPairs.length; j++) {
                if(thisCompaniesPairs[j].title === thisResult.title) {
                    // HERES A CONSOLE LOG FOR RESULTS THAT ARE FILTERED! 
                    // console.log("Filtering out this duplicate result!", thisResult)
                    break; // Break out of this for loop.
                }
                else {
                    // There was a company that matched the results company, but they don't share the same title! Add it!
                    addNewCompanyTitlePair(thisResult);
                    break; // break out of this for loop.
                }
            }
        }
        else {
            // If thisResult's company doesn't match a company we already have, no need to check any further! Add it!
            addNewCompanyTitlePair(thisResult);
        }
    }

    // console.log("companyTitlePairs are the pairs we already have approved: ", companyTitlePairs);

    // Return this as an array of responses to use.
    return responsesToAdd;

    // This function creates the company:title pairs, then puts them inside companyTitlePairs. 
    function addNewCompanyTitlePair(result){
        let newCompany = result.company.display_name;
        let newTitle = result.title;
        companyTitlePairs.push({company: newCompany, title: newTitle});
        
        // console.log("This company title pair: ", companyTitlePairs);

        responsesToAdd.push(result);
    }
}

function populateJobDataFromAdzuna(responsesToAdd) {
        // For each response, construct a new object from template and then push it to the job data array
        let newObject;
        for(let i = 0; i < responsesToAdd.length; i++) {
            newObject = {
                ...jobObjectTemplate // Clone the template
            }
            newObject.title = responsesToAdd[i].title;
            newObject.description = responsesToAdd[i].description;
            newObject.category = responsesToAdd[i].category.label;
            newObject.company = responsesToAdd[i].company.display_name;
            newObject.country = responsesToAdd[i].location.area[0];
            newObject.state = responsesToAdd[i].location.area[1];
            newObject.city = responsesToAdd[i].location.area[3];
            newObject.created = responsesToAdd[i].created;
            newObject.postingURL = responsesToAdd[i].redirect_url;
            newObject.salary = responsesToAdd[i].salary_is_predicted;
            // Push this awesome new object to job data!
            jobDataForChart.push(newObject);
        }
}

function displayJobListings() {
    let jobRowEl = document.getElementById("job-row");
    $(jobRowEl).find("tbody").empty();
    for(let i = 0; i < jobDataForChart.length; i++) {
        // Create a new listing by cloning the template variable
        let newListing = $(jobListingTemplate).clone();
        // Set the text/data of the new listing
        $(newListing).children("#listingTitle").text(jobDataForChart[i].title);
        $(newListing).children("#listingCompany").text(jobDataForChart[i].company);
        $(newListing).children("#listingURL").children("a").text("View Posting").attr("href", jobDataForChart[i].postingURL);
        $(jobRowEl).find("tbody").append(newListing);
    }
}

// ANCHOR Analytical Functions to return information
function getCountOfProperties() {
    let propertyMapping = {}; // This records the frequency of the key
    
    // Get the frequency of keys in job data
    for (let i = 0; i < jobDataForChart.length; i++) {
        let thisProperty = jobDataForChart[i][property]; // The keys index, and its frequency
        // If the current key doesn't exist in the keymap yet, declare it with the value 0.
        if(propertyMapping[thisProperty] === undefined) {
            propertyMapping[thisProperty] = 0; 
        }
        propertyMapping[thisProperty] ++;
    }
    
    pushDataToChartVariables(propertyMapping);
}


// if the word is not included in the forbiddenWordsArray, push that word to the newArray
function filterWordCount(unfilteredWords) {
    var forbiddenWordsArray = ['<strong>','</strong>','and','to','in','a','...',' ','the','<strong>Developer</strong>','<strong>developer</strong>']
    var filteredWords = []
    for (i = 0; i < unfilteredWords.length; i++) {
        if (!forbiddenWordsArray.includes(unfilteredWords[i])) {
            filteredWords.push(unfilteredWords[i])
          }
       
    }
    return filteredWords;
}   


function getCountOfWords() {
    // This combines the descriptions from each job listing (multiple strings) into one string
    // Chambers, I changed this from looping thru response.results to jobDataForChart (jobDataForChart has all of the information we need after filtering duplicated) - Tyler
    for(var i = 0; i < jobDataForChart.length; i++){
        str = str + " " + jobDataForChart[i][property];
        }
    
     console.log(str.split(' '));
    
    
    // Takes the string made from the for loop above and separates each word and its word count of 
    //  each word and put them in their own array in the str array
    let unfilteredWords = str.split(' ')
    let filteredWords = filterWordCount(unfilteredWords);
    let count = {}
    for(let word of filteredWords){
        count[word] ? count[word]++ : count[word] = 1
    }
    
    console.log(count);
    pushDataToChartVariables(count);
}


function pushDataToChartVariables(objectToPush) {
    // This function will handle the pushing of data to the chart variables, and how many datasets it will display (topXResults).
    // If words need to be filtered out, they need to be filtered out before this function is called
    let topResults = findTopResultsInCountObjects();
    if(topResults) {
        for (let i = 0; i < topResults.length; i++) {
            // Populate both arrays
            let thisResult = topResults[i];
            chartLabels.push(thisResult.property);
            chartValues.push(thisResult.value);
        }
    }
    else {
        console.log("Can't push data to chart! topResults from findTopResultsInCountObjects: ", topResults);
    }
    
    // This will find the 'topX' results from count objects, and return those.
    function findTopResultsInCountObjects() {
        let lastPlaceValue = 0;
        let topResults = [];

        for (let element in objectToPush) {
            // element is the property
            // objectToPush[element] is the value
            if(objectToPush[element] > lastPlaceValue) {
                topResults.push({property: element, value: objectToPush[element]}); // Push new result to topResult
                topResults.sort((a, b) => (a.value > b.value) ? -1 : 1); // Sort topResults by descending order
                if(topResults.length > resultsToDisplay) {
                    topResults.pop(); // Remove last element in array
                    lastPlaceValue = topResults[topResults.length - 1].value; // lastPlaceValue = the last place in topResults
                }
            }
        }
        return topResults;
    }
}

//filter system
// var allWords = [..this comes from the 3rd party API..];
// var eligibleKeyWords = []; // a fresh array
// var ineligibleKeyWords = ["and", "...", "the", "to", "for", ..... etc ];

// for loop...
//   if allWords[i] is NOT in ineligibleKeyWords array
//     push to the new eligibleKeyWords array  

//initializes select box
$(document).ready(function(){
    $('select').formSelect();
});

// ANCHOR Event Listeners

// nays code-- function to make dropdown work
window.onload=function() { // when the page has loaded 
    document.getElementById("select1").onchange=function() { 
        property = this.value 
        console.log (property)
    } 
} 

// Go Button
let goButtonEl = document.getElementById("go-button");
$(goButtonEl).on("click", makeAdzunaQuery);

// On Key Down, anywhere
document.addEventListener('keydown', function (event) {
    bobEasterEgg(event);
});

// Bob Easter Egg
let wasBPressed = false;
let wasOPressed = false;
function bobEasterEgg() {
    let key = event.key || event.keyCode;
    if(key === "b" || key === 66) {
        if(wasBPressed && wasOPressed) {
            // Final B
            wasBPressed = false;
            wasOPressed = false;
            alert("Bob!");
        }
        else {
            wasBPressed = true;
        }
    }
    else if((key === "o" || key === 79) && wasBPressed) {
        wasOPressed = true;
    }
    else {
        wasBPressed = false;
        wasOPressed = false;
    }
}