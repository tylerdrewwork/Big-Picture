// Overall TODO ::
// - Let user filter by location (city, state) instead of just country
// - Let user save jobs to localstorage
// Chart Analysis TODO ::
// remove html tags from titles for accurate analylsis

var currentAdzunaResponse = {};
var jobDataForChart = [];

function makeAdzunaQuery(){
    // Query Parameters
    // TODO make these grab from inputs on the html
    let keywordTitle = "Javascript"; // Keyword to search for in the Title.
    let keywordAny = "" // Keyword to search for in any part of the Job Posting.
    let countryCode = "us"; // Country Code is the 2 letter code for the country to search in
    let resultsPerPage = 10; // Default 10. Results to display from a query.
    let URL = "https://api.adzuna.com/v1/api/jobs/" + countryCode + "/search/1?app_id=" + adzunaAppID + "&app_key=" + adzunaAPIKey + 
        "&results_per_page=" + resultsPerPage + "&what=" + keywordAny + "&title_only=" + keywordTitle;

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
    });
}

makeAdzunaQuery();