// Created this script for preferences, references, API Keys, and other cluttery stuff we don't want in the main script.

var joobleRestAPIKey = "8b73666c-a465-468c-8234-a431724094ba"; // Until it's reviewed, we are limited to 500 requests. NOT REVIEWED YET!
var adzunaAppID = "b93209db";
var adzunaAPIKey = "4e1dc99959c3767a4c19aef7dcbad4e2";


// Chart Job Object
var jobObjectTemplate = {
    title: "",
    description: "",
    category: "",
    company: "",
    country: "",
    state: "",
    city: "",
    created: "",
    postingURL: "",
    salary: 000 // Optional, some jobs may return null or 0
}