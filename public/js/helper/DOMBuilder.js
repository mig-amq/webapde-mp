/**
 * Converts a Post object from the database
 * into its equivalent HTML format.
 * @param {Object} json 
 * @param {Object} json._id
 * @param {string} json.title
 * @param {string} json.post
 * @param {int} json.likes
 * @param {int} json.dislikes
 * @param {Object[]} json.likers
 * @param {Object[]} json.dislikers
 */
function postToHTML(json) {
  return new Promise((res, rej) => {
    let card = document.createElement("div");

    let header = document.createElement("div");
    let user = document.createElement("div");
    let user_img = document.createElement("img");
    let user_uname = document.createElement("span");
    
    let drop = document.createElement("div");
    let drop_btn = document.createElement("button");
    let drop_body = document.createElement("ul");
    let drop_icon = document.createElement("span");

    let card_img = document.createElement("img");
    let card_body = document.createElement("div");
    let card_title = document.createElement("h4");
    let card_tags = document.createElement("div");
    let card_buttons = document.createElement("div");

    let like = document.createElement("button");
    let like_span = document.createElement("span");
    let like_stat = document.createElement("span");

    let dislike = document.createElement("button");
    let dislike_span = document.createElement("span");
    let dislike_stat = document.createElement("span");

    $(card).addClass("card");
    $(header).addClass("card-header");

    $(user).addClass("user-info");
    $(drop).addClass("dropdown");
    $(drop_btn).addClass("btn btn-secondary dropdown-toggle");
    $(drop_icon).addClass("fas fa-ellipsis-h");
    $(drop_body).addClass("dropdown-menu");

    $(card_img).addClass("card-img-top");
    $(card_body).addClass("card-body");
    $(card_tags).addClass("card-tags");
    
    $(like).addClass('like');
    $(dislike).addClass('dislike');

    $(like_span).addClass("fa fa-thumbs-up");

    $(dislike_span).addClass("fa fa-thumbs-down");

    if (json.likers.indexOf(acc) !== -1)
      $(like).addClass("active");
    else if (json.dislikers.indexOf(acc) !== -1)
      $(dislike).addClass("active");

    let get_user = new Promise((resolve, reject) => {
      $.ajax({
        url: '/user/details/' + json.user.toString(),
        method: 'GET',
        success: function (data) {
          resolve(data);
        }
      })
    });

    get_user.then((result) => {
      $(card_img).attr("data-src", json.post);
      $(card_img).lazyLoadXT();

      $(card_title).text(json.title);

      $(user_img).attr("src", result.img);
      $(user_uname).text(result.username);

      $(like_stat).text(json.likes);
      $(like).attr('data-id', json._id.toString());
      $(like).append(like_span);
      $(like).append(like_stat);

      $(like).click((e) => {
        e.preventDefault();
        updateStats(like, true);
      });

      $(dislike_stat).text(json.dislikes);
      $(dislike).attr('data-id', json._id.toString());
      $(dislike).append(dislike_span);
      $(dislike).append(dislike_stat);

      $(dislike).click((e) => {
        e.preventDefault();
        updateStats(dislike, false);
      });

      $.each(json.tags, (i, o) => {
        let tag = document.createElement("a");

        $(tag).attr("href", "/posts/tag/" + o);
        $(tag).addClass("badge");
        $(tag).addClass("badge-secondary");
        $(tag).text(o);

        $(card_tags).append(tag);
      });

      $(user_uname).text(result.username);

      $(user).append(user_img);
      $(user).append(user_uname);

      $(drop_btn).append(drop_icon);
      $(drop_btn).attr("data-toggle", "dropdown");
      $(drop_btn).attr("type", "button");

      $(drop_body).append("<a href='#' class='dropdown-item' data-id='" + json._id + "'><i class='fas fa-edit'></i>Edit Meme</a>");
      $(drop_body).append("<a href='#' class='dropdown-item danger' data-id='" + json._id + "'> <i class='far fa-trash-alt'></i> Delete Meme</a>");

      $(drop).append(drop_btn);
      $(drop).append(drop_body);

      $(header).append(user);

      if (json.user === acc)
        $(header).append(drop);

      $(card_buttons).append(like);
      $(card_buttons).append(dislike);

      $(card_body).append(card_title);
      $(card_body).append(card_buttons);

      $(card).append(header);
      $(card).append(card_img);
      $(card).append(card_body);
      $(card).append(card_tags);

      res(card);
    });
  })
}

/**
 * Creates a Bootstrap Alert element
 * @param {string} message
 * @param {string} err 
 * @param {string} strong 
 */
function createAlert (message, err = 'danger', strong = "Error") {
  var div = document.createElement("div");
  $(div).addClass("alert alert-" + err + " alert-dismissible fade show")
  $(div).attr("role", "alert");

  var btn = document.createElement("button");
  $(btn).addClass('close');
  $(btn).attr('data-dismiss', 'alert');

  var span1 = document.createElement("span");
  var span2 = document.createElement("span");

  $(span1).append("&times;");
  $(span1).attr('aria-hidden', true);
  $(span2).addClass("sr-only");
  $(span2).append("Close");

  $(btn).append(span1);
  $(btn).append(span2);
  $(div).append(btn);
  $(div).append("<strong>" + strong + ": </strong>" + message);

  return div;
}