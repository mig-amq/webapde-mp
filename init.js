/**
 * DO NOT TOUCH THIS!!
 * Only run this file once. This populates the app's db
 * with initial data.
 */

const config = require('./config')
const user = require('./core/models/User')
const post = require('./core/models/Post')
const cnx = require('./core/models/Mongo')

/**
 * Create database and collections
 */
cnx.client((err, server) => {
  if (err) throw err

  let dbo = server.db(config.db.mongo_db)

  dbo.collection('posts').deleteMany({})
  dbo.collection('users').deleteMany({})
})

/**
 * Create initial users
 */
let init_users = new Promise((resolve, reject) => {
  let u1 = user.create({
    username: 'migq',
    password: '12345678',
    name: "Miguel Quiambao",
  }).then((errors) => console.log((errors.exists) ? "User Error: Cannot create migq" : "User migq created"))

  let u2 = user.create({
    username: 'mbong',
    password: '12345678',
    name: "Mitchell Ong",
  }).then((errors) => console.log((errors.exists) ? "User Error: Cannot create mbong" : "User mbong created"))

  let u3 = user.create({
    username: 'ernie',
    password: '12345678',
    name: "Ernesto Go"
  }).then((errors) => console.log((errors.exists) ? "User Error: Cannot create ernie" : "User ernie created"))

  Promise.all([u1, u2, u3]).then((promises) => {
    let users = ['migq', 'mbong', 'ernie']

    for (let i = 0; i < promises; i++)
      promises.then((errors) => console.log((errors.exists) ? "User Error: Cannot create ernie" : "User " + users[i] + " created"))

    resolve()
  })
})

/**
 * Create initial posts
 */
init_users.then(() => {
  let uid1 = user.get_account({
    username: 'migq'
  })
  let uid2 = user.get_account({
    username: 'mbong'
  })
  let uid3 = user.get_account({
    username: 'ernie'
  })

  let sample_imgs = [
    '1531376417374.jpg', 'Babypowder.png',
    'boy.jpg', 'cake.png', 'CSGO.png', 'ded.jpg',
    'emiya.jpg', 'HalfLife.png', 'ITInterview.png',
    'LetsGo.png', 'MAXTECH.png', 'Notacop.png', 'Ouranium.png',
    'Overclocked.png', 'Pokemonspeech.png', 'sample.jpg', 'soy.jpg',
    'suicideprevention.png', 'Vaccum.png', 'WiiGuy.png', 'Wut.png'
  ]

  Promise.all([uid1, uid2, uid3]).then((res) => {
    for (let i = 0; i < sample_imgs.length; i++) {
      let user = res[Math.floor(Math.random() * res.length)]
      let num = Math.floor(Math.random() * 5)

      post.create({
        user: user._id,
        post: 'img/samples/' + sample_imgs[i],
        title: 'Test Post #' + i,
        tags: ['tag', 'tag' + num]
      }).then((errors) => console.log((errors.exists) ? "Post Error: Cannot add to " + user.username : "Post added to " + user.username))
    }
  })
})