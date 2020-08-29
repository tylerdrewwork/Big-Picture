// Overall TODO ::
// - Let user filter by location (city, state) instead of just country
// - Let user save jobs to localstorage
// Chart Analysis TODO ::
// remove html tags from titles for accurate analylsis

var currentAdzunaResponse = {};
var jobDataForChart = [];

// ANCHOR Queries 🤔

// These weird comments below are JS Docs. If you hover over makeAdzunaQuery you can see that they help describe these functions in depth
/**
 * @param {string} countryCode - 2 letter code for the country to search in
 * @param {number} resultsToAnalyze - Default 10. Results to display from a query.
 * @param {string} title - Title Keyword to searh for
 * @param {string} keywords - Keywords to search for in any part of the Job Posting. Separated with spaces. Equals "" if null.
 */
function makeAdzunaQuery(countryCode, resultsToAnalyze, title, keywords){
    // TODO make these grab from inputs on the html
    if(keywords === undefined) {
        // If keywords is undefined, set it to "" so it doesn't break the query
        keywords = "";
    }
    let URL = "https://api.adzuna.com/v1/api/jobs/" + countryCode + "/search/1?app_id=" + adzunaAppID + "&app_key=" + adzunaAPIKey + 
        "&results_per_page=" + resultsToAnalyze + "&what=" + keywords + "&title_only=" + title;

    $.ajax({
        url: URL,
        method: "GET"
    }).then(function(response) {
        console.log("Adzuna Response: ", response);
        
        // Make sure there are no identical jobs in the responses
        let foundAdrefs = [];
        let responsesToAdd = [];
        for (let i = 0; i < response.results.length; i++) {
            if(foundAdrefs.includes(response.results[i].adref)) {
                continue;
            } else {
                foundAdrefs.push(response.results[i].adref);
                responsesToAdd.push(response.results[i]);
            }
        }
        console.log(responsesToAdd);

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

        getModeOfProperty('title'); // TODO Tyler remove after done testing
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
    let keyMapping = {}; // This records the frequency of the key
    
    // Get the frequency of keys in job data
    for (let i = 0; i < jobDataForChart.length; i++) {
        let thisKeyValueFrequency = jobDataForChart[i][property]; // The keys index, and its frequency

        // If the current key doesn't exist in the keymap yet, declare it with the value 0.
        if(keyMapping[thisKeyValueFrequency] === undefined) {
            keyMapping[thisKeyValueFrequency] = 0; 
        }
        keyMapping[thisKeyValueFrequency] ++;
    }

    // Get the highest frequency
    for (let element in keyMapping) {
        if (keyMapping[element] > greatestFreq) {
            greatestFreq = keyMapping[element];
            mode = element;
        }
    }
    
    console.log("Mode: ", mode, " || this keyMap: ", keyMapping);
    return mode;
}

makeAdzunaQuery("us", 25, "developer");

