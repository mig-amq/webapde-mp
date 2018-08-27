var limit = 5;
var skip = 0;
var fetching = false;

let loader = $("#post-loader");

const _TYPES = {
  def: 'default',
  search: 'search/get/',
  tag: 'tag/get/',
  rand: 'random/continue',
  user: 'user',
}

async function getData(type = _TYPES.def, query = {}, limit = 5, skip = 0) {
  let p = new Promise((res, rej) => {
    $.ajax({
      url: '/post/' + type + '/',
      method: 'GET',
      data: {
        query: query,
        limit: limit,
        skip: skip,
      },
      success: (data) => {
        res(data);
      },
      error: (err) => {
        rej(err);
      }
    })
  })

  return await p;
}


function putContent(type = _TYPES.def, query = {}, limit = 5, skip = 0) {
  loader.addClass('active');

  getData(type, query, limit, skip).then((d) => {
    if (d.length > 0) {
      $("#empty").addClass("hidden");

      d.forEach(e => {
        $("#content #cards").append(parsePost(e));
      });

      $('.card .image').dimmer({
        on: 'hover'
      });

      $('.card .image').blur((e) => $('.image').dimmer('hide'));
    } else {
      if ($(".card").length <= 0)
        $("#empty").removeClass("hidden");

      loader.removeClass('active');
    }
  });
}

function update_status(pid, elems) {
  $.ajax({
    url: '/post/like/',
    method: 'POST',
    data: {
      id: pid,
      _csrf: $("meta[name=global-csrf]").attr('content'),
    },
    success: (d) => {
      if (!d.exists) {
        // elems[0] is the top info
        // elems[1] is the dimmer info

        let likesTop = parseInt($(elems[0]).find('span').text());

        if ($(elems[0]).find('.icon').hasClass('red')) {
          $(elems[0]).find('.icon').removeClass('red');
          $(elems[0]).find('span').text(likesTop - 1);

          $(elems[1]).find('.header > .heart').removeClass('red');
          $(elems[1]).find('.header > span').text("Like!");
        } else {
          $(elems[0]).find('.icon').addClass('red');
          $(elems[0]).find('span').text(likesTop + 1);

          $(elems[1]).find('.header > .heart').addClass('red');
          $(elems[1]).find('.header > span').text(" Liked!");
        }
      } else {
        $("#login").modal('show');

        var list = document.createElement("ul");
        $("#loginTab form").addClass("error");

        list.className = "list";

        if (d.server) {
          $(list).append("<li> Oh Noes! The server broke! </li>");
        } else if (d.db) {
          $(list).append("<li> Uh Oh! Something went wrong with the database </li>");
        } else {
          if (d.uid)
            $(list).append("<li>" + d.uid + "</li>");

          if (d.pid)
            $(list).append("<li>" + d.pid + "</li>");
        }

        $("#loginTab form .ui.error.message").append(list);
      }
    }
  })
}

/**
 * The following functions are used to parse the post data
 * received form the server.
 */

