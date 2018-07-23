const user = require('../models/User')
const config = require('../../config')
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
  let file = req.file.path

  let data = {
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    img: file
  }

  if (!req.session.user)
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