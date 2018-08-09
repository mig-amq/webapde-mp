const user = require('../models/User')
const config = require('../../config')
const path = require("path")
const router = require('express').Router()

router.get('/user/details/:id', (req, res) => {
  let id = req.params.id

  user.get_account({
    _id: id
  }).then((result) => {
    delete result['password']
    delete result['_id']
    
    res.send(result)
  })
})

router.post('/user/login/', (req, res) => {
  let remember = req.body.remember

  if (req.session.user)
    res.send({})
  else {
    user.login(req.body).then((result) => {
      if(!result.exists) {
        user.get_account({username: req.body.username}).then((dat) => {
          req.session.user = dat;
          
          if (remember === "on") {
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
    res.send({errors: true, username: "You're already logged in!"})
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
      user.create(data).then((result) => res.send(result))
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
    user.get_account({_id: req.params.data}).then((data) => {
      res.render('profile.hbs', {
        title: "Meme-A: @" + data.username,
        account: req.session.user,
        profile: data,
        mine: req.session.user._id == data._id,
        csrf: req.csrfToken(),
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
      user.get_account({_id: req.params.data}).then((data) => {
      res.render('profile_update.hbs', {
        title: "Meme-A: Update Profile",
      account: req.session.user,
      user: true,
      csrf: req.csrfToken(),
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
    res.send({errors: true, username: "You're already logged in!"})
  else {
    //let file = (req.files.length > 0) ? req.files[0].path.replace("public", "") : null;

    let data = {
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      //img: file || path.normalize("img/samples/sample_profile.jpg"),
    }

    if (req.session.user)
      res.send({})
    else
      user.create(data).then((result) => res.send(result))
  } 
})
module.exports = router