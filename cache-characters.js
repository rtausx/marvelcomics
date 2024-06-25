const api = require('./apigateway');
const fs = require('fs').promises; 

//caching of character names to populate search box on the website
async function cache() { 
    try {
        const characters = { characters: [] };
        const data = await api('characters', {}); 

        data.data.results.forEach(result => {
            characters.characters.push(result.name); //adds the character's name to the array
        });

        await fs.writeFile('./cache/cache-characters.json', JSON.stringify(characters), 'utf8'); 

        console.log('Cached characters:', characters);
    } catch (error) {
        console.error('Error caching characters:', error.message);
        throw error; 
    }
}

module.exports = cache;