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
var jobDataPropertyNames = [];
var jobDataPropertyFrequencies = [];

// ANCHOR Queries 🤔
function makeAdzunaQuery(){
    let searchBarEl = document.getElementById("search-bar");

    let countryCode = "us";
    let resultsToAnalyze = 25;
    let titleToSearch = "";
    let keywordsToSearch = searchBarEl.value;

    if(keywordsToSearch === undefined) {
        keywordsToSearch = ""; // If keywords is undefined, set it to "" so it doesn't break the query
    }
    let URL = "https://api.adzuna.com/v1/api/jobs/" + countryCode + "/search/1?app_id=" + adzunaAppID + "&app_key=" + adzunaAPIKey + 
        "&results_per_page=" + resultsToAnalyze + "&what=" + keywordsToSearch + "&title_only=" + titleToSearch;

    $.ajax({
        url: URL,
        method: "GET"
    }).then(function(response) {
        console.log("Adzuna Response: ", response);
        
        // responsesToAdd, a new variable that lets us pick the responses we want to use
        let responsesToAdd = filterOutDuplicateResponsesFromAdzuna(response);

        // then, populate the job data array using those new responses
        populateJobDataFromAdzuna(responsesToAdd);

        // After that, get the frequencies of all the properties
        getFrequenciesOfProperties();

        // And then create and display the chart
        makeChart();

           
        // This combines the descriptions from each job listing (multiple strings) into one string
        for(var i = 0; i < response.results.length; i++){
        str = str + " " + response.results[i].description
        }

        console.log(str.split(' '));

        // Takes the string made from the for loop above and separates each word and its word count of 
        //  each word and put them in their own array in the str array
            // Stretch GOAL: add a way to make sure similar words are committed to the same word count
            //ex. Making sure Work and work go together, maybe use something like toLowerCase();
        let words = str.split(' ')
        let count = {}
        for(let word of words){
            count[word] ? count[word]++ : count[word] = 1
        }
        console.log(count);

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

    // nays code-- function to make dropdown work
    window.onload=function() { // when the page has loaded 
        document.getElementById("select1").onchange=function() { 
        property = this.value 
        console.log (property)
        } 
      } 


// ANCHOR Analytical Functions to return information
function getFrequenciesOfProperties() {
    // TODO Nay, can you please let the following variable (property) equal whatever dropdown is selected?
    // So if category is selected, then it equals "category"



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

    for (let element in propertyMapping) {
        // Populate both arrays
        jobDataPropertyNames.push(element);
        jobDataPropertyFrequencies.push(propertyMapping[element]);
    }


}



//initializes select box
$(document).ready(function(){
    $('select').formSelect();
});

// ANCHOR Event Listeners

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