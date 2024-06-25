const crypto = require('crypto');

//return md5 hash of timestamp, private key and public key, as required by Marvel for server side apps
function md5(timestamp, privateKey, publicKey) {
    if (typeof timestamp !== 'number' || typeof privateKey !== 'string' || typeof publicKey !== 'string') {
        throw new Error('Invalid input for md5 hash');
    }

    const dataToHash = timestamp + privateKey + publicKey;

    const hash = crypto.createHash('md5').update(dataToHash).digest('hex');//generates hash

    return hash; //returns hash
}

module.exports = md5;
