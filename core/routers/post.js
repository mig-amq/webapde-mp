const router = require('express').Router()
const post = require('../models/Post')
const user = require('../models/User')

router.get('/', (req, res) => {
    let account = req.session.user;

    res.render('index.hbs', {
      account,
      default: true,
      title: "Meme-A: Home Page"
    })
})

router.get('/post/user/:id', (req, res) => {
  let limit = req.query.limit || 5
  let skip = req.query.skip || 0

  limit = parseInt(limit)
  skip = parseInt(skip)
  
  post.get_posts_user(req.params.id, true, limit, skip)
  .then((result) => {
    res.send(result)
  })
})

router.get('/post/random/', (req, res) => {
    let account = req.session.user

    res.render('random.hbs', {
      account,
      random: true,
      title: "Meme-A: Random Tag!"
    })
})

router.get('/post/random/init/', (req, res) => {
  post.get_random_tag(true).then((result) => {
    res.send(result)
  })
})

router.get('/post/random/continue/', (req, res) => {
  let limit = req.query.limit || 5
  let skip = req.query.skip || 0
  let tag = req.query.query.tag || ""

  limit = parseInt(limit)
  skip = parseInt(skip)

  post.get_posts_tag([tag], true, limit, skip).then((result) => {
    res.send(result)
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
    likes: -1,
    time: -1
  }, limit, skip).then((result) => res.send(result))

})

module.exports = router