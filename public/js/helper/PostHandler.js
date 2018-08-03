function loadPosts (query = {type: __regular, likes: -1, time: -1}, limit = 5, skip = 0) {
  $("#loadingBottom").css("display", "block");

  $.ajax({
    url: '/post/default',
    data: {
      query: query,
      limit: limit,
      skip: skip,
    },
    method: 'GET',
    success: function (data) {

      $.each(data, (i, o) => {
      
        if (o.length <= 0)
          skip -= 10;
          
        postToHTML(o).then((html) => {
          $("#posts").append(html);
        });
      });

      $("#loadingBottom").css("display", "none");
    }
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

function updateStats(obj, like = true) {
  var url;
  $("#loginErrors").empty();

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
        if (json.uid.length > 0) {
          $("#loginErrors").append(createAlert(json.uid));
          $("#loginModal").modal();
        }
      }
    }
  })

  $("#userLogin").click((event) => event.preventDefault());
}