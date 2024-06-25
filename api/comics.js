const fetch = require('node-fetch');
require('dotenv').config();
const md5 = require('../md5');

const { MARVEL_PUBLIC_KEY, MARVEL_PRIVATE_KEY } = process.env; //api keys

//function to fetch a list of comics for a character
async function fetchComics(character, timeStamp, hash, limit, offset = 0) {
    const url = `http://gateway.marvel.com/v1/public/comics?characters=${character}&ts=${timeStamp}&apikey=${MARVEL_PUBLIC_KEY}&hash=${hash}&limit=${limit}&offset=${offset}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`); //api call failed
        }
        return await response.json();
    } catch (error) {
        console.error(`Fetch error: ${error.message}`); //unknown error occurred
        return null;
    }
}

//function to fetch all cominc pages in parallel
async function comics(input) {
    
    const timeStamp = Date.now();
    const hash = md5(timeStamp, MARVEL_PRIVATE_KEY, MARVEL_PUBLIC_KEY); //creating hash for api request as required by marvel

    const limit = 100; //comics per page

    //initial request to get first {limit} comics and figure out how many there are in total
    const initialResponse = await fetchComics(input.character, timeStamp, hash, limit);
    if (!initialResponse) {
        return { error: 'Failed to fetch comics data' };
    }
    
    const total = initialResponse.data.total; //total # of comics
    let results = initialResponse.data.results; //array with comics data
    const totalPages = Math.ceil(total / limit); //calculated # of pages to get all comics

    //creating an array with promises to request the rest of the pages in parallel
    const fetchPromises = [];
    for (let i = 1; i < totalPages; i++) {
        fetchPromises.push(fetchComics(input.character, timeStamp, hash, limit, i * limit));
    }

    //collection of all pages
    const pages = await Promise.all(fetchPromises);
    pages.forEach(page => {
        if (page && page.data && page.data.results) {
            results = results.concat(page.data.results); //concatenaning the coomics data of each page to the initial request's data
        }
    });

    return { data: { total, results } }; //returns data object with comics and total # of comics
}

module.exports = comics;
