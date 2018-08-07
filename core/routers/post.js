const router = require('express').Router()
const post = require('../models/Post')
const user = require('../models/User')

router.get('/', (req, res) => {
  let account = req.session.user

  res.render('index.hbs', {
    account,
    default: true,
    title: "Meme-A: Home Page",
    csrf: req.csrfToken(),
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
          add_prop_liked(result, req.session.user)
          res.send(result)
        })
      } else if(req.params.func === 'init') {
        post.get_random_tag(true).then((result) => {
          res.send(result)
        })
      } else {
          res.render('index.hbs', {
            account,
            random: true,
            title: "Meme-A: Random Tag!",
            csrf: req.csrfToken(),
          })
      }
      break;
    case "search":
      let q = req.query.q || ""
      
      if (req.params.func === "get") {
        q = req.query.query.q || "";

        post.get_posts_search(q, true, limit, skip).then((result) => {
          add_prop_liked(result, req.session.user)
          res.send(result)
        })
      } else {
        res.render('index.hbs', {
          title: "MEME-A: Searching for " + q,
          search: q,
          csrf: req.csrfToken(),
          account,
        })
      }
        break;
    case "tag":
      let tag = req.query.tag || ""

      if (req.params.func === "get") {
        tag = req.query.query.tag || "";

        post.get_posts_tag([tag], true, limit, skip).then((result) => {
          add_prop_liked(result, req.session.user)
          res.send(result)
        })
      } else {
        res.render('index.hbs', {
          title: "MEME-A: " + tag + " posts" ,
          csrf: req.csrfToken(),
          account, tag,
        })
      }
      break;
    case "user":
      let user = req.query.query.user || ""

      post.get_posts_user(user, true, limit, skip).then((result) => {
        add_prop_liked(result, req.session.user)

        res.send(result)
      })
      break;
    case "default":
      post.get_posts({}, {
        likes: -1,
        time: -1
      }, limit, skip).then((result) => {
        add_prop_liked(result, req.session.user)

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
    tags: req.body.tags
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

function add_prop_liked(post, user) {
  for (i = 0; i < post.length; i++) {
    if (post[i].likers.length > 0) {
      for (x = 0; x < post[i].likers.length; x++) {
        if (user && post[i].likers[x].toString() === user._id.toString()) {
          post[i].liked = true
        }
      }
    }else
      post[i].liked = false
  }
}
module.exports = router