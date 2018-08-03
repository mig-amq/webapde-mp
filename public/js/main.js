$(document).ready(() => {
  var limit = 5;
  var skip = 0;
  var memeTags = [];

  /**
   * This handles the mobile navigation.
   * It expands the height once the hamburger icon is clicked
   */
  $(".navigation #header #hamburger, .navigation #header").click((e) => {
    e.stopPropagation();
    var items = $(".navigation #items");
    if (items.data("expanded")) {
      items.slideUp(150);
      items.data("expanded", false);
    } else {
      items.slideDown(150);
      items.data("expanded", true);
    }
  })

  /**
   * This code handles the exit
   * animation if the mobile menu is open
   * and the content/body was clicked
   */
  $("#content").click((e) => {
    if ($(".navigation #items").data("expanded")) {
      $(".navigation #items").slideUp(150);
      $(".navigation #items").data("expanded", false);
    }
  });

  loadPosts(query, limit, skip);
  skip += limit;

  /**
   * This code handles the auto loading of new posts
   * after scrolling to the bottom of the page
   */
  $(window).scroll(function () {
    if (Math.ceil($(window).scrollTop() + $(window).height()) >= Math.floor($(document).height())) {
      loadPosts(query, limit, skip);
      skip += limit;
    }
  });
  
  /**
   * This handles the registration
   */
  $("#registerForm #register").submit((e) => {
    e.preventDefault();
    register();
  })

  $("#loginForm #login").submit((e) => {
    e.preventDefault();
    logIn();
  });

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
      $("#memeTagList").empty();
    } else {
      $("#req-tags").addClass("bad")
    }
  });

  $("#meme").change((e) => {
    if (e.target.files[0])
      $("label[for=meme]").text(e.target.files[0].name);
  });

  $("#img").change((e) => {
    if (e.target.files[0])
      $("label[for=img]").text(e.target.files[0].name);
  })

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
        });
      }
    }
  });
});

/**
 * Handles Account registration
 */
function register() {
  let data = new FormData();

    data.append('username', $("#reg_username").val());
    data.append('password', $("#reg_password").val());
    data.append('name', $("#name").val());
    data.append('img', $("#img")[0].files[0])

    $("#registerForm #register button[type=submit]").attr("disabled", true);

    $.ajax({
      url: '/user/register/',
      method: 'POST',
      data: data,
      processData: false,
      contentType: false,
      success: (res) => {
        if (!res.exists) {
          $("#loginModal a[href='#loginForm'").tab('show');
          $("#loginErrors").append(createAlert("Successfully created your account", "success", "Success"));
        } else {
          console.log(res);
        }
        $("#registerForm #register button[type=submit]").attr("disabled", false);
      }
    })
}

/**
 * Handles the login functionality
 */
function logIn() {
  let username = $("#login #username").val();
  let password = $("#login #password").val();
  let remember = $("#login #remember").is(":checked");

  $("#loginForm #login button[type=submit]").attr("disabled", true);
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
        var errors = []
        for (let i = 0; i < data.username.length; i++)
          errors.push(data.username[i]);

        for (let i = 0; i < data.password.length; i++)
          errors.push(data.password[i]);

        for (let i = 0; i < errors.length; i++)
          $("#loginErrors").append(createAlert(errors[i]));
      }
      
      $("#loginForm #login button[type=submit]").attr("disabled", false);
    }
  })
}