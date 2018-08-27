// External modules
const hbs = require('hbs')
const path = require('path')
const csurf = require('csurf')
const app = require('express')()
const multer = require('multer')
const bparser = require('body-parser')
const cookie = require('cookie-parser')
const session = require('express-session')
const sanitizer = require('express-sanitizer')

// App modules
const settings = require('./config')
const user = require('./core/models/User')
const post = require('./core/models/Post')

// Start server
app.listen(settings.server.port, (e) => console.log("Server Started @ " + settings.server.port))

app.use(bparser.urlencoded(settings.body_parser)) // ready body-parser
app.use(sanitizer()) // auto escapes characters in post data
app.use(cookie()) // ready cookie-parser

/**
 * The codes below are used to initialize the HandleBars module.
 */
app.set("view engine", "html") // allows .hbs rendering

app.set("views", settings.hbs.view_locations) // allows multiple folders for views

for (let i = 0; i < settings.hbs.partials.length; i++) { // ready partials
  hbs.registerPartials(path.join(__dirname, settings.hbs.partials[i]))
}

for (let i = 0; i < settings.hbs.helpers.helper_location.length; i++) // ready helpers
  hbs.registerHelper(settings.hbs.helpers.helper_location[i][0], settings.hbs.helpers.helper_location[i][1])

app.use(session(settings.session)) // ready app sessions details
app.use(require('express').static(path.join(__dirname, settings.hbs.static_location))) // ready static files

/**
 * The codes below are used to initialize the multer module,
 * multer is used to process multiform data sent by the client.
 */
let multer_storage = multer.diskStorage({ // Adjust file storing according to settings
  destination: (req, file, cb) => {
    cb(null, path.normalize(settings.multer.destination))
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

let multer_options = {
  storage: multer_storage,
  fileFilter: (req, file, cb) => { // Validate file types
    if (settings.multer.allowed_files.indexOf(file.mimetype) >= 0) 
      return cb(null, true)

    cb(new Error("Invalid file"))
  }
}

app.use(multer(multer_options).any())
app.use(csurf(settings.csurf))

app.use("*", (req, res, next) => {
  /**
   * This route is used to check if the user logged in and ticked "Remember me"
   */

  if (!req.session.user)
    if (req.cookies.user)
      req.session.user = req.cookies.user

  res.locals.csrf = req.csrfToken()
  
  /**
   * Disable after development.
   * Used for testing.
   */
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  next()
})

app.get('/uploads/:post', (req, res) => {
  if (req.params.post) {
    post.get_posts({
      post: path.join(settings.multer.path, req.params.post)
    }).then((result) => {
      require("./core/routers/post").add_props(result, req.session.user)
      if (result && result.length > 0) {
        res.sendFile(path.join(__dirname, result[0].post))
      } else {
        user.get_account({
          img: path.join(settings.multer.path, req.params.post)
        }).then((result0) => {
          console.log(result0)
          if (result0.img.indexOf('uploads') > -1)
            res.sendFile(path.join(__dirname, result0.img))
          else
            res.sendFile(path.join(__dirname, "public", result0.img))
        }).catch((err) => {
          res.redirect('/')
        })
      }
    })
  }
})

/**
 * This loop is used to go through the routes array which then
 * allows the app to require the express.Router() objects that 
 * are exported from each route file.
 */
for (let i = 0; i < settings.routes.length; i++) {
  app.use('/', require("./core/routers/" + settings.routes[i]).router)
}

app.use('*', (req, res) => {
  res.render('err/404.hbs', {
    account: req.session.user,
    title: "Meme-A: Error 404",
  })
})