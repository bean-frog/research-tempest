const express = require('express');
const puppeteer = require('puppeteer-extra');
const path = require('path');
const bodyParser = require('body-parser');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin()) //i hope this doesnt get me a cease and desist letter from the sciencedirect legal team
const app = express();
const green = "\x1b[32m"
const white = "\x1b[37m"
const red = "\x1b[31m"

app.use('/', express.static(path.join(__dirname), {
    index: 'index.html'
}));
app.use(bodyParser.urlencoded({
    extended: false
}))

app.post('/liebert', async (req, res) => {
    let query = req.body.query;
    console.log(red, '[SERVER]: Request received at API endpoint /liebert');
    var result = await searchLiebert(query);
    result = JSON.parse(result);
    res.send(result);
  });
  
  app.post('/sage', async (req, res) => {
    let query = req.body.query;
    console.log(red, '[SERVER]: Request received at API endpoint /sage');
    var result = await searchSage(query);
    result = JSON.parse(result);
    res.send(result);
  });
  
  app.post('/scidir', async (req, res) => {
    let query = req.body.query;
    console.log(red, '[SERVER]: Request received at API endpoint /scidir');
    var result = await searchSciDirect(query);
    result = JSON.parse(result);
    res.send(result);
  });
  
  app.post('/pubmed', async (req, res) => {
    let query = req.body.query;
    console.log(red, '[SERVER]: Request received at API endpoint /pubmed');
    var result = await searchPubMed(query);
    result = JSON.parse(result);
    res.send(result);
  });
  



app.post('/search', async (req, res) => {
    let query = req.body.query;
    console.log(red, '[SERVER]: Request recieved at endpoint /search. Running searches non-simultaneously.');
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
  console.log(white, "[TASK]: Beginning Science Direct page search")
  query = query.trim().replace(/\s+/g, '%20');
const url = `https://www.sciencedirect.com/search?qs=${query}&show=100&accessTypes=openaccess`;

const browser = await puppeteer.launch({headless: "new"});
const page = await browser.newPage();

await page.goto(url);

// Wait for the search result selector to become available
await page.waitForSelector('.ResultList');

// Extract information from each search result
const entries = await page.evaluate(() => {
  const results = document.querySelectorAll('.ResultItem');
  const entriesArray = [];

  results.forEach(result => {
    const title = result.querySelector('.result-list-title-link').innerText.trim();
    const doi = result.dataset.doi;

    entriesArray.push({
      origin: 'ScienceDirect',
      title: title,
      doi: "https://doi.org/" + doi,
    });
  });

  return entriesArray;
});

await browser.close();

    console.log(green, '[STATUS]: ScienceDirect search complete')
    return JSON.stringify(entries, null, 2);

}
//liebert pub search
async function searchLiebert(query) {
  console.log(white, "[TASK]: Beginning LiebertPub page search")
  query = query.trim().replace(/\s+/g, '+');
  const url = `https://www.liebertpub.com/action/doSearch?AllField=${query}&pageSize=100`;

  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();

  await page.goto(url);

  await page.waitForSelector('.search-result__body');

  const entries = await page.evaluate(() => {
    const results = document.querySelectorAll('.search__item');
    const entriesArray = [];

    results.forEach(result => {
      const title = result.querySelector('.meta__title a').innerText;
      const doi = result.querySelector('.meta_doi a').innerText;

      entriesArray.push({
        origin: 'LiebertPub',
        title: title,
        doi: doi,
      });
    });

    return entriesArray;
  });

  await browser.close();
  console.log(green, '[STATUS]: LiebertPub search complete')
    return JSON.stringify(entries, null, 2)
}

//sage journals search 
async function searchSage(query) {
    console.log(white, "[TASK]: Beginning Sage Journals page search")
    query = query.trim().replace(/\s+/g, '+');
    const url = `https://journals.sagepub.com/action/doSearch?AllField=${query}&startPage=0&rel=&access=user&pageSize=100`;
  
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
  
    await page.goto(url);
  
    // Wait for the search result selector to become available
    await page.waitForSelector('.issue-item');
  
    // Extract information from each search result
    const entries = await page.evaluate(() => {
      const results = document.querySelectorAll('.issue-item');
      const entriesArray = [];
  
      results.forEach(result => {
        const title = result.querySelector('.issue-item__title h3').innerText;
        const doi = result.querySelector('input[name="doi"]').value;
  
        entriesArray.push({
          origin: 'Sage Journals',
          title: title,
          doi: "https://doi.org/" + doi,
        });
      });
  
      return entriesArray;
    });
  
    await browser.close();
    console.log(green, '[STATUS]: Sage Journals search complete')
    return JSON.stringify(entries, null, 2)
  }
//nih.gov search
async function searchPubMed(query) {
    console.log(white, "[TASK]: Beginning PubMed page search")
    query = query.trim().replace(/\s+/g, '+');
    const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${query}&filter=simsearch2.ffrft&size=100`;
  
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
  
    await page.goto(url);
  
    await page.waitForSelector('.search-results-chunks');
  
    const entries = await page.evaluate(() => {
      const results = document.querySelectorAll('.full-docsum');
      const entriesArray = [];
  
      results.forEach(result => {
        const title = result.querySelectorAll('.docsum-title')[0].innerText.trim();
        const pmid = result.querySelectorAll('.docsum-pmid')[0].innerText.trim();
        entriesArray.push({
          origin: 'PubMed',
          title: title,
          doi: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`,
        });
      });
  
      return entriesArray;
    });
  
    await browser.close();
  
      console.log(green, '[STATUS]: PubMed search complete')
      return JSON.stringify(entries, null, 2);
  
  }
const port = 3000
app.listen(port, () => {
  console.log(red, `[SERVER]: research-tempest is ready and waiting at port ${port}. Navigate to localhost:${port}`)
});
