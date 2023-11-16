const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use('/', express.static(path.join(__dirname), { index: 'index.html' }));
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/search', async (req, res) => {
    let query = req.body.query;
    res.send(await searchLiebert(query));
});



async function searchLiebert(query) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900 });
  query = query.trim().replace(/\s+/g, '+');
  await page.goto(`https://www.liebertpub.com/action/doSearch?AllField=${query}&pagesize=100`);
  const result = await page.evaluate(() => {
      const entries = [];
      const titles = document.querySelectorAll('h5.meta__title');

      titles.forEach((title, index) => {
          const entry = {
              id: index + 1,
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
  return result;
}
//sage journals search (Doesnt work yet, need to bypass cloudflare)
/*async function searchSage(query) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900 });
  query = query.trim().replace(/\s+/g, '+');
  await page.goto(`https://journals.sagepub.com/action/doSearch?AllField=${query}&startPage=0&rel=&access=user&pageSize=100`);


  const result = await page.evaluate(() => {
    const entries = [];
    const titles = document.querySelectorAll('a.sage-search-title');

    titles.forEach((title, index) => {
        const entry = {
            id: index + 1,
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
return result;
}
*/

app.listen(3000, () => {
    console.log('App is listening on port 3000');
});