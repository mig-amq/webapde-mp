module.exports.db = {
  /**
   * Edit these depending on your system's
   * MongoDB settings.
   */
  mongo_db: "webapde",
  mongo_ip: "ds018558.mlab.com",
  mongo_port: "18558",
  mLab: "migq:A123456",
  opt: {
    useNewUrlParser: true
  },
}
module.exports.post_opts = {
  /**
   * DO NOT TOUCH THIS
   * These are the constants that the PostHandler controller uses
   * in filtering out posts.
   */
  regular: 0,
  user: 0,
  search: 0,
  tags: 0,
}
module.exports.server = {
  port: process.env.PORT || 3000,
}
module.exports.routes = [
  /**
   * Append the file names of the routes
   * here. (Route files must be placed in /core/routers/)
   */
  'post',
  'user',
]
module.exports.hbs = {
  static_location: 'public',
  view_locations: [
    /**
     * Append directories that will contain
     * the *.hbs files here.
     */
    "views",
  ],
  partials: [
    /**
     * Append required partials here.
     * Partials must be placed in /core/partials/
     */
    "core/partials",
  ],
  helpers: {
    /**
     * DO NOT TOUCH THIS
     * To add global helpers, go to /core/helpers/ and edit the
     * files there
     */
    helper_location: require('./core/helpers/helper_hbs'),
  },
}

module.exports.session = {
  /**
   * These are the default configuration for sessions in this app.
   * View https://www.npmjs.com/package/express-session for additional
   * configuration.
   */
  name: 'webapde-session',
  resave: true,
  saveUninitialized: true,
  secret: 'webapde-secret',
}
module.exports.cookie = {
  /**
   * These are the default configuration for cookies in this app.
   * The default expiration for a cookie is 1 year from its creation.
   * View https://www.npmjs.com/package/cookie#options-1 for additional
   * configuration.
   */
  expires: false,
  maxAge: 365 * 24 * 60 * 60 * 1000,
}
module.exports.multer = {
  /**
   * These are the default configuration for the multer module in the app.
   * Multer is responsible for the file uploads.
   * View https://www.npmjs.com/package/multer#api for additional configuration.
   */
  destination: 'public/img/uploads',
  path: '/img/uploads/',
  allowed_files: [
    /**
     * Append the MIME type of the files that the app
     * will accept when uploading. Check https://mzl.la/2ndnWSQ for a list of
     * MIME types.
     */
    'image/jpeg',
    'image/gif',
    'image/png',
    'image/svg+xml',
  ]
}
module.exports.body_parser = {
  /**
   * These are the default configuration for urlencoded() function in
   * the body-parser module in the app.
   * View https://www.npmjs.com/package/body-parser#options-3
   * for additional configuration.
   */
  extended: true
}
module.exports.csurf = {
  /**
   * These are the default configuration used for the csrf protection
   * of post requests in the app.
   * View https: //github.com/expressjs/csurf#api
   * for additional configuration.
   */
  cookie: false,
}