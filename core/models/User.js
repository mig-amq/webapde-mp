const Mongo = require('./Mongo.js');
const sha = require('sha.js')
const path = require('path')

module.exports = {

  /**
   * Searches for an account with the specified attributes below
   * (each attribute is optional). Adjusts the current account instance to contain
   * the attributes of the found data if retain is true, else, an account object
   * is returned.
   * @param {_id|username|password|name} json 
   */
  get_account(json = {}) {

    return new Promise((resolve, reject) => {
      if (json._id)
        if (json._id.length < 24)
          resolve([])
      else
        json._id = Mongo.ObjectId(json._id.toString())

      for (let i = 0; i < Object.keys(json).length; i++)
        if (['_id', 'username', 'password', 'name'].indexOf(Object.keys(json)[i]) === -1)
          delete json[Object.keys(json)[i]]

      Mongo.User.findOne(json).lean().exec((err, res) => {
        if (err) reject(err)

        if (!res) {
          reject(null)
        } else {
          if (res.img.indexOf('uploads') > -1)
            res.img = path.normalize("/" + res.img);
          resolve(res)
        }
      })
    })

  },

  /**
   * Creates an account given the specified attribute below
   * (each attribute is required). Returns an object with an attribute 
   * 'exists' that contains true, if an error was encounterd, and false if
   * the account was succesfully created.
   * @param {Object} json - The account that will be created
   * @param {string} json.username - The account's username
   * @param {string} json.password - The account's password
   * @param {string} json.name - The user's name
   * @param {string} json.img - The user's profile picture
   */
  create(json) {
    return new Promise((resolve, reject) => {
      let errors = {
        username: [],
        password: [],
        name: [],
        db: false,
        server: false,
        exists: false
      }

      /**
       * Check if all required data was sent
       */
      if (!json.username) {
        errors.exists = true
        errors.username.push("Username is required")
      }

      if (!json.password) {
        errors.exists = true
        errors.password.push("Password is required")
      }

      if (!json.name) {
        errors.exists = true;
        errors.name.push('A name is required');
      }

      if (!json.img)
        json.img = '/img/samples/sample_profile.jpg'

      if (!errors.exists) {
        json.username = json.username.replace(/\s+/gi, "")
        json.password = json.password.replace(/\s+/gi, "")
        json.name = json.name.replace(/\s+/gi, " ")

        /**
         * Check if data fits the constraints:
         * Password length must be >= 8 characters
         * Username length must be >= 4 characters
         */
        if (json.password.length < 8) {
          errors.exists = true
          errors.password.push("Password must be at least 8 characters")

          resolve(errors);
        }

        if (json.username.length < 4) {
          errors.exists = true
          errors.username.push("Usernames must be at least 4 characters")

          resolve(errors);
        }

        if (!errors.exists) {
          Mongo.User.countDocuments({
            username: json.username
          }, (err, res) => {
            if (err) {
              errors.exists = true
              errors.db = true

              resolve(errors)
            } else {
              if (res > 0) {
                errors.exists = true
                errors.username = "Username is already taken"

                resolve(errors)
              } else {

                // Hash the password
                json.password = sha('sha256').update(json.password).digest('hex');

                Mongo.User.create(json, (err, res) => {
                  if (err) {
                    errors.exists = true
                    errors.db = true
                  }

                  resolve(errors)
                })
              }
            }
          })
        }
      } else
        resolve(errors)
    });
  },

  /**
   * 
   * @param {string} username 
   */
  search_username(username) {
    return new Promise((resolve, reject) => {
      if (typeof username === 'string')
        username = username.replace(/\s+/, " ").trim().split(" ")

      let q = []

      username.forEach(u => {
        q.push({
          username: {
            $regex: ".*" + u + ".*",
            $options: "i",
          }
        })
      });

      Mongo.User.find({
        $or: q,
      }).lean().exec((err, res) => {
        delete res.posts
        delete res.password

        if (err || !res)
          resolve([])

        resolve(res)
      })
    })
  },

  /**
   * Looks for an account with the specified attributes
   * (each attribute is required). Returns a Promise
   * containing a JSON object
   * @param {Object} json 
   * @param {string} json.username
   * @param {string} json.password
   */
  login(json) {
    return new Promise((resolve, reject) => {
      let errors = {
        username: [],
        password: [],
        exists: false,
        server: false,
        db: false,
      }

      if (!json.username || (json.username && json.username.replace(/\s+/g, "").length <= 0)) {
        errors.username.push("Username is required")
        errors.exists = true
      }

      if (!json.password || (json.password && json.password.replace(/s+/g, "").length <= 0)) {
        errors.exists = true
        errors.password.push("Password is required")
      }

      if (!errors.exists) {
        json.password = sha('sha256').update(json.password).digest('hex')

        Object.keys(json).forEach(el => {
          if (["username", "password"].indexOf(el) === -1)
            delete json[el]
        })

        Mongo.User.findOne(json, (err, res) => {
          if (err) {
            errors.exists = true
            errors.db = true
          } else {
            if (!res) {
              errors.exists = true
              errors.username = "Account does not exist"
            }

            resolve(errors)
          }
        })
      } else
        resolve(errors)

    })
  },

  /**
   * 
   * @param {Object} json 
   * @param {string} json.id
   * @param {Object} json.edit
   */
  edit(json) {
    return new Promise((resolve, reject) => {
      let errors = {
        id: '',
        edit: '',
        exists: false,
        server: false,
        db: false,
      }

      if (!json.id) {
        errors.exists = true
        errors.id = "You must be logged in first"
      }

      if (!json.edit) {
        errors.exists = true
        errors.edit = "There is nothing to change"
      }

      if (!errors.exists) {
        for (let i = 0; i < Object.keys(json.edit).length; i++)
          if (['password', 'name', 'img'].indexOf(Object.keys(json.edit)[i]) <= -1)
            delete json.edit[Object.keys(json.edit)[i]]

        if (json.edit.password) {
          json.edit.password = sha('sha256').update(json.edit.password).digest('hex')
        }
        Mongo.User.findByIdAndUpdate(json.id, json.edit, {
          new: true
        }, (err, res) => {
          if (err) {
            errors.exists = true
            errors.db = true

            resolve(errors)
          } else {
            if (!res) {
              errors.exists = true
              errors.id = "Account does not exist"

              resolve(errors)
            } else 
              resolve(res)
          }
        })
      }
    })
  },
}