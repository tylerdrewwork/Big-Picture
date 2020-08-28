

function makeAdzunaQuery(){
    // Query Parameters
    let countryCode = "us"; // Country Code is the 2 letter code for the country to search in

    let URL = "https://api.adzuna.com/v1/api/jobs/" + countryCode + "/search/1?app_id=" + adzunaAppID + "&app_key=" + adzunaAPIKey + "&/json";

    $.ajax({
        url: URL,
        method: "GET"
    }).then(function(response) {
        console.log("Adzuna Response: ", response);
    });
}

makeAdzunaQuery();