const axios = require('axios');
const cheerio = require('cheerio');
const db = require('better-sqlite3')('data/db-source.sqlite');
const async = require('async');

// db.prepare('DELETE FROM pages').run();

// Сборщик списка страниц
// (async () => {
//     const mainLinks = []
//     try {
//         const page = await axios.get('https://animals.howstuffworks.com');
//         const $ = cheerio.load(page.data);
//         $('.category-heading a').each(function (i, el) {
//             const href = $(this).attr('href').trim();
//             if (!mainLinks.includes(href)) mainLinks.push(href)
//         })
//     } catch (error) {
//         console.log('Ошибка загрузки главной страницы', error);
//         return false;
//     }
//     console.log('--- step 1 finished ---');

//     const pagLinks = [];
//     for (let mainLink of mainLinks) {
//         pagLinks.push(mainLink);
//         console.log('Парсим:', mainLink);
//         try {
//             const page = await axios.get(mainLink);
//             const $ = cheerio.load(page.data);
//             let maxNum = 0;
//             $('.pagination a').each(function (i, el) {
//                 const href = $(this).attr('href').trim();
//                 const num = href.replace(/^.*\?page=/i, '')*1
//                 if (maxNum == 0 || num > maxNum) maxNum = num
//             })
//             console.log('Страниц:', maxNum);
//             for (let num = 2; num <= maxNum; num++)
//                 pagLinks.push(mainLink + '?page=' + num)
//         } catch (error) {
//             console.log('ошибка парсинга страниц пагинации', error);
//         }
//     }
//     console.log('--- step 2 finished ---');
//     console.log('Страниц к обработке:', pagLinks.length);
    
//     const addLinks = [];
//     let counter = 0;
//     async.eachLimit(pagLinks, 5, (pagLink, callback) => {
//         (async () => {
//             try {
//                 const page = await axios.get(pagLink);
//                 const $ = cheerio.load(page.data);
//                 $('#landing-content .text-xl a').each(function (ind, el) {
//                     const href = $(this).attr('href').trim()
//                     if (!addLinks.includes(href))
//                         addLinks.push(href)
//                 })
//             } catch (error) {
//                 console.log('ошибка парсинга', error);
//             }
//             counter++;
//             if (counter % 10 == 0)
//                 console.log('Обработано:', counter);
//             callback();
//         })();
//     },() => {
//         console.log('Ссылок в базу:', addLinks.length);
//         try {
//             for (let link of addLinks) {
//                 const page = db.prepare('SELECT src FROM pages WHERE id = ?').get(link);
//                 if (!page)
//                     db.prepare('INSERT INTO pages (src, status) VALUES (?, 1)').run(link);
//             }
//         } catch (error) {
//             console.log('Ошибка БД:', error);            
//         }
//     } );
// })()

// парсер страниц
const pages = db.prepare('SELECT src FROM pages WHERE status = 1').all();
console.log(pages[0]);