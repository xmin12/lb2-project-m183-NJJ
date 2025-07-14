const axios = require('axios');
const querystring = require('querystring');

// Whitelist erlaubter Provider-Pfade
const allowedProviders = [
    '/search/v2/',
    '/search/v1/',
    '/api/data/'
];

async function getHtml(req) {
    if (req.body.provider === undefined || req.body.terms === undefined || req.body.userid === undefined){
        return "Not enough information provided";
    }

    let provider = req.body.provider;
    let terms = req.body.terms;
    let userid = req.body.userid;

    // Validierung: provider darf nur in allowedProviders sein
    if (!allowedProviders.includes(provider)) {
        return `Invalid provider: ${provider}`;
    }

    await sleep(1000); // this is a long, long search!!

    let theUrl = 'http://localhost:3000' + provider + '?userid=' + encodeURIComponent(userid) + '&terms=' + encodeURIComponent(terms);
    let result = await callAPI('GET', theUrl, false);
    return result;
}

async function callAPI(method, url, data){
    let noResults = 'No results found!';
    let result;

    switch (method){
        case "POST":
            if (data) {
                result = await axios.post(url, data)
                    .then(response => response.data)
                    .catch(error => noResults);
            } else {
                result = await axios.post(url)
                    .then(response => response.data)
                    .catch(error => noResults);
            }
            break;
        case "PUT":
            if (data) {
                result = await axios.put(url, data)
                    .then(response => response.data)
                    .catch(error => noResults);
            } else {
                result = await axios.put(url)
                    .then(response => response.data)
                    .catch(error => noResults);
            }
            break;
        default:
            if (data)
                url = url + '?' + querystring.stringify(data);

            result = await axios.get(url)
                .then(response => response.data)
                .catch(error => noResults);
    }

    return result ? result : noResults;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = { html: getHtml };