function parsePost(data) {
  let pid = data._id,
    ptitle = data.title,
    pcont = data.post,
    plikes = data.likes,
    pliked = data.liked,
    powner = data.user,
    ptags = data.tags,
    powned = data.owned,
    ptime = getDate(data.time);

  var settings = document.createElement("div");

  if (powned) {
    var edit = $("<div id='editModal' class='item'><i class='edit outline icon'></i>Edit Post</div>");
    var del = $("<div id='delModal' class='ui red item'><i class='exclamation circle icon'></i>Delete Post</div>");
    settings.className = "ui right dropdown";
    var settings_icon = document.createElement("i");
    settings_icon.className = "cog icon";
    var settings_menu = document.createElement("div");
    settings_menu.className = "menu";
    $(settings_menu).append(edit)
    $(settings_menu).append(del)


    $(del).click(() => {
      $("#delForm form input[name=id]").val(pid);
      $("#delete").modal("show");
    })

    $(edit).click((e) => showEdit(pid));

    $(settings).append(settings_icon);
    $(settings).append(settings_menu);
  }

  var card = document.createElement("div");
  card.className = "ui card";
  $(card).attr('data-post', pid);

  var card_holder = document.createElement("div");
  card_holder.className = "card-holder";

  var image_content = document.createElement("div");
  image_content.className = "ui fluid blurring dimmable image";

  var image_dimmer = document.createElement("div");
  image_dimmer.className = "ui dimmer";
  $(image_dimmer).css("cursor", "pointer");

  var image_dcontent = document.createElement("div");
  image_dcontent.className = "content center";
  var image_dheader = document.createElement("div");
  image_dheader.className = "ui inverted icon header";
  var image_dicon = document.createElement("i");
  image_dicon.className = ((pliked) ? "red" : " ") + " heart icon";

  image_dheader.appendChild(image_dicon);
  image_dcontent.appendChild(image_dheader);
  image_dimmer.appendChild(image_dcontent);
  $(image_dheader).append("<span>" + ((pliked) ? "Liked!" : "Like!") + "</span>");

  var img = document.createElement("img"); // post image
  img.src = (pcont.charAt(0) === '/') ? pcont : '/' + pcont;

  var heart = document.createElement("span");
  heart.className = "right floated like icon";

  var heart_icon = document.createElement("i");
  heart_icon.className = ((pliked) ? "red" : "") + " heart icon";

  var time = document.createElement("span");
  time.className = "right floated";
  $(time).text(ptime + " ago");

  var content = document.createElement("div");
  content.className = "content";

  var title = document.createElement("div"); // post title
  title.className = "header";
  $(title).append("<a href='/post/view/" + pid + "'>" + ptitle + "</a>");

  var user = document.createElement("div");
  var username = document.createElement("a");
  user.className = "meta";
  username.href = "/user/" + data.uid.toString();
  $(username).text("@" + powner);

  var tags = document.createElement("div");
  tags.className = "extra content";

  ptags.forEach((e) => {
    let tag = document.createElement("a");
    tag.href = "/post/tag/?tag=" + e;
    tag.className = "ui label";
    tag.text = e;
    tags.appendChild(tag);
  });

  $(heart).click((e) => {
    update_status(pid, [heart, image_dcontent]);
  });

  $(image_dimmer).click((e) => {
    update_status(pid, [heart, image_dcontent]);
  });

  $(heart).append("<span>" + getLikeText(plikes) + "</span>");
  $(heart).append(heart_icon);

  image_content.appendChild(image_dimmer);
  image_content.appendChild(img);

  title.appendChild(heart);
  user.appendChild(username);
  user.appendChild(time);

  content.appendChild(title);
  content.appendChild(user);

  card.appendChild(content);
  card.appendChild(image_content);
  $(settings).dropdown();

  tags.append(settings);
  card.appendChild(tags);

  card_holder.appendChild(card);
  return card_holder;
}

function getLikeText(likes) {
  let text = "";

  if (likes >= 999999) {
    text = (likes / 1000000.00).toFixed("1") + "M";
  } else if (likes >= 1000) {
    text = (likes / 1000.00).toFixed(1) + "K";
  } else {
    text = likes;
  }

  return text;
}

function getDate(milli) {
  let res = "";
  milli = Date.now() - Date.parse(milli);

  if (milli >= 31556952000) { // 1 year
    res += Math.round(milli / 31556952000.00) + "y ";
    milli -= milli / 31556952000.00 * 31556952000.00;
  }

  if (milli >= 604800000)
    res += Math.round(milli / 604800000.00) + "w ";
  else if (milli >= 86400000)
    res += Math.round(milli / 86400000.00) + "d ";
  else if (milli >= 3600000)
    res += Math.round(milli / 3600000.00) + "h ";
  else if (milli >= 60000)
    res += Math.round(milli / 60000.00) + "m";
  else
    res += Math.round(milli / 1000) + "s ";

  return res;
}

function showDelete(pid) {
  $("#delForm form").form('reset');
  $("#delForm form").attr('data-post', pid);
  $("#delete").modal("show")

  $("#delBtn").click(() => {
    let pid = $("#delForm form").attr('data-post');
    $.ajax({
      url: "/post/delete/",
      method: "PUT",
      data: {
        id: pid,
        _csrf: $("meta[name=global-csrf]").attr('content'),
      },
      success: (status) => {
        if (status.exists) {
          var list = document.createElement("ul");
          $("#delForm form").addClass("error");

          list.className = "list";

          if (status.server) {
            $(list).append("<li> Oh Noes! The server broke! </li>");
          } else if (status.db) {
            $(list).append("<li> Uh Oh! Something went wrong with the database </li>");
          } else {
            if (status.user)
              $(list).append("<li>" + status.user + "</li>");

            if (status.post)
              $(list).append("<li>" + status.post + "</li>");

            if (status.edit)
              $(list).append("<li>" + status.edit + "</li>");
          }

          $("#editForm form .ui.error.message").append(list);
        } else {
          let parent = $(".card[data-post=" + pid + "]");
          $(this).closest(parent).hide()
        }
      }
    })
  })
}

