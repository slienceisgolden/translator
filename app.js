if (process.env.NODE_ENV != 'production') process.env.NODE_ENV = 'development'
const express = require('express')
const fs = require('fs');
const app = express()

if (process.env.NODE_ENV == 'production') {
  app.set('view cache', true)
  app.set('x-powered-by', false)
} else {
  app.use(express.static('public'))
}

app.set('view engine', 'ejs')
app.set('views', './views')

app.use((req, res, next) => {
  if (req.url.endsWith('/') && req.url != '/') {
    res.redirect(301, req.url.replace(/\/$/,''))
    return res.end()
  }
  next()
})

app.all('/', (req, res) => {
  const data = {
    title: 'Sitename'
  }
  res.render('index', {data})
})

app.get('*', (req, res) => {
  const data = req.userdata
  data.title = data.lang['p404 title']
  res.status(404)
  res.render('p404', {data})
})

app.listen(3000, () => {
  console.log('NODE_ENV:', process.env.NODE_ENV)
})

