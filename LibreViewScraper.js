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

    async initializePuppeteer() {
        this.browser = await puppeteer.launch({
            // userAgent: randomUA.generate(),
            headless: true,
            args: ['--no-sandbox']
        });
        this.page = await this.browser.newPage();
    }


    async login(user, password) {
        console.log("logging in with " + user + " " + password)
        await this.page.screenshot({ path: 'example.png' });

        await this.page.focus('#Email');
        await this.page.keyboard.type(user);

        await this.page.focus('#Password');
        await this.page.keyboard.type(password);

        //await this.page.keyboard.press(String.fromCharCode(13));
        //await this.page.waitFor(this.timeWaitStart);

        await this.page.focus('#UserCulture');
        //await this.page.keyboard.press(String.fromCharCode(13));

        //console.log(await this.page.$$('.btn'));

        const button = await this.page.$('.btn');
        await button.click();


        await this.page.screenshot({ path: 'example.png' });

    }

    async extractGlucoseTable() {
        try {
            await this.page.waitFor(this.timeWaitStart);

            //await this.page.goto(this.pageUrl);

            await this.page.waitFor(5 * this.timeWaitStart);

            await this.page.screenshot({ path: 'example3.png' });

            const numberOfPages = await this.getNumberOfPages();

            let data = [];
            for (let i = 0; i <= numberOfPages; i++) {
                console.log("scraping page " + i);
                await this.page.goto(this.pageUrl + i);
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
        await this.page.waitFor(2 * this.timeWaitStart);

        await this.page.screenshot({ path: 'example3.png' });

        //upldata-mod-avgs

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
    }

    /*
    async getActivePage() {
        //console.log(document.querySelector('li.active').innerText)
        const page = await this.page.evaluate(() => {
            const page = document.querySelector('li.active').innerText;
            return page;
        });
        return page;
    }*/

    async getNumberOfPages() {
        //document.getElementById("pageIndex").getElementsByTagName("li")
        return await this.page.evaluate(() => {
            const list = document.getElementById("pageIndex").getElementsByTagName("li");
            return list[list.length - 1].innerText;
        });
    }

    async clickPage(page) {
        return await this.page.evaluate(() => {
            const list = document.getElementById("pageIndex").getElementsByTagName("li");
            return list[list.length - 1].innerText;
        });
    }





} 