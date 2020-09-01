// Overall TODO ::
// - Let user filter by location (city, state) instead of just country
// - Let user save jobs to localstorage
// Chart Analysis TODO ::
// remove html tags from titles for accurate analylsis

var currentAdzunaResponse = {};

// Chamber's Data
var jobDataForChart = []; // Contains all of the "jobObjectTemplate" objects that have all the revised data for charts
// The following 2 arrays contain the properties and values of the calculated mode of the jobDataForChart. 
// DONT SORT THESE ARRAYS! They are paired in order (so index 0 on properties is paired with index 0 on values)
var modePropertiesArray = [];
var modeValuesArray = [];

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
    });
}

function filterOutDuplicateResponsesFromAdzuna(response) {
    // Make sure there are no identical jobs in the responses.
    let responsesToAdd = [];
    let titles = [];
    // FIXME tylers broken code for filtering out identical responses
    for (let i = 0; i < .length; i++) {
        if(!response) {
            /*
            If responses has the same title as a job in responses to add,
            check to see if they have the same company.
            if so, then stop this iterationn
            
            if response.title === responsesToAdd.title
            {
                
            }
            */
            continue;
        } else {
            responsesToAdd.push(response.results[i]);
        }
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
            newObject.city = responsesToAdd[i].location.area[2];
            newObject.created = responsesToAdd[i].created;
            newObject.postingURL = responsesToAdd[i].redirect_url;
            newObject.salary = responsesToAdd[i].salary_is_predicted;
            // Push this awesome new object to job data!
            jobDataForChart.push(newObject);
        }
}

// ANCHOR Analytical Functions to return information
function getFrequenciesOfProperties() {
    // TODO Nay, can you please let the following variable (property) equal whatever dropdown is selected?
    // So if category is selected, then it equals "category"
    let property = "";
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
        modePropertiesArray.push(element);
        modeValuesArray.push(propertyMapping[element]);
    }
}

makeAdzunaQuery("us", 100, "engineer");

//initializes select box
$(document).ready(function(){
    $('select').formSelect();
});