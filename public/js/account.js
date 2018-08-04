$("#loginTab form").form({
  fields: {
    username: {
      rules: [{
        type: "empty",
        prompt: "You can't login without a username!"
      }]
    },
    password: {
      rules: [{
        type: "empty",
        prompt: "Oh noes! What's ur secret thingy?"
      }]
    }
  },
  onSuccess: (event, fields) => {
    event.preventDefault();
    $("#loginTab form .ui.error.message").empty();

    $.ajax({
      url: '/user/login/',
      method: "POST",
      data: $("#loginTab form").form("get values"),
      success: function (status) {

        if (status.exists) {
          var list = document.createElement("ul");
          $("#loginTab form").addClass("error");

          list.className = "list";

          if (status.server) {
            $(list).append("<li> Oh Noes! The server broke! </li>");
          } else if (status.db) {
            $(list).append("<li> Uh Oh! Something went wrong with the database </li>");
          } else {
            if (status.username)
              $(list).append("<li>" + status.username + "</li>");

            if (status.password)
              $(list).append("<li>" + status.password + "</li>");
          }

          $("#loginTab form .ui.error.message").append(list);
        } else {
          location.reload();
        }
      }
    });
  }
});