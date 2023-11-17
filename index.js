const express = require('express');
const puppeteer = require('puppeteer-extra');
const path = require('path');
const bodyParser = require('body-parser');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin()) //i hope this doesnt get me a cease and desist letter from the sciencedirect legal team
const app = express();

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

    return JSON.stringify(combinedResult, null, 2);
}

//sciencedirect search
async function searchSciDirect(query) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage()
    await page.setViewport({
        width: 1600,
        height: 900
    });
    query = query.trim().replace(/\s+/g, '%20');
    await page.goto(`https://www.sciencedirect.com/search?qs=${query}&show=100&accessTypes=openaccess`);
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
        });
        return entries;
    });


    await browser.close();
    return JSON.stringify(result, null, 2);

}
//liebert pub search
async function searchLiebert(query) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1600,
        height: 900
    });
    query = query.trim().replace(/\s+/g, '+');
    await page.goto(`https://www.liebertpub.com/action/doSearch?AllField=${query}&pagesize=100`);
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

    await browser.close();
    return JSON.stringify(result, null, 2);
}

//sage journals search 
async function searchSage(query) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1600,
        height: 900
    });
    query = query.trim().replace(/\s+/g, '+');
    await page.goto(`https://journals.sagepub.com/action/doSearch?AllField=${query}&startPage=0&rel=&access=user&pageSize=100`);


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

    await browser.close();
    return JSON.stringify(result, null, 2);
}
//nih.gov search
async function searchPubMed(query) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1600,
        height: 900
    });
    query = query.trim().replace(/\s+/g, '+');
    await page.goto(`https://pubmed.ncbi.nlm.nih.gov/?term=${query}&filter=simsearch2.ffrft&size=100`);
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


    await browser.close();
    return JSON.stringify(result, null, 2);

}

app.listen(3000, () => {
    console.log('research tempest os READY on port 3000. Go to `localhost:3000` in your browser.');
});