const express = require('express')
const router = express.Router()
const Category = require('../categories/Category')
const Article = require('./Article')
const slugify = require('slugify')
const adminAuth = require('../middleware/adminAuth')


router.get("/admin/articles", adminAuth ,(req, res) => {
    Article.findAll({
        include: [{ model: Category }]
    }).then(a => {
        res.render("admin/articles/index", { a })
    })
})

router.get("/admin/articles/new", adminAuth ,(req, res) => {
    Category.findAll().then(c => {
        res.render('admin/articles/new', { c })
    })
})

router.post("/articles/save", adminAuth ,(req, res) => {
    let title = req.body.title
    let body = req.body.body
    let categoryId = req.body.category


    Article.create({
        title,
        slug: slugify(title),
        body,
        categoryId
    }).then(() => {
        res.redirect("/admin/articles")
    })
})

router.post("/articles/delete", adminAuth ,(req, res) => {
    var id = req.body.id;

    console.log(id)

    if(!id || isNaN(id)) return res.redirect('/admin/articles') 

    Article.destroy({
        where: {
            id
        }
    }).then(() => {
        res.redirect("/admin/articles")
    })
})

router.get("/admin/articles/edit/:id", adminAuth ,(req, res) => {
    let id = req.params.id

    if(isNaN(id)) return res.redirect('/admin/articles')

    Article.findByPk(id)
        .then(a => {
            if(!a) return res.redirect('/admin/articles')

            Category.findAll().then(c => {
                res.render('admin/articles/edit', { a, c })
            })

        })
        .catch(err => res.redirect('/admin/articles'))
})

router.post("/articles/update", adminAuth ,(req, res) => {
    let id = req.body.id
    let title = req.body.title
    let body = req.body.body
    let categoryId = req.body.category

    Article.update({title, slug: slugify(title), body, categoryId}, {
        where: {
            id
        }
    }).then(O_o => {
        res.redirect('/admin/articles')
    })
})

router.get("/articles/page/:num", (req, res) => {
    let page = parseInt(req.params.num)
    let offset = 0

    console.log(page)

    if(page > 1) {
        offset = (page - 1) * 4
    }

    console.log(offset)

    Article.findAndCountAll({
        order: [ ["id", "DESC"] ],
        limit: 4,
        offset
    }).then(a => {

        let next = true

        if(offset + 4 >= a.count) next = false

        let result = {
            page,
            next,
            a,
        }

        Category.findAll({
            order: [ ["id", 'DESC'] ]
        }).then(c => {
            res.render('admin/articles/page', {result, c})
            // res.json(result)
        })

    })
})


module.exports = router