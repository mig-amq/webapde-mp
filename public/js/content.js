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
  fetching = true;

  getData(type, query, limit, skip).then((d) => {
    d.forEach(e => {
      $("#content #cards").append(parsePost(e));
    });

    $('.card .image').dimmer({
      on: 'hover'
    });

    $('.card .image').blur((e) => $('.image').dimmer('hide'));

    loader.removeClass('active');
    fetching = false;
  });
}

// @TODO
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
          $(elems[1]).find('.header > span').text("Dislike :(");
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
  console.log(data);

  if (powned) {
    var edit = $("<div id='editModal' class='item'><i class='edit outline icon'></i>Edit Post</div>");
    var del = $("<div id='delModal' class='ui red item'><i class='exclamation circle icon'></i>Delete Post</div>");
    settings.className = "ui dropdown";
    var settings_icon = document.createElement("i");
    settings_icon.className = "cog icon";
    var settings_menu = document.createElement("div");
    settings_menu.className = "menu";
    $(settings_menu).append(edit)
    $(settings_menu).append(del)
    
      
    $(del).click(()=>{
        console.log("1")
        $("#delete").modal("show")
    })
    $(edit).click((e) => {
        /*alert(pid);*/
        $.ajax({
            url: "/post/"+pid+"/",
            method: "get",
            success: (result)=>{
                console.log(result);
                $("#editTitle").val(result[0].title);
                $("#editTags").dropdown("set selected", result[0].tags)
                console.log($("#editTags").dropdown("get values"))
            },
        })
        
        $("#edit").modal('show');
    })
      
    $("#editBtn").click((e)=>{
        $.ajax({
            url: "/post/edit/",
            method: "post",
            data: {
                id: pid,
                title: $("#editTitle").val(),
                tags: $("#editTags").dropdown("get values"),
                _csrf: $("meta[name=global-csrf]").attr('content'),
            },
            success: ()=>{
                console.log("Success")
            }
        })
    })
    
    $(settings).append(settings_icon);
    $(settings).append(settings_menu);
  }

  var card = document.createElement("div");
  card.className = "ui card";

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
  $(image_dheader).append("<span>" + ((pliked) ? "Dislike :(" : "Like!") + "</span>");

  var img = document.createElement("img"); // post image
  img.src = pcont;

  var heart = document.createElement("span");
  heart.className = "right floated like";

  var heart_icon = document.createElement("i");
  heart_icon.className = ((pliked) ? "red" : "") + " heart icon";

  var time = document.createElement("span");
  time.className = "right floated";
  $(time).text(ptime + " ago");

  var content = document.createElement("div");
  content.className = "content";

  var title = document.createElement("div"); // post title
  title.className = "header";
  $(title).text(ptitle);

  var user = document.createElement("div");
  user.className = "meta";
  $(user).text("@" + powner);

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

  $(user).click((e) => {
    window.location = "/user/" + data.uid;
  });

  image_content.appendChild(image_dimmer);
  image_content.appendChild(img);

  title.appendChild(heart);
  user.appendChild(time);

  content.appendChild(title);
  content.appendChild(user);

  card.appendChild(content);
  card.appendChild(image_content);
  $(settings).dropdown();

  tags.append(settings);
  card.appendChild(tags);

  return card;
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