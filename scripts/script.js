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

// These weird comments below are JS Docs. If you hover over makeAdzunaQuery you can see that they help describe these functions in depth
/**
 * @param {string} countryCode - 2 letter code for the country to search in
 * @param {number} resultsToAnalyze - Default 10. Results to display from a query.
 * @param {string} title - Title Keyword to search for
 * @param {string} keywords - Keywords to search for in any part of the Job Posting. Separated with spaces. Equals "" if null.
 */

function makeAdzunaQuery(countryCode, resultsToAnalyze, title, keywords){
    // TODO make these grab from inputs on the html
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
        getModeOfProperty('city'); // TODO Tyler remove after done testing
        makeChart();
    });
}

// ANCHOR Analytical Functions to return information

/**
 * @desc Gets the most recurring value of "key" throughout the list of job data.
 * @example getModeOfKey('title'); // will get the most recurring titles throughout the job data. 
 */
function getModeOfProperty(property) {
    /* tylers Pseudo code
    1. add all of the keys to an array
    2. look through the array and see which is most common
    3. return that key
    */
   
    let mode = "";
    let greatestFreq = 0;
    let propertyMapping = {}; // This records the frequency of the key
    
    // Get the frequency of keys in job data
    for (let i = 0; i < jobDataForChart.length; i++) {
        let thisKeyValueFrequency = jobDataForChart[i][property]; // The keys index, and its frequency

        // If the current key doesn't exist in the keymap yet, declare it with the value 0.
        if(propertyMapping[thisKeyValueFrequency] === undefined) {
            propertyMapping[thisKeyValueFrequency] = 0; 
        }
        propertyMapping[thisKeyValueFrequency] ++;
    }

    // Get the highest frequency
    for (let element in propertyMapping) {
        if (propertyMapping[element] > greatestFreq) {
            greatestFreq = propertyMapping[element];
            mode = element;
        }

        // Populate both arrays
        modePropertiesArray.push(element);
        modeValuesArray.push(propertyMapping[element]);
    }
}

makeAdzunaQuery("us", 100, "engineer");

