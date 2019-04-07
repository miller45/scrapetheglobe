const fs = require('fs');
const rp = require('request-promise');
const $ = require('cheerio');

//const cheerioTableparser  = require('cheerio');

class Iso3166Set {
    constructor() {
        this.englishCountryName = null;
        this.alpha2Code = null;
        this.alpha3Code = null;
        this.numericCode = null;
    }
}

class ISO3166Scraper {


    constructor() {
        this.scrapeJobs = [];
    }

    initScrapeJobs() {
        this.scrapeJobs.push(new Promise((resolve, reject) => {
            let html = fs.readFileSync("./test.html").toString();

            let table = $('#table', html);

            let result = [];
            let rows = $(table).find('tbody tr');
            $(rows).each((idx, row) => {
                let cols = $('td', row);
                let nextEntry = {};
                $(cols).each((idx, col) => {

                    let colTxt = $(col).text().replace(/[\r\n\s]+/g, '');
                    switch (idx) {
                        case 0:
                            nextEntry.englishCountryName = colTxt;
                            break;
                        case 1:
                            nextEntry.alpha2Code = colTxt;
                            break;
                        case 2:
                            nextEntry.alpha3Code = colTxt;
                            break;
                        case 3:
                            nextEntry.numericCode = colTxt;
                            break;
                    }
                });
                result.push(nextEntry);
            });

            resolve(result);
        }))
    }


    execute() {
        this.initScrapeJobs();
        return new Promise((resolve, reject) => {
            Promise.race(this.scrapeJobs).then((result) => {
                resolve(result);
            }, (error) => {
                reject(error);
            });
        });

    }
}

const scraper = new ISO3166Scraper();
scraper.execute().then((result) => {
    console.log(result);
});
