$("input[name=q]").val(title);
var skip = 0;
var limit = 5;

put_comments();

function put_comments() {
  loader.addClass('active');

  get_comments().then((data) => {
    if (data.length > 0) {
      $("#empty").addClass("hidden");
      
      data.forEach(comment => {
        $("#comments #body").append(parseComment(comment));
      });
    } else {
      if ($(".comment").length <= 0)
        $("#empty").removeClass("hidden");
    }

    loader.removeClass('active');
  })

  skip += 5;
}

function get_comments() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/comment/",
      method: "GET",
      data: {
        post: pid,
        skip: skip,
        limit: limit
      },
      success: (data) => {
        resolve(data);
      }
    })
  })
}

function parseComment (data) {
  var comment = document.createElement("div");
  comment.className = "comment";
  
  var avatar = document.createElement("a");
  avatar.className = "avatar";

  var avatar_img = document.createElement("img");
  avatar_img.src = data.user.img;
  avatar.href = "/user/" + data.user._id.toString();
  
  var content = document.createElement("div");
  content.className = "content";
  var content_author = document.createElement("a");
  content_author.href = "/user/" + data.user._id.toString();
  $(content_author).text("@" + data.user.username);
  
  var meta = document.createElement("div");
  meta.className = "metadata";
  var time = document.createElement("span");
  time.className = "time";
  $(time).text(moment(data.time).fromNow());
  
  var text = document.createElement("div");
  text.className = "text";
  $(text).text(data.content);

  var actions = document.createElement("div");
  actions.className = "actions";
  var del = document.createElement("a");
  $(del).text("Delete");

  if (data.owned) {
    actions.appendChild(del);
  }

  avatar.appendChild(avatar_img);
  
  meta.appendChild(time);
  
  content.appendChild(content_author);
  content.appendChild(meta);
  content.appendChild(text);
  content.appendChild(actions);

  $(del).click(() => {
    deleteComment(data._id);
  })

  comment.appendChild(avatar);
  comment.appendChild(content);
  $(comment).attr("data-id", data._id);

  return comment;
}

function parseError (error) {
  var message = document.createElement("div");
  message.className = "ui negative message";
  var close = document.createElement("i");
  close.className = "close icon"
  var text = document.createElement("span");
  $(text).text(error);

  $(close).click(() => {
    $(message).transition('fade');
  })

  message.appendChild(close);
  message.appendChild(text);

  return message;
}

function deleteComment(comment) {
  $.ajax({
    url: "/comment/",
    method: "DELETE",
    data: {
      comment: comment,
      _csrf: $("meta[name=global-csrf]").attr("content"),
    },
    success: (status) => {
      if (status.exists) {
        if(status.server) {
          $(".comment[data-id=" + comment + "] .content").append(parseError("Oh Noes! The server broke!"));
        } else if (status.db) {
          $(".comment[data-id=" + comment + "] .content").append(parseError("Uh Oh! Something went wrong with the database"));
        } else {
          if (status.user && status.user.length > 0)
            $(".comment[data-id=" + comment + "] .content").append(parseError(status.user));

          if (status.comment && status.comment.length > 0)
            $(".comment[data-id=" + comment + "] .content").append(parseError(status.comment));
        }
      } else {
        $(".comment[data-id=" + comment + "]").remove();
      }
    }
  });
}

function update_status(pid, elem){
  $.ajax({
    url: '/post/like/',
    method: 'POST',
    data: {
      id: pid,
      _csrf: $("meta[name=global-csrf]").attr('content'),
    },
    success: (d) => {
      if (!d.exists) {

        let likesTop = parseInt($(elem).find('span').text());

        if ($(elem).hasClass('liked')) {
          $(elem).removeClass('liked');
          $(elem).find('span').text(likesTop - 1);
        } else {
          $(elem).addClass('liked');
          $(elem).find('span').text(likesTop + 1);
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

$(window).scroll((e) => {
  if (!fetching && $(window).scrollTop() + $(window).height() > $(document).height() - 45) {
    put_comments();
  }
});

$("#loadComments").click(() => {
  put_comments();
});

$("#reply textarea").keypress((e) => {
  if (e.keyCode === 13)
    $("#reply").submit();
})

$("#reply").form({
  fields: {
      post: {
        rules: [{
          type: "empty",
          prompt: "You can't comment nothing!"
        }]
      },
    },
    onSuccess: (event, fields) => {
      event.preventDefault();
      $("#reply .ui.error.message").empty();
      $("#reply button[type=submit]").addClass("loading");
      $("#reply button[type=submit]").attr('disabled', true);
      $("#empty").addClass("hidden");

      fields.post = $("#post").attr("data-id")
      
      $.ajax({
        url: '/comment/',
        method: "POST",
        data: fields,
        success: function (status) {
          $("#reply textarea").val("");
          $("#reply button[type=submit]").removeClass("loading");
          $("#reply button[type=submit]").attr('disabled', false);

          if (status.exists) {
            var list = document.createElement("ul");
            $("#reply").addClass("error");

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

              if (status.content && status.content.length > 0)
                $(list).append("<li>" + status.content + "</li>");
            }

            $("#reply .ui.error.message").append(list);
          } else {
            $("#comments #body").prepend(parseComment(status));
          }
        }
      });
    }
})