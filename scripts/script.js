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
        // For each response, construct a new object from template and then push it to the job data array
        console.log("Adzuna Response: ", response);
        let newObject;
        for(let i = 0; i < response.results.length; i++) {
            newObject = {
                ...jobObjectTemplate // Clone the template
            }
            newObject.title = response.results[i].title;
            newObject.description = response.results[i].description;
            newObject.category = response.results[i].category.label;
            newObject.company = response.results[i].company.display_name;
            newObject.country = response.results[i].location.area[0];
            newObject.state = response.results[i].location.area[1];
            newObject.city = response.results[i].location.area[2];
            newObject.created = response.results[i].created;
            newObject.postingURL = response.results[i].redirect_url;
            newObject.salary = response.results[i].salary_is_predicted;
            // Push this awesome new object to job data!
            jobDataForChart.push(newObject);
        }
        getModeOfKey('title'); // TODO Tyler remove after done testing
    });
}

// ANCHOR Analytical Functions to return information

/**
 * @desc Gets the most recurring value of "key" throughout the list of job data.
 * @example getModeOfKey('title'); // will get the most recurring titles throughout the job data. 
 */
function getModeOfKey(key) {
    /* tylers Pseudo code
    1. add all of the keys to an array
    2. look through the array and see which is most common
    3. return that key
    */
   
    let mode;
    let keyMapping = {};
    for (let i = 0; i < jobDataForChart.length; i++) {
        
    }

    
    // console.log(jobDataForChart[0][key]);
    return mode;
}

makeAdzunaQuery("us", 10, "javascript");

