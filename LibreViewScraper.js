const puppeteer = require('puppeteer');
const randomUA = require('modern-random-ua');


module.exports = class LibreViewScraper {
    constructor() {
        this.loginUrl = "https://www2.libreview.com/Accounts/Login?lang=es&country=ES";
        this.pageUrl = "https://www1.libreview.com//Dashboard/MyMeasurements?intervalPeriod=0&pageIndex="
        this.browser = null;
        this.page = null;

        this.timeWaitStart = 500;
    }

    //starts the process
    async startScraper(credentials) {
        try {
            await this.initializePuppeteer();

            await this.page.goto(this.loginUrl);

            await this.page.waitFor(2 * this.timeWaitStart);

            await this.login(credentials.username, credentials.password);

            await this.page.waitFor(2 * this.timeWaitStart);

            return await this.extractGlucoseTable();
        } catch (err) {
            console.log(err);
            throw err;
        }

    }

    //starts puppeteers broser and page
    async initializePuppeteer() {
        this.browser = await puppeteer.launch({
            // userAgent: randomUA.generate(),
            headless: true,
            args: ['--no-sandbox']
        });
        this.page = await this.browser.newPage();
    }

    //logs in libreview using credentials
    async login(user, password) {
        console.log("logging in with " + user + " " + password)
        await this.page.screenshot({ path: 'log.png' });

        await this.page.focus('#Email');
        await this.page.keyboard.type(user);

        await this.page.focus('#Password');
        await this.page.keyboard.type(password);

        await this.page.focus('#UserCulture');

        const button = await this.page.$('.btn');
        await button.click();


        await this.page.screenshot({ path: 'log.png' });

    }

    // once we have logged in libreview, we can extract the glucose info
    async extractGlucoseTable() {
        try {
            await this.page.waitFor(6 * this.timeWaitStart);

            await this.page.screenshot({ path: 'log.png' });

            // we obtain the number of pages to iterate them
            const numberOfPages = await this.getNumberOfPages();

            let data = [];
            for (let i = 0; i <= numberOfPages; i++) {
                console.log("scraping page " + i);
                await this.page.goto(this.pageUrl + i);

                // we extract the data from the page and add it to the array
                const pageData = await this.extractDataFromPage();
                data.push(...pageData);
            }
            return data;
        } catch (err) {
            console.log(err);
            return [];
        }


    }

    async extractDataFromPage() {
        try {
            await this.page.waitFor(2 * this.timeWaitStart);

            await this.page.screenshot({ path: 'log.png' });

            // we use the chrome console to query the data in the page
            let listScraped = await this.page.evaluate(() => {
                const list = [];
                for (const query of document.querySelectorAll(".inner-left")) {
                    const averageGlucoseMetric = query.querySelector("#average-glucose-metric").innerHTML;
                    const averageTestPerDay = query.querySelector('#average-tests-per-day-metric').innerHTML.replace(",", ".");
                    const hypoEventsMetric = query.querySelector('#hypo-events-metric').innerHTML;
                    const date = query.querySelector('b').innerHTML;
                    list.push({ averageGlucoseMetric, averageTestPerDay, hypoEventsMetric, date });;
                }

                return list;
            });
            return listScraped;
        } catch (err) {
            console.log(err);
            return []
        }

    }

    // returns the number of pages with data.
    async getNumberOfPages() {
        return await this.page.evaluate(() => {
            const list = document.getElementById("pageIndex").getElementsByTagName("li");
            return list[list.length - 1].innerText;
        });
    }

    //clicks and accesses the next page.
    async clickPage(page) {
        return await this.page.evaluate(() => {
            const list = document.getElementById("pageIndex").getElementsByTagName("li");
            return list[list.length - 1].innerText;
        });
    }





} 