function showEdit(pid) {
  $("#editForm form").attr('data-post', pid);
  $.ajax({
    url: "/post/" + pid + "/",
    method: "get",
    success: (result) => {
      $("#edit form #viewers").empty();
      $("#edit form #viewers").siblings("a.ui.label").remove();

      result[0].viewers.forEach((elem) => {
        $.ajax({
          url: "/user/details/" + elem,
          method: "GET",
          success: (d) => {
            $("#edit #viewers").append("<option value='" + d._id + "' selected> " + d.username + "</option>");
          }
        })
      })

      $("#edit form").form("set values", {
        title: result[0].title,
        tags: result[0].tags,
        private: result[0].private,
      })

      $("#edit").modal('show');
    },
  })
}

$("#delForm form").submit((e) => {
  e.preventDefault();

  let data = $("#delForm form").form("get values");
  $("#delForm button[type=submit]").addClass("loading");
  $("#delForm button[type=submit]").attr("disabled", true);

  $.ajax({
    url: '/post/delete',
    method: "DELETE",
    data: data,
    success: (result) => {
      $("#delForm button[type=submit]").removeClass("loading");
      $("#delForm button[type=submit]").attr("disabled", false);

      $(".card[data-post=" + data.id + "]").remove();
      $("#delete").modal('hide');
    }
  })
})

$("#edit #private").on('change', (e) => {
  if ($("#edit").form("get value", "private")) {
    $("#edit #viewers").parents(".field").removeClass('hidden');
  } else {
    $("#edit #viewers").dropdown("clear");
    $("#edit #viewers").parents(".field").addClass('hidden');
  }
})

$("#edit #viewers, #share #viewers").parent(".ui.search").on('keyup', (e) => {
  let q = $(e.target).val();

  $.ajax({
    url: "/user/search/",
    method: "GET",
    data: {
      q: q
    },
    success: (data) => {

      if (data.length > 0) {
        data.forEach(elem => {
          let display = true;

          $(e.target).siblings("#viewers").children().toArray().forEach(elem0 => {

            if (elem && elem0 && elem._id === $(elem0).attr("value"))
              display = false;
          });

          if (display) {
            $(e.target).siblings("#viewers").append("<option value='" + elem._id + "'> " + elem.username + "</option>");
          }
        });
      }
    }
  });
});

$("#editForm form").form({ // Validation Handling for Login
  fields: {
    title: {
      rules: [{
        type: "empty",
        prompt: "You can't post with no title!"
      }]
    },
    tags: {
      rules: [{
        type: "empty",
        prompt: "Oh noes! You need some tags"
      }]
    }
  },
  onSuccess: (event, fields) => {
    event.preventDefault();

    $("#editForm form .ui.error.message").empty();
    let viewers = [];

    $("#editForm form #viewers").siblings("a.ui.label.visible").toArray().forEach((e) => {
      viewers.push($(e).attr("data-value"));
    });

    $("#editForm input[type=submit]").addClass("loading");
    $("#editForm input[type=submit]").attr("disabled", true);

    var json = {
      title: fields.title,
      tags: fields.tags,
      private: (fields.private === "on") ? true : false,
      viewers: viewers,
    };

    var pid = $("#editForm form").attr('data-post');
    $.ajax({
      url: "/post/edit/",
      method: "PUT",
      data: {
        id: pid,
        _csrf: $("meta[name=global-csrf]").attr('content'),
        json,
      },
      success: (status) => {
        $("#editForm input[type=submit]").removeClass("loading");
        $("#editForm input[type=submit]").attr("disabled", false);

        if (status.exists) {
          var list = document.createElement("ul");
          $("#editForm form").addClass("error");

          list.className = "list";

          if (status.server) {
            $(list).append("<li> Oh Noes! The server broke! </li>");
          } else if (status.db) {
            $(list).append("<li> Uh Oh! Something went wrong with the database </li>");
          } else {
            if (status.user && status.user.length > 0)
              $(list).append("<li>" + status.user + "</li>");

            if (status.post && status.post.length > 0)
              $(list).append("<li>" + status.post + "</li>");

            if (status.edit && status.edit.length > 0)
              $(list).append("<li>" + status.edit + "</li>");
          }

          $("#editForm form .ui.error.message").append(list);
        } else {
          let parent = $(".card[data-post=" + pid + "]");

          $(parent).find('.header > span')[0].innerHTML = json.title;

          $(parent).find('.extra.content > .ui.label').remove();

          json.tags.forEach(elem => {
            let a = document.createElement('a');
            a.className = "ui label";
            a.href = "/post/tag/?tag=" + elem;
            $(a).text(elem);

            $(parent).find('.extra.content')[0].prepend(a);
          })

          $("#edit").modal("hide");
        }
      }
    })
  }
});