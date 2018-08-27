const Post = require('./Post')
const User = require('./User')
const Mongo = require('./Mongo')

module.exports = {
    /**
     * 
     * @param {Object|String} pid 
     * @param {Object} sort 
     * @param {int} limit 
     * @param {int} skip 
     */
    get_comments(pid, sort = {
        time: -1
    }, limit = 0, skip = 0) {
        return new Promise((resolve, reject) => {
            Mongo.Comment
                .find({
                    post: pid
                })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean()
                .exec((err, comments) => {
                    if (err) resolve([])

                    if (comments) {
                        let getUserData = []

                        comments.forEach(comment => {
                            getUserData.push(new Promise((resolve0, reject0) => {
                                Mongo.User
                                    .findById(comment.user)
                                    .lean()
                                    .exec((err, user) => {
                                        if (err) resolve0(comment)

                                        var newComment = comment;

                                        if (user) {
                                            delete user.password
                                            delete user.posts

                                            newComment.user = user
                                        }

                                        resolve0(newComment)
                                    })
                            }))
                        })

                        Promise.all(getUserData).then((newComments) => {
                            resolve(newComments)
                        })
                    }
                })
        })
    },

    /**
     * 
     * @param {Object} json 
     * @param {String} post
     * @param {String} user
     * @param {String} content
     */
    add_comment(json) {
        return new Promise((resolve, reject) => {
            let errors = {
                post: '',
                user: '',
                content: '',
                db: false,
                server: false,
                exists: false,
                result: {},
            }

            for (i = 0; i < Object.keys(json); i++)
                if (['post', 'user', 'content'].indexOf(Object.keys(json)[i]) === -1)
                    delete json[Object.keys(json)[i]]

            if (!json.post) {
                errors.exists = true
                errors.post = "Invalid post"
            }

            if (!json.user) {
                errors.exists = true
                errors.user = "You must be logged in to comment on a post"
            }

            if (!json.content || (json.content && json.content.length <= 0)) {
                errors.exists = true
                errors.content = "Your comment can't be empty"
            }

            if (!errors.exists) {
                Mongo.Comment.create(json, (err, result) => {
                    if (err || !result) {
                        errors.exists = true
                        errors.db = true

                        resolve(errors)
                    } else {
                        Mongo.User.findById(result.user).lean().exec((err0, user) => {
                            if (err0) {
                                errors.exists = true
                                errors.db = true

                                resolve(errors)
                            }
                            var newResult = result.toObject();

                            delete user.posts
                            delete user.password

                            newResult.user = user

                            resolve(newResult)
                        })
                    }
                })
            } else {
                resolve(errors)
            }
        })
    },

    /**
     * 
     * @param {String} cid 
     * @param {String} user 
     */
    delete_comment(cid, user) {
        return new Promise((resolve, reject) => {
            let errors = {
                comment: "",
                user: "",
                db: false,
                server: false,
                exists: false,
            }

            if (!user) {
                errors.exists = true
                errors.user = "You need to be logged in to delete this post"
            }

            Mongo.Comment.findOneAndRemove({
                _id: cid,
                user: user
            }, (err, res) => {
                if (err) {
                    errors.exists = true
                    errors.db = true
                } else if (!res) {
                    errors.exists = true
                    errors.comment = "Oops! Can't delete that comment right now"
                }

                resolve(errors)
            })
        })
    },

    update_stats(cid, user) {
        return new Promise((resolve, reject) => {
            let errors = {
                comment: "",
                user: "",
                db: false,
                server: false,
                exists: false,
            }

            if (!user) {
                errors.exists = true
                errors.user = "You must be logged in to like a post"
            }

            if (!errors.exists) {
                Mongo.Comment.findById(cid, (err, comment) => {
                    if (err) {
                        errors.exists = true
                        errors.db = true

                        resolve(errors)
                    } else if (!comment) {
                        errors.exists = true
                        errors.comment = "Oops! That comment does not exist"

                        resolve(errors)
                    } else {
                        var liked = false

                        for (i = 0; i < comment.likers.length && !liked; i++)
                            if (comment.likers[i].toString() === user.toString()) {
                                liked = true
                            }

                        if (!liked) {
                            comment.likers.push(user)

                            comment.likes += 1
                        } else {
                            comment.likers.splice(comment.likers.indexOf(user, 1))
                            comment.likes -= 1
                        }

                        comment.save((err, updated) => {
                            if (err) {
                                errors.exists = true
                                errors.db = true
                            }

                            resolve(errors)
                        })
                    }
                })
            } else {
                resovle(errors)
            }
        })
    },
}