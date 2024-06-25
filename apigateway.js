const characters = require('./api/characters');
const comics = require('./api/comics');
const comicsCSV = require('./comicsCSV');

//api gateway - routes incoming requests to the relevant module
async function api(route, data, character, method) {
    try {
        switch (route) {
            case 'characters':
                return await characters(data); //to work with characters
            case 'comics':
                return await comics(data); //to work with comics
            case 'comicsCSV':
                return await comicsCSV(data, character, method); //to work with comicsCSV data
            default:
                throw new Error(`route not defined: ${route}`);
        }
    } catch (error) {
        console.error(`Error in API route '${route}':`, error.message);
        throw error; 
    }
}

module.exports = api;
