const cnx = require('./Mongo');
const ObjectId = require('mongodb').ObjectID
const config = require('../../config')

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
      cnx.client((err, server) => {
        if (err) reject(err)

        if (json._id)
          json._id = ObjectId(json._id.toString())
        
        for (let i = 0; i < Object.keys(json).length; i++)
          if (['_id', 'username', 'password', 'name'].indexOf(Object.keys(json)[i]) === -1)
            delete json[Object.keys(json)[i]]

        let dbo = server.db(config.db.mongo_db)

        dbo.collection('users')
          .findOne(json)
          .then((result) => {
            resolve(result)
          })
          .catch((err) => {
            reject(err)
          })

        server.close()
      });
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
        }

        if (json.username.length < 4) {
          errors.exists = true
          errors.username.push("Usernames must be at least 4 characters")
        }

        if (!errors.exists) {
          cnx.client((err, server) => {
            if (err) {
              errors.exists = true
              errors.server = true

              resolve(errors)
            } else {

              let dbo = server.db(config.db.mongo_db)

              this.get_account({
                  username: json.username
                })
                .then((res) => {
                  if (!res) {
                    /**
                     * Insert account credentials to the DB
                     */
                    dbo.collection("users").insertOne(json, (err, res) => {
                      if (err) {
                        errors.exists = true
                        errors.db = true
                      }

                      resolve(errors)
                    })

                  } else { // Check if user already exists
                    errors.exists = true
                    errors.username.push("That username is already taken")

                    resolve(errors)
                  }
                }).catch((err) => {
                  errors.exists = true
                  errors.db = true

                  resolve(errors)
                })

            }

          })
        }
      } else
        resolve(errors)
    });
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
        server: false
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
        cnx.client((err, server) => {
          if (err) {
            errors.exists = true
            errors.server = true
          } else {
            this.get_account(json)
              .then((res) => {
                if (!res) {
                  errors.exists = true
                  errors.username = ["That account does not exist"]
                }

                resolve(errors)
              })
              .catch((err) => {
                errors.exists = true
                errors.db = true

                resolve(errors)
              })
          }

          server.close()
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
  edit (json) {
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
          if (!(Object.keys(json.edit)[i] in ['password', 'name', 'img']))
            delete json.edit[Object.keys(json.edit)[i]]

        cnx.client((err, server) => {
          if (err) {
            errors.exists = true
            errors.server = true

            resolve(errors)
          } else {
            let dbo = server.db(config.db.mongo_db)

            dbo.collection('users').findOne({
              _id: ObjectId(json.id.toString()),
            }).then((res) => {
              if (!res) {
                errors.exists = true
                errors.id = "Invalid user ID"

                resolve(errors)
              } else {
                dbo.collection('users').updateOne({
                  _id: ObjectId(json.id.toString())
                }, {$set: json.edit}, (err1, result) => {
                  if (err1) {
                    errors.exists = true
                    errors.db = true
                  }

                  resolve(errors)
                })
              }
            })
          }
        })
      } else
        resolve(errors)
    })
  },
}