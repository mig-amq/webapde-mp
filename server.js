// External modules
const hbs = require('hbs')
const path = require('path')
const app = require('express')()
const multer = require('multer')
const bparser = require('body-parser')
const cookie = require('cookie-parser')
const session = require('express-session')

// App modules
const settings = require('./config')
const user = require('./core/models/User')

// Start server
app.listen(settings.server.port, (e) => console.log("Server Started @ " + settings.server.port))

app.use(bparser.urlencoded(settings.body_parser)) // ready body-parser
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


app.use("*", (req, res, next) => {
  /**
   * This route is used to check if the user logged in and ticked "Remember me"
   */

  if (!req.session.user)
    if (req.cookies.user)
      req.session.user = req.cookies.user
  
  /**
   * Disable after development.
   * Used for testing.
   */
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  next()
})

app.use(multer(multer_options).any())

/**
 * This loop is used to go through the routes array which then
 * allows the app to require the express.Router() objects that 
 * are exported from each route file.
 */
for (let i = 0; i < settings.routes.length; i++) {
  app.use('/', require("./core/routers/" + settings.routes[i]))
}

app.use('*', (req, res) => {
    user.get_account({
      _id: req.session.user
    }).then((result) => {
      let account = result;

      res.render('err/404.hbs', {
        account
      })
    })
})