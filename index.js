/*
Notes: SSL certificate and CORS headers are handled by a proxy in my nginx config
*/

const express = require('express');
const api = require('./apigateway');
const cacheCharacters = require('./cache-characters.js');
const fs = require('fs').promises;
require('dotenv').config({ path: __dirname + '/.env' });

const { APP_PORT } = process.env;

const app = express();
app.use(express.json());

//error handler middleware
function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}
app.use(errorHandler);

//route for fetching marvel characters, returns list of characters by name, nameStartsWith or all if no name is specified in request
app.get('/marvel/characters', async (req, res, next) => {
    try {
        const data = {
            name: req.query.name || '',
            nameStartsWith: req.query.nameStartsWith || ''
        };
        const results = await api('characters', data);
        res.status(200).json(results);
    } catch (error) {
        next(error); 
    }
});

//route for fetching all comics from a characters, returns list of comics
app.get('/marvel/comics', async (req, res, next) => {
    try {
        const data = { character: req.query.character };
        const results = await api('comics', data);
        await api('comicsCSV', results, data, 'SAVE');
        res.status(200).json(results);
    } catch (error) {
        next(error);
    }
});

//route for downloading list of comics as a csv
app.get('/marvel/comicsCSV', async (req, res, next) => {
    try {
        const data = { character: req.query.character };
        const results = await api('comicsCSV', '', data, 'GET');
        res.setHeader('Content-disposition', `attachment; filename=${data.character}.csv`);
        res.set('Content-Type', 'text/csv');
        res.status(200).send(results);
    } catch (error) {
        next(error); // Pass error to the error handler middleware
    }
});

//route for fetching list of characters, to populate the character input box on the website
app.get('/marvel/cache', async (req, res, next) => {
    try {
        const cache = await fs.readFile('./cache/cache-characters.json', 'utf8');
        res.status(200).json(JSON.parse(cache));
    } catch (error) {
        next(error); // Pass error to the error handler middleware
    }
});

//start server
const server = app.listen(APP_PORT, () => {
    console.log(`Server is running on port ${APP_PORT}`);
});

//stop server on system shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close();
    process.exit(0);
});

//initialize caching of list of characters, refresh every 24 hours
cacheCharacters();
const cacheInterval = setInterval(cacheCharacters, 86400000); // cache refresh interval

module.exports = app;
