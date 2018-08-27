const router = require('express').Router()
const comment = require('../models/Comment')

router.post('/comment/', (req, res) => {
  let json = {
    content: req.body.content.replace(/\s+/, " "),
    post: req.body.post,
    user: req.session.user._id,
  }
  
  comment.add_comment(json).then((status) => {
    if (!status.exists)
      add_props([status], req.session.user)

    res.send(status)
  })
})

router.get('/comment/', (req, res) => {
  let post = req.query.post
  var limit = parseInt(req.query.limit) || 0
  var skip = parseInt(req.query.skip) || 0
  
  comment.get_comments(post, {time: -1}, limit, skip).then((comments) => {
    add_props(comments, req.session.user)

    res.send(comments)
  })
})

router.delete('/comment/', (req, res) => {
  let cid = req.body.comment

  comment.delete_comment(cid, req.session.user._id).then((status) => {
    res.send(status)
  })
})

router.put('/comment/', (req, res) => {
  let cid = req.body.comment

  comment.update_stats(cid, req.session.user._id).then((status) => {
    res.send(status)
  })
})

function add_props(comments, user) {
  if (user && user._id) {
    for(i = 0; i < comments.length; i++) {
      if (comments[i].user._id.toString() === user._id.toString()) {
        comments[i].owned = true
      }

      if (comments[i].likers.length > 0) {
        for (x = 0; x < comments[i].likers.length; x++) {
          if (comments[i].likers[x].toString() === user._id.toString())
            comments[i].liked = true
        }
      }
    }
  }
}

module.exports.router = router