var currentQuote = "";

function getQuote() {
    $.ajax({
        url: "https://type.fit/api/quotes",
        method: "GET"
    }).then(function (response) {
        let quotes = JSON.parse(response);
        let quoteIndex = Math.floor(Math.random() * quotes.length)
        currentQuote = quotes[quoteIndex];
        displayQuote();
    })
}

function displayQuote() {
    let quoteEl = document.getElementById("quote-content");
    let authorEl = document.getElementById("quote-author");
    quoteEl.textContent = currentQuote.text;
    authorEl.textContent = "- " + currentQuote.author;
}

getQuote();