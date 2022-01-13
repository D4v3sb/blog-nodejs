const express = require('express')
const bodyParser = require('body-parser')
const connection = require('./database/database')
const session = require('express-session')

const categoriesController = require('./categories/CategoriesController')
const articlesController = require('./articles/ArticlesController')
const usersController = require('./user/UserController')

const Article = require('./articles/Article')
const Category = require('./categories/Category')
const User = require('./user/User')

const app = express()

// View Engine
app.set('view engine', 'ejs')

//Sessions
app.use(session({
    secret: "qualquercoisa",
    cookie: {
        maxAge: 30000
    }
}))

// Static
app.use(express.static('public'))

// Body Parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Database
connection
    .authenticate()
    .then(() => console.log('Conectado com a database'))
    .catch(e => console.log(e))


// Views

app.use("/", categoriesController)
app.use("/", articlesController)
app.use("/", usersController)

app.get('/', (req, res) => {
    Article.findAll({
        order: [ ["id", "DESC"]],
        limit: 4
    }).then(a => {

        Category.findAll({
            order: [["id", "DESC"]]
        }).then(c => {
            res.render('index', { a, c })
        })

    })
})

app.get('/:slug', (req, res) => {
    let slug = req.params.slug
    Article.findOne({
        where: {
            slug
        },
    }).then(article => {
        if(!article) return res.redirect('/')

        Category.findAll({
            order: [["id", "DESC"]]
        }).then(c => {
            res.render('article', { article, c })
        })
    })
    .catch(err => {
        res.redirect('/')
    })
})

app.get('/category/:slug', (req, res) => {
    let slug = req.params.slug
    
    Category.findOne({
        where: {
            slug
        },
        include: [{model: Article}]
    }).then(c => {
        if(!c) return res.redirect('/')

        console.log(c)

        Category.findAll({
            order: [ ["id", "DESC"] ]
        }).then(categories => {
            res.render('index', {a: c.articles, c: categories})
        })
        


    }).catch(err =>  res.redirect('/'))
})


// App Start
let listener = app.listen(8080, () => {
    console.log(`Servidor conectado na porta ${listener.address().port}`)
})