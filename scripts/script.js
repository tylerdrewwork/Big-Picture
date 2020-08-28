// Overall TODO ::
// - Let user filter by location (city, state) instead of just country

var currentAdzunaResponse = {};

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
        console.log("Adzuna Response: ", response);
    });
}

makeAdzunaQuery();