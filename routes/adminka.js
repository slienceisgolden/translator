const express = require('express')
const router = express.Router()
const db = require('better-sqlite3')('data/db.sqlite');

router.all('/', function (req, res) {
    let isAdmin = false;
    if (req.body.login == 'ivashka' && req.body.pass == 'prosto') {
        res.cookie('adminka','quialify', { maxAge: 9000000, httpOnly: true });
        isAdmin = true;
    } else if (req.cookies.adminka == 'quialify') {
        isAdmin = true;
    }
    const data = {title: 'Вход', noindex: true}
    if (!isAdmin) {
        res.render('adminka/login', { data })
    } else {
        data.title = 'Кабинет'
        res.render('adminka/cabinet', { data })
    }
})

router.post('/post', function (req, res) {
    let stmt;
    switch (req.body.cmd) {
        case 'getPages':
            stmt = db.prepare('SELECT * FROM pages ORDER BY id DESC LIMIT 10');
            res.json(stmt.all())
            break;
    }
})

module.exports = router
