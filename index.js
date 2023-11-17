const express = require('express');
const puppeteer = require('puppeteer-extra');
const path = require('path');
const bodyParser = require('body-parser');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin()) //i hope this doesnt get me a cease and desist letter from the sciencedirect legal team
const app = express();
const green = "\x1b[32m"
const white = "\x1b[37m"

app.use('/', express.static(path.join(__dirname), {
    index: 'index.html'
}));
app.use(bodyParser.urlencoded({
    extended: false
}))

app.post('/search', async (req, res) => {
    let query = req.body.query;

    res.send(await combineSearchResults(query));
});
async function combineSearchResults(query) {
    const liebertResult = await searchLiebert(query);
    const sageResult = await searchSage(query);
    const sciDirectResult = await searchSciDirect(query);
    const pubMedResult = await searchPubMed(query)

    const parsedLiebertResult = JSON.parse(liebertResult);
    const parsedSageResult = JSON.parse(sageResult);
    const parsedSciDirectResult = JSON.parse(sciDirectResult);
    const parsedPubMedResult = JSON.parse(pubMedResult);
    const combinedResult = parsedLiebertResult.concat(parsedSageResult, parsedSciDirectResult, parsedPubMedResult);
    console.log(green, "[STATUS]: All results concatenated, sending JSON to frontend")
    return JSON.stringify(combinedResult, null, 2);
}

//sciencedirect search
async function searchSciDirect(query) {
  console.log(white, "[TASK]: Beginning ScienceDirect page search")
    const browser = await puppeteer.launch({ headless: 'new'});
    const page = await browser.newPage()
    await page.setViewport({
        width: 1600,
        height: 900
    });
    query = query.trim().replace(/\s+/g, '%20');
    await page.goto(`https://www.sciencedirect.com/search?qs=${query}&show=100&accessTypes=openaccess`);
    //console.log(white, "------ Page opened")
    await page.waitForSelector('.SearchBody');
    const result = await page.evaluate(() => {
        const list = document.querySelectorAll('li.ResultItem');
        var entries = []

        list.forEach((item) => {
            const entry = {
                origin: '',
                title: '',
                doi: ''
            };
            const titleElement = item.querySelector('h2');
            if (titleElement) {
                entry.title = titleElement.innerText;
            }
            entry.doi = "https://doi.org/" + item.getAttribute('data-doi');
            entry.origin = 'ScienceDirect';
            entries.push(entry);
           // process.stdout.write(`\rEntries pushed: ${index + 1}`);
        });
        return entries;
    });
   // console.log(white, "------ All results scraped")

    await browser.close();
    console.log(green, '[STATUS]: ScienceDirect search complete')
    return JSON.stringify(result, null, 2);

}
//liebert pub search
async function searchLiebert(query) {
  console.log(white, "[TASK]: Beginning LiebertPub page search")
  const browser = await puppeteer.launch({ headless: 'new'});
  const page = await browser.newPage();
    await page.setViewport({
        width: 1600,
        height: 900
    });
    query = query.trim().replace(/\s+/g, '+');
    await page.goto(`https://www.liebertpub.com/action/doSearch?AllField=${query}&pagesize=100`);
   // console.log(white, "------ Page opened")
    const result = await page.evaluate(() => {
        const entries = [];
        const titles = document.querySelectorAll('h5.meta__title');

        titles.forEach((title) => {
            const entry = {
                origin: '',
                title: '',
                doi: ''
            };
            const titleElement = title.querySelector('a');
            if (titleElement) {
                entry.title = titleElement.textContent.trim();
                entry.doi = titleElement.href;
                entry.origin = 'LiebertPub'
            }
            entries.push(entry);
        });

        return entries;
    });
  //  console.log(white, "------ All results scraped")

    await browser.close();
        console.log(green, '[STATUS]: LiebertPub search complete')

    return JSON.stringify(result, null, 2);
}

//sage journals search 
async function searchSage(query) {
  console.log(white, "[TASK]: Beginning Sage Journals page search")
  const browser = await puppeteer.launch({ headless: 'new'});
  const page = await browser.newPage();
    await page.setViewport({
        width: 1600,
        height: 900
    });
    query = query.trim().replace(/\s+/g, '+');
    await page.goto(`https://journals.sagepub.com/action/doSearch?AllField=${query}&startPage=0&rel=&access=user&pageSize=100`);
   // console.log(white, "------ Page opened")

    const result = await page.evaluate(() => {
        const entries = [];
        const titles = document.querySelectorAll('a.sage-search-title');

        titles.forEach((title) => {
            const entry = {
                origin: '',
                title: '',
                doi: ''
            };
            const titleElement = title.childNodes[0]
            if (titleElement) {
                entry.title = titleElement.textContent.trim();
                entry.doi = title.href;
                entry.origin = 'Sage Journals'
            }
            entries.push(entry);
        });

        return entries;
    });
    //console.log(white, "------ All results scraped")

    await browser.close();
    console.log(green, '[STATUS]: Sage Journals search complete')
    return JSON.stringify(result, null, 2);
}
//nih.gov search
async function searchPubMed(query) {
  console.log(white, "[TASK]: Beginning PubMed page search")
  const browser = await puppeteer.launch({ headless: 'new'});
  const page = await browser.newPage();
    await page.setViewport({
        width: 1600,
        height: 900
    });
    query = query.trim().replace(/\s+/g, '+');
    await page.goto(`https://pubmed.ncbi.nlm.nih.gov/?term=${query}&filter=simsearch2.ffrft&size=100`);
   // console.log(white, "------ Page opened")
    await page.waitForSelector('.search-results');
    const result = await page.evaluate(() => {
        const list = document.querySelectorAll('article.full-docsum');
        var entries = []

        list.forEach((item) => {
            const entry = {
                origin: '',
                title: '',
                doi: ''
            };
            const titleElement = item.getElementsByClassName('docsum-title')[0];
            if (titleElement) {
                entry.title = titleElement.innerText;
            }
            var inputString = item.querySelector('.docsum-journal-citation').innerText
            const doiRegex = /\bdoi:\s*(10\.\d+\/[^\s]+)/i;

            const match = inputString.match(doiRegex);

            if (match && match[1]) {
                const doi = match[1];
                const doiUrl = "https://doi.org/" + doi;
                inputString = doiUrl;
                entry.doi = inputString;
            }

            entry.origin = 'ncbi.nlm.nih.gov';
            entries.push(entry);
        });
        return entries;
    });

    //console.log(white, "------ All results scraped")

    await browser.close();
    console.log(green, '[STATUS]: PubMed search complete')
    return JSON.stringify(result, null, 2);

}
const port = 3000
app.listen(port, () => {
  console.log(green, `[LAUNCH]: research-tempest is ready and waiting at port ${port}. Navigate to localhost:${port}`)
});