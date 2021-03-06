# MEME-A
**MEME-A** is a meme sharing site made with Node.js and MongoDB, this project is used for the requirements of the course: **WEBAPDE AY1718T3**. 

### Dependencies
  1. [express](https://www.npmjs.com/package/express)
  2. [express-session](https://www.npmjs.com/package/express-session)
  3. [multer](https://www.npmjs.com/package/multer)
  4. [cookie-parser](https://www.npmjs.com/package/cookie-parser)
  5. [body-parser](https://www.npmjs.com/package/body-parser)
  6. [hbs](https://www.npmjs.com/package/hbs)
  7. [mongodb](https://www.npmjs.com/package/mongodb)

## TODO
1. **Classes**
    1. _./core/models/Post_
        - [x] Create a post
        - [x] Edit a post (title, tags)
        - [x] Remove a post
        - [x] View a post (user, tag, search, default)

    2. _./core/models/User_
        - [x] Create a user
        - [x] Login a user (just check credentials)
        - [x] Edit credentials (password, name, profile)

2. **Views**
    - [x] Homepage
    - [ ] Profile page
      - [X] Edit Details page
    - [x] Login/Register page
    - [x] Share-A-Meme page
    - [x] Search Post page

3. **Functionality**
    * Users
      - [x] Logging In
      - [x] Remember Me
      - [x] Default
      - [X] Registering
        - [X] Profile Pic Upload
      - [x] Regular Registration (default profile pic)
      - [x] Log Out
      - [X] Editing Details
        - [X] Changing Name
        - [X] Changing Password
    * Posts
      - [x] Creating a Post
      - [X] Editing a Post:
        - [X] Changing Title
        - [X] Editing Tags
          - [X] Adding Tags
          - [X] Removing Tags
      - [X] Deleting a Post
      - [X] Viewing Posts:
        - [x] Default View
        - [X] User View
        - [X] Tag View
        - [X] Search View
