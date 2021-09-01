if (process.env.NODE_ENV != 'production') process.env.NODE_ENV = 'development'
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const adminka = require('./routes/adminka')
const db = require('better-sqlite3')('data/db.sqlite');
app.use(cookieParser())
app.use(express.urlencoded({extended: true}));
app.use(express.json())

const pagesCache = {}

if (process.env.NODE_ENV == 'production') {
  app.set('view cache', true)
  app.set('x-powered-by', false)
}

app.use(express.static('public'))

app.set('view engine', 'ejs')
app.set('views', './views')

app.use((req, res, next) => {
  if (req.url.endsWith('/') && req.url != '/') {
    res.redirect(301, req.url.replace(/\/$/,''))
    return res.end()
  }
  next()
})

app.get('/', (req, res) => {
  const data = {
    title: 'Sitename'
  }
  data.pages = db.prepare('SELECT * FROM pages ORDER BY id DESC LIMIT 10').all();
  res.render('index', {data})
})

// статья
app.get('/p/:id', (req, res, next) => {
  if (!req.params.id) return next();
  let data = {}
  if (pagesCache[req.params.id]) {
    data.title = pagesCache[req.params.id].title;
    data.page = pagesCache[req.params.id];
  } else {
    const page = db.prepare('SELECT id, title, text FROM pages WHERE id = ?').get(req.params.id);
    if (!page) return next();
    page.next = db.prepare('SELECT id, title FROM pages WHERE id > ? ORDER BY id ASC').get(req.params.id);
    page.prev = db.prepare('SELECT id, title FROM pages WHERE id < ? ORDER BY id DESC').get(req.params.id);
    data.title = page.title;
    data.page = page;
    const keys = Object.keys(pagesCache)
    if (keys.length > 1000) {
      const idx = Math.floor(Math.random() * keys.length)
      const delKey = keys.splice(idx, 1)
      delete pagesCache[delKey]
    }
    pagesCache[req.params.id] = page
  }
  res.render('page', {data})
})

app.use('/adminka', adminka)
app.get('*', (req, res) => {
  const data = {title: '404', noindex: true}
  res.status(404)
  res.render('p404', {data})
})

app.listen(3000, () => {
  console.log('NODE_ENV:', process.env.NODE_ENV)
})

