const user = require('../models/User')
const config = require('../../config')
const path = require("path")
const router = require('express').Router()

router.get('/user/details/:id', (req, res) => {
  let id = req.params.id

  user.get_account({
    _id: id
  }).then((result) => {

    if (!result) {
      user.get_account({
        username: id,
      }).then((result0) => {
        if (result0)
          delete result0['password']

        res.send(result0)
      })
    } else {
      delete result['password']
      res.send(result)
    }
  })
})

router.get('/user/search/', (req, res) => {
  let q = req.query.q

  user.search_username(q).then((result) => {
    for (i = 0; i < result.length; i++)
      if (req.session.user && req.session.user.username === result[i].username)
        delete result[i]


    res.send(result)
  })
})

router.post('/user/login/', (req, res) => {
  let remember = req.body.remember

  if (req.session.user)
    res.send({})
  else {
    user.login(req.body).then((result) => {
      if (!result.exists) {
        user.get_account({
          username: req.body.username
        }).then((dat) => {
          delete dat.posts

          if (remember) {
            res.cookie('user', dat, config.cookie)
          }

          res.send(result)
        })
      } else
        res.send(result)
    })
  }
})

router.post('/user/register/', (req, res) => {
  if (req.session.user)
    res.send({
      errors: true,
      username: "You're already logged in!"
    })
  else {
    let file = (req.files.length > 0) ? req.files[0].path.replace("public", "") : null;

    let data = {
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      img: file || path.normalize("img/samples/sample_profile.jpg"),
    }

    if (req.session.user)
      res.send({})
    else
      user.create(data).then((result) => {
        res.send(result)

      })
  }
})

router.get('/user/logout/', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err)
  })

  res.clearCookie('user').redirect('/')
})

router.get('/user/:data', (req, res) => {
  if (!req.params.data) {
    res.redirect('/')
  } else {
    user.get_account({
      _id: req.params.data
    }).then((data) => {
      res.render('profile.hbs', {
        title: "Meme-A: @" + data.username,
        account: req.session.user,
        profile: data,
        mine: (req.session.user) ? req.session.user._id == data._id : false,
      })
    }).catch((err) =>
      res.redirect('/')
    )
  }
})

router.get('/user/:data/edit/', (req, res) => {
  if (!req.session.user) {
    res.redirect('/')
  } else {
    user.get_account({
      _id: req.params.data
    }).then((data) => {
      res.render('profile_update.hbs', {
        title: "Meme-A: Update Profile",
        account: req.session.user,
        user: true,

        profile: data,
        mine: req.session.user._id == data._id,
      })
    }).catch((err) =>
      res.redirect('/')
    )
  }
})

router.post('/user/:data/edit/', (req, res) => {
  if (!req.session.user)
    res.send({
      errors: true,
      username: "You're already logged in!"
    })
  else {
    let file = (req.files.length > 0) ? req.files[0].path.replace("public", "") : null;

    let data = {}

    if (req.body.name && req.body.name.length > 0)
      data['name'] = req.body.name

    if (req.body.password && req.body.password.length >= 8)
      data['password'] = req.body.password

    if (req.files.length > 0 && file)
      data['img'] = file

    if (!req.session.user)
      res.redirect('/')
    else
      user.edit({
        id: req.params.data,
        edit: data
      }).then((res0) => {
        var result = res0.toObject();
        delete result.posts

        if (req.cookies.user)
          res.cookie('user', result, config.cookie)

        req.session.user = result
        req.session.save()

        res.redirect('/user/' + req.params.data)

      })
  }
})

module.exports.router = router