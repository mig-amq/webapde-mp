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
          req.session.user = dat._id.toString();
          
          if (remember === "true") {
            res.cookie('user', dat._id.toString(), config.cookie)
          }
          
          res.send(result)
        })
      } else
        res.send(result)
    })
  }
})

router.post('/user/register/', (req, res) => {
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
})

router.get('/logout/', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err)
  })

  res.clearCookie('user').redirect('/')
})

module.exports = router