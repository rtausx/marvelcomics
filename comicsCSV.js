const fs = require('fs').promises;
const path = require('path');

//turns comics data into a CSV OR reads CSV with comics data, depends on the method used
async function comicsCSV(comicsData, data, method) {
    const filePath = path.join(__dirname, 'cache' , `${data.character}.csv`); //relative file path to cache folder in the project folder
    const csvHeader = '*id*,*title*,*description*,*url*,*thumbnail*,*year*\n'; //csv header

    if (method === 'SAVE') { //intends to save the csv (after downloading all comics)
        try {
            if (!comicsData || !comicsData.data || !Array.isArray(comicsData.data.results)) {
                throw new Error('Invalid comicsData format');
            }
            let csv = csvHeader;

            comicsData.data.results.forEach(comic => { //looping through each comic
                const {//destructuring comic data
                    id,
                    title,
                    description,
                    urls,
                    thumbnail,
                    dates
                } = comic;
                const year = new Date(dates[0].date).getFullYear();
                const url = urls[0].url;
                const thumbnailUrl = `${thumbnail.path}.${thumbnail.extension}`;

                csv += `*${id}*,*${title}*,*${description || ''}*,*${url}*,*${thumbnailUrl}*,*${year}*\n`; //concatenating comic data to csv
            });

            await fs.writeFile(filePath, csv, 'utf8');
        } catch (error) {
            console.error(`Error saving CSV file: ${error.message}`);
        }
    } else if (method === 'GET') { //intends to get the csv (i.e. when clicking the download button from the site)
        try {
            const csv = await fs.readFile(filePath, 'utf8'); //read the csv
            return csv; //returns the csv data to be served later
        } catch (error) {
            console.error(`Error reading CSV file: ${error.message}`);
        }
    } else {
        throw new Error('Invalid method. Use "SAVE" or "GET".');
    }
}

module.exports = comicsCSV;
