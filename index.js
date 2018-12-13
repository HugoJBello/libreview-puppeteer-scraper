require('dotenv').load();

const LibreViewScraper = require("./LibreViewScraper");
const DataAccess = require("./DataAccess");

const dataAccess = new DataAccess();
const scraper = new LibreViewScraper();

(async () => {
    const username = process.env['EMAIL'];
    const password = process.env['PASSWORD'];

    const credentials = {
        username: username,
        password: password
    }

    const data = await scraper.startScraper(credentials);
    dataAccess.saveData(data, username);


})();