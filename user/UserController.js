const express = require('express')
const router = express.Router()
const User = require('./User')
const bcrypt = require('bcryptjs')
const adminAuth = require('../middleware/adminAuth')


router.get('/admin/users', adminAuth ,(req, res) => {
    User.findAll().then(users => {
        res.render('admin/users/index', {users})
    })
})

router.get('/admin/users/create', adminAuth ,(req, res) => {
    res.render('admin/users/create')
})

router.post('/users/create', adminAuth ,(req, res) => {
    let email = req.body.email
    let password = req.body.password

    User.findOne({where: {email}}).then(user => {
        if(user) {
            return res.redirect('/admin/users/create')
        }
        
        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(password, salt)
        
        User.create({
            email,
            password: hash
        }).then(() => {
            res.redirect('/')
        })
        .catch(err => {
            res.redirect('/')
        })
    })
})

router.get('/login', (req, res) => {
    res.render("admin/users/login")
})

router.post('/authenticate', (req, res) => {
    let email = req.body.email
    let password = req.body.password

    User.findOne({where: {email}}).then(user => {
        if(!user) return res.redirect('/login')

        let correct = bcrypt.compareSync(password, user.password)

        if(!correct) return res.redirect('/login')

        req.session.user = {
            id: user.id,
            email: user.email
        }

        res.redirect('/admin/articles')
    })
})

router.get('/logout', (req, res) => {
    req.session.user = undefined

    res.redirect('/')
})


module.exports = router