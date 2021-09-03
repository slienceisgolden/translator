const axios = require('axios');
const cheerio = require('cheerio');
const db = require('better-sqlite3')('data/db-source.sqlite');
const async = require('async');

// db.prepare('DELETE FROM pages').run();
db.prepare('UPDATE pages SET status = 1 WHERE status = 2').run();

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
const pages = db.prepare('SELECT id, src FROM pages WHERE status = 1').all();
let counter = 0;
async.eachLimit(pages.slice(0, 10), 5, (link, callback) => {
    (async () => {
        try {
            const page = await axios.get(link.src);
            const $ = cheerio.load(page.data);
            let html = $('#editorial-body').first();
            html.find('script, noscript, iframe, google-read-aloud-player, .hidden, .ad-disclaimer, .sticky-container, .ad-inline').remove();
            html.find('picture').each(function (ind, el) {
                let src = $(this).find('img').first().attr('src')
                let data = $(this).find('img').first().attr('data-src')
                if (data) src = data;
                if (!src) {
                    $(this).remove();
                    return false;  
                } 
                $(this).replaceWith(`<img src='${src}'>`)
            })
            html.find('a, span').each(function (ind, el) {
                $(this).replaceWith($(this).html());
            });
            html.find('p').each(function (ind, el) {
                if($(this).find('img').length) return false;
                if($(this).text().trim() == '')
                    $(this).remove();
            });
            for (let iterator; iterator < 5; iterator++)
                html.find('div').each(function (ind, el) {
                    if($(this).find('img').length) return false;
                    if($(this).text().trim() == '')
                        $(this).remove();
                });
            html.find('*').removeAttr('id class style')
            text = html.html().trim();
            const title = $('title').first().text().replace(/\|.*/i,'').trim()
            db.prepare('UPDATE pages SET status = 2, text = ?, title = ? WHERE id = ?').run(text,title,link.id);
        } catch (error) {
            console.log('ошибка парсинга', error);
        }
        counter++;
        if (counter % 10 == 0)
            console.log('Обработано (%, всего):', Math.round(100*counter/pages.length), counter);
        callback();
    })();
},() => {
    console.log('done');
} );