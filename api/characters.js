const fetch = require('node-fetch');
const md5 = require('../md5');
const path = require('path')
require('dotenv').config({ path: __dirname + '/../.env' });
const { MARVEL_PUBLIC_KEY, MARVEL_PRIVATE_KEY } = process.env;

async function characters(data) {
    const timeStamp = Date.now();
    const hash = md5(timeStamp, MARVEL_PRIVATE_KEY, MARVEL_PUBLIC_KEY); //creates md5 hash as required by marvel for server-side apps

    let url;

    //three reqest modes depending on parameters passed to the module
    if (data.name && data.name !== '') { //gets character by name
        url = `http://gateway.marvel.com/v1/public/characters?name=${data.name}&ts=${timeStamp}&apikey=${MARVEL_PUBLIC_KEY}&hash=${hash}`;
    } else if (data.nameStartsWith && data.nameStartsWith !== '') {//gets characters with name that start with x
        url = `http://gateway.marvel.com/v1/public/characters?nameStartsWith=${data.nameStartsWith}&ts=${timeStamp}&apikey=${MARVEL_PUBLIC_KEY}&hash=${hash}`;
    } else {//gets all characters
        url = `http://gateway.marvel.com/v1/public/characters?ts=${timeStamp}&apikey=${MARVEL_PUBLIC_KEY}&hash=${hash}&limit=100`;
    }

    try {
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`); //the request failed
        }

        const responseData = await response.json();
        const total = responseData.data.total;
        let results = responseData.data.results;

       //handling pagination
        const totalPages = Math.ceil(total / 100); //total pages to fetch
        if (totalPages > 1) {
            const fetchPromises = []; 
            for (let i = 1; i < totalPages; i++) {
                fetchPromises.push(fetch(`${url}&offset=${i * 100}`)); //add each pagination request to a promise array
            }
            const additionalResponses = await Promise.all(fetchPromises); //resolve all promises in parallel (more eficient than one by one)
            for (const res of additionalResponses) {
                const additionalData = await res.json(); //gets json body from each pagination request
                results = results.concat(additionalData.data.results); //concatenates the results of the pagination requests to the initial request
            }
        }

        return {data: { total, results }}; //returns total and list of characters
    } catch (error) {
        console.error('Error fetching Marvel characters:', error.message);
        throw error;
    }
}

module.exports = characters;
