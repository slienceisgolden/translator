const puppeteer = require('puppeteer');
const fs = require('fs');
const wait = (usec) => new Promise((res) => { setTimeout(() => { res() }, usec) })

console.log('start');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});
    await page.goto('https://www.deepl.com/ru/translator');
    await wait(3000);
    await page.waitForSelector('.dl_cookieBanner--buttonClose');
    await page.click('.dl_cookieBanner--buttonClose');
    await wait(3000);
    await page.waitForSelector('.lmt__language_select--source .lmt__language_select__active__title');
    await page.click('.lmt__language_select--source .lmt__language_select__active__title');
    await wait(3000);
    await page.waitForSelector('[dl-test="translator-lang-option-ru"]');
    await page.click('[dl-test="translator-lang-option-ru"]');
    await wait(3000);
    await page.waitForSelector('.lmt__language_select--target .lmt__language_select__active__title');
    await page.click('.lmt__language_select--target .lmt__language_select__active__title');
    await wait(3000);
    await page.waitForSelector('[dl-test="translator-lang-option-de-DE"]');
    await page.click('[dl-test="translator-lang-option-de-DE"]');
    await wait(3000);
    await page.waitForSelector('.lmt__source_textarea');
    await wait(3000);

    let text = 'hel';

    const files = fs.readdirSync(`./from`)
    for (let file of files) {
        console.log('-----------','file:', file,'-----------');
        const data = JSON.parse(fs.readFileSync(`./from/${file}`, "utf8"));
        for (let i in data) {
            await page.$eval('.lmt__source_textarea', el => el.value = '');
            await page.focus('.lmt__source_textarea');
            await page.type('.lmt__source_textarea', data[i]);
            await wait(10000);
            await page.waitForSelector('#target-dummydiv')
            let element = await page.$('#target-dummydiv')
            let value = await page.evaluate(el => el.textContent, element);
            if (text == value) {
                console.log('---------- WAITING ----------');
                await wait(10000);
                value = await page.evaluate(el => el.textContent, element);
            }
            console.log(i, '|',data[i],' => ', value);
            data[i] = value;            
            text = value;            
        }
        const json = JSON.stringify(data, null, '\t')
        fs.writeFileSync(`./to/${file}`, json)
    }
    await browser.close();
})();