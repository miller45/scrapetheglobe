const rp = require('request-promise');
const $ = require('cheerio');
//const cheerioTableparser  = require('cheerio');



class ISO3166Scraper {


    constructor() {
        this.scrapeJobs = [];
    }

    initScrapeJobs() {
        this.scrapeJobs.push(new Promise((resolve, reject) => {
            rp('https://en.wikipedia.org/wiki/ISO_3166-1').then((html) => {
                let tables = $('table.wikitable', html);
                let longestTable = null;
                let lastLen = -1;
                tables.each((idx, table) => {
                    let tlen = $(table).find('tr').length;
                    if (tlen > lastLen) {
                        lastLen = tlen;
                        longestTable=table;
                    }
                });
                if(longestTable) { //longestTable contains country list with iso code
                    let result=[];
                    let rows=$(longestTable).find('tr');
                    $(rows).each((idx,row)=>{
                        let cols=$('td',row);
                        $(cols).each((idx,col)=>{
                            result.push($(col).text());
                        });
                    });

                    resolve(result);
                }else{
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
