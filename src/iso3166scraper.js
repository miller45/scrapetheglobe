const rp = require('request-promise');
const $ = require('cheerio');

//note to myself look into that how to scrape: https://github.com/nfriend/ts-key-enum/blob/master/scrapeMDNForKeys.ts
class ISO3166Scraper {


    constructor() {
        this.scrapeJobs = [];
    }

    initScrapeJobs() {
        this.scrapeJobs.push(new Promise((resolve, reject) => {
            rp('https://en.wikipedia.org/wiki/ISO_3166-1').then((html) => {
                let tables = $('table.wikitable', html);
                let longestTableIdx = null;
                let longestTable = null;
                let lastLen = -1;

                tables.each((idx, table) => {
                    let tlen = $(table).find('tr').length;
                    if (tlen > lastLen) {
                        lastLen = tlen;
                        longestTableIdx = idx;
                        longestTable = table;
                    }
                });

                if (longestTable) { //longestTable contains country list with iso code
                    let result = [];
                    let rows = $(longestTable).find('tbody').find('tr');
                    $(rows).each((idx, row) => {
                        let cols = $('td', row);
                        if (cols && cols.length > 0) {
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
                        }

                    });

                    resolve(result);
                } else {
                    resolve([]);
                }

            });
        }));
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
