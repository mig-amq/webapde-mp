const router = require('express').Router()
const post = require('../models/Post')
const user = require('../models/User')

router.get('/', (req, res) => {
  let account = req.session.user
  
  res.render('index.hbs', {
    account,
    default: true,
    title: "Meme-A: Home Page",
  })
})

/**
 * This route handles the posts retrieval
 */
router.use('/post/:type/:func?', (req, res, next) => {
  let account = req.session.user
  let limit = req.query.limit || 5
  let skip = req.query.skip || 0

  limit = parseInt(limit)
  skip = parseInt(skip)

  switch (req.params.type) {
    case "random":
      if (req.params.func === 'continue') {
        let tag = req.query.query.tag || ""

        post.get_posts_tag([tag], true, limit, skip).then((result) => {
          add_props(result, req.session.user)
          res.send(result)
        })
      } else if (req.params.func === 'init') {
        post.get_random_tag(true).then((result) => {
          res.send(result)
        })
      } else {
        res.render('index.hbs', {
          account,
          random: true,
          title: "Meme-A: Random Tag!",
        })
      }
      break;
    case "search":
      let q = req.query.q || ""

      if (req.params.func === "get") {
        q = req.query.query.q || "";

        post.get_posts_search(q, true, limit, skip).then((result) => {
          add_props(result, req.session.user)
          res.send(result)
        })
      } else {
        res.render('index.hbs', {
          title: "MEME-A: Searching for " + q,
          search: q,
          account,
        })
      }
      break;
    case "tag":
      let tag = req.query.tag || ""

      if (req.params.func === "get") {
        tag = req.query.query.tag || "";

        post.get_posts_tag([tag], true, limit, skip).then((result) => {
          add_props(result, req.session.user)
          res.send(result)
        })
      } else {
        res.render('index.hbs', {
          title: "MEME-A: " + tag + " posts",
          account,
          tag,
        })
      }
      break;
    case "user":
      let user = req.query.query.user || ""

      post.get_posts_user(user, true, limit, skip).then((result) => {
        add_props(result, req.session.user)

        res.send(result)
      })
      break;
    case "default":
      post.get_posts({}, {
        likes: -1,
        time: -1
      }, limit, skip).then((result) => {
        add_props(result, req.session.user)

        res.send(result)
      })
      break;
    default:
      next()
  }

})

router.post('/post/share/', (req, res) => {
  
  let data = {
    title: req.body.title,
    user: req.session.user,
    post: req.files[0].path.replace("public", ""),
    tags: [],
    private: (req.body.private && req.body.private === "on") ? true : false,
    viewers: req.body.viewers,
  }

  if ((typeof req.body.tags).toLowerCase() === "string") {
    req.body.tags.split(',').forEach(elem => {
      data.tags.push(elem.trim().replace(/\s+/, ''))
    })
  } else {
    data.tags = req.body.tags
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

router.get('/post/:id/', (req, res) => {
  post.get_posts({
    _id: req.params.id
  }, {
    likes: -1,
    time: -1
  }, 5, 0).then((result) => {
    res.send(result)
  })

})

router.put('/post/edit/', (req, res) => {
  var uid = req.session.user._id
  var pid = req.body.id

  post.edit({
    uid,
    pid,
    edit: req.body.json
  }).then((result) => {
    res.send(result)
  })
})

router.delete('/post/delete/', (req, res) => {
  var account = req.session.user._id
  var pid = req.body.id

  post.delete(account, pid).then((result) => res.send(result))
})

function add_props(post, user) {
  if (user) {
    for (i = 0; i < post.length; i++) {
      let viewable = false
      let deleted = false

      if (post[i].uid.toString() === user._id.toString())
        post[i].owned = true

      if (post[i].private) {
        for (z = 0; z < post[i].viewers.length; z++)
          if (post[i].viewers[z] === user._id.toString())
            viewable = true
            
        if (!viewable && !post[i].owned) {
          post.splice(i, 1)
          deleted = true
        }
      }

      if (!deleted) {
        if (post[i].likers.length > 0) {
          for (x = 0; x < post[i].likers.length; x++) {
            if (user && post[i].likers[x].toString() === user._id.toString()) {
              post[i].liked = true
            }
          }
        } else {
          post[i].liked = false
        }
      }
    }
  } else {
    for (i = 0; i < post.length; i++) {
      if (post[i].private) {
        post.splice(i, 1)
      }
    }
    
  }
}

module.exports.router = router
module.exports.add_props = (posts, user) => {
  add_props(posts, user)
}