const router = require('express').Router()
const post = require('../models/Post')
const user = require('../models/User')

router.get('/', (req, res) => {
  user.get_account({_id: req.session.user}).then((result) => {
    let account = result;

    res.render('index.hbs', {
      account,
      title: "Meme-A: Home Page"
    })
  })

})

router.post('/post/share/', (req, res) => {

  let data = {
    title: req.body.memeTitle,
    user: req.session.user,
    post: req.files[0].path.replace("public", ""),
    tags: req.body.memeTags.split(" ")
  }

  post.create(data).then((result) => {
    res.send(result)
  })
})

router.post('/post/like/', (req, res) => {
  var pid = req.body.id;
  var uid = req.session.user;

  post.update_stats(uid, pid, true).then((errors) => {
    res.send(errors);
  })
})

router.post('/post/dislike/', (req, res) => {
  var pid = req.body.id;
  var uid = req.session.user;

  post.update_stats(uid, pid, false).then((errors) => {
    res.send(errors); 
  })
})

router.get('/post/default/', (req, res) => {
  let limit = req.query.limit || 5
  let skip = req.query.skip || 0

  limit = parseInt(limit)
  skip = parseInt(skip)

  post.get_posts({}, {
    time: -1, likes: -1
  }, limit, skip).then((result) => res.send(result))

})

module.exports = router