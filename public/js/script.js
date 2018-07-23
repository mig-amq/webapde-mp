$(document).ready(() => {
  var skip = 0;
  var limit = 5;
  var memeTags = [];

  /**
   * This handles the mobile navigation.
   * It expands the height once the hamburger icon is clicked
   */
  $(".navigation #header #hamburger").click(() => {
    var items = $(".navigation #items");
    if (items.data("expanded")) {
      items.slideUp();
      items.data("expanded", false);
    } else {
      items.slideDown();
      items.data("expanded", true);
    }
  })

  /**
   * This code handles the loading of new posts 
   * at the loading of the page
   */
  $.ajax({
    url: '/post/default',
    method: 'GET',
    data: {
      limit: limit
    },
    success: function (data) {
      $.each(data, (i, o) => {
        postToHTML(o).then((html) => $("#posts").append(html));
      })
    }
  })

  /**
   * This code handles the auto loading of new posts
   * after scrolling to the bottom of the page
   */
  $(window).scroll(function () {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
      skip += 5;

      $.ajax({
        url: '/post/default',
        data: {
          limit: limit,
          skip: skip,
        },
        method: 'GET',
        success: function (data) {
          $.each(data, (i, o) => {
            if (o.length <= 0)
              skip -= 10;

            postToHTML(o).then((html) => $("#posts").append(html));
          })
        }
      })
    }
  });

  $("#loginForm #login").submit((e) => {
    e.preventDefault();
    logIn();
  })

  $("#memeshare").submit((e) => {
    e.preventDefault();
    if (memeTags.length > 0) {

      var data = new FormData();

      memeTags = memeTags.join(" ");

      data.append("memeTitle", $("#memeTitle").val());
      data.append("memeTags", memeTags);
      data.append("file", $("#meme")[0].files[0]);

      memeTags = [];
      post(data);
    } else {
      $("#req-tags").addClass("bad")
    }
  });

  $("#meme").change((e) => {
    $("label[for=meme]").text(e.target.files[0].name);
  });

  $("#memeTags").keydown((e) => {
    if ([13, 32].indexOf(e.keyCode) >= 0) {
      e.preventDefault();
      let tag = $("#memeTags").val();
      tag = tag.replace(/\s+/gi, "").trim();
      if (memeTags.indexOf(tag) <= -1) {
        memeTags.push(tag);
        $("#memeTags").val("");

        var t = $("<span class='badge badge-pill badge-secondary' style='padding: 4px 5px;'>" + tag + " <i style='margin-left: 3px;' class='fa fa-times-circle'></i></span>");
        $("#memeTagList").append(t);

        $("#req-tags").removeClass("bad");
        
        t.click((e) => {
          t.remove();
          memeTags.splice(memeTags.indexOf(tag), 1);
          console.log(memeTags);
        });
      }
    }
  })
});

function updateStats(obj, like = true) {
  var url;

  if (like)
    url = "/post/like/";
  else
    url = "/post/dislike/";

  $.ajax({
    url: url,
    data: {
      id: $(obj).attr('data-id')
    },
    method: "POST",
    success: function (json) {

      if (!json.exists) {
        var text = $(obj).children("span:last-child").text();
        $(obj).children("span:last-child").text(parseInt(text) + 1);
        $(obj).addClass("active");

        if ($(obj).is(":last-child")) {
          if ($(obj).prev().hasClass("active")) {
            $(obj).prev().removeClass("active");
            $(obj).prev().children("span:last-child").text(parseInt($(obj).prev().children("span:last-child").text()) - 1);
          }
        } else {
          if ($(obj).next().hasClass("active")) {
            $(obj).next().removeClass("active");
            $(obj).next().children("span:last-child").text(parseInt($(obj).next().children("span:last-child").text()) - 1);
          }
        }
      } else {
        console.log(json);
      }
    }
  })

  $("#userLogin").click((event) => event.preventDefault());
}

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
      $(card_img).attr("src", "/" + json.post);
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

function post(json) {
  $.ajax({
    url: '/post/share/',
    method: 'POST',
    data: json,
    processData: false,
    contentType: false,

    success: function (result) {
      console.log(result);
      if (!result.exists) {
        location.reload();
      } else {
        console.log(result);
      }
    }
  })
}

function logIn() {
  let username = $("#login #username").val();
  let password = $("#login #password").val();
  let remember = $("#login #remember").is(":checked");

  $.ajax({
    url: '/user/login',
    data: {
      username: username,
      password: password,
      remember: remember,
    },
    method: "POST",
    success: (data) => {
      if (!data.exists) {
        location.reload();
      } else {
      }
    }
  })
}