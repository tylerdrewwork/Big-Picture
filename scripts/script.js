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
    let title = "";
    let keywords = searchBarEl.value;

    if(keywords === undefined) {
        keywords = ""; // If keywords is undefined, set it to "" so it doesn't break the query
    }
    let URL = "https://api.adzuna.com/v1/api/jobs/" + countryCode + "/search/1?app_id=" + adzunaAppID + "&app_key=" + adzunaAPIKey + 
        "&results_per_page=" + resultsToAnalyze + "&what=" + keywords + "&title_only=" + title;

    $.ajax({
        url: URL,
        method: "GET"
    }).then(function(response) {
        console.log("Adzuna Response: ", response);
        
        // Make sure there are no identical jobs in the responses.
        let responsesToAdd = [];
        // FIXME tylers broken code for filtering out identical responses
        for (let i = 0; i < response.results.length; i++) {
            //for (let j = 0; j < responsesToAdd.length; j++) {
            //    for each response, go through each responsesToAdd
            //    if(response.results[i].title ===)
            //}
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
        console.log("Job Data For Chart: ", jobDataForChart);
        getModeOfProperty(); // TODO Tyler remove after done testing
        makeChart();
    });
}

// ANCHOR Analytical Functions to return information

/**
 * @desc Gets the most recurring value of "key" throughout the list of job data.
 * @example getModeOfKey('title'); // will get the most recurring titles throughout the job data. 
 */
function getModeOfProperty() {
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