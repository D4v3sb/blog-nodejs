const express = require('express')
const router = express.Router()
const Category = require('./Category')
const slugify = require('slugify')
const adminAuth = require('../middleware/adminAuth')


router.get("/admin/categories/new", adminAuth ,(req, res) => {
    res.render('admin/categories/new')
})


router.post("/categories/save", adminAuth ,(req, res) => {
    var title = req.body.title

    if(!title) return res.redirect("/admin/categories/new")

    Category.create({
        title,
        slug: slugify(title)
    }).then(() => {
        res.redirect('/admin/categories')
    })
})

router.get("/admin/categories", adminAuth ,(req, res) => {

    Category.findAll().then(categories => {
        res.render('admin/categories/index', {categories})
    })

})

router.post("/categories/delete", adminAuth ,(req, res) => {
    var id = req.body.id;

    if(!id || isNaN(id)) return res.redirect('/admin/categories') 

    Category.destroy({
        where: {
            id
        }
    }).then(() => {
        res.redirect("/admin/categories")
    })
})


router.get("/admin/categories/edit/:id", adminAuth ,(req, res) => {
    let id = req.params.id

    if(isNaN(id)) return res.redirect('/admin/categories')

    Category.findByPk(id)
        .then(c => {
            if(!c) return res.redirect('/admin/categories')

            res.render('admin/categories/edit', {c})

        })
        .catch(err => res.redirect('/admin/categories'))
})

router.post("/categories/update", adminAuth ,(req, res) => {
    var id = req.body.id
    var title = req.body.title

    Category.update({title, slug: slugify(title)}, {
        where: {
            id
        }
    }).then(O_o => {
        res.redirect('/admin/categories')
    })
})

module.exports = router