$("#loginTab form").form({ // Validation Handling for Login
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
        prompt: "Oh noes! What's ur secret passcode?"
      }]
    }
  },
  onSuccess: (event, fields) => {
    event.preventDefault();
    $("#loginTab form .ui.error.message").empty();

    console.log(fields);
    
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
            if (status.username && status.username.length > 0)
              $(list).append("<li>" + status.username + "</li>");

            if (status.password && status.password.length > 0)
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

$("#registerTab form").form({
  fields: {
    name: {
      rules: [{
        type: 'empty',
        prompt: "U have no name?? Whoah"
      }]
    },
    username: {
      rules: [{
        type: 'empty',
        prompt: "U need a username!"
      }]
    },
    password: {
      rules: [{
          type: 'empty',
          prompt: "You can't have an empty password >:("
        },
        {
          type: 'minLength[8]',
          prompt: "You need at least 8 characters for a password >:("
        },
      ]
    }
  },
  onSuccess: (event, fields) => {
    event.preventDefault();

    $("#registerTab form .ui.error.message").empty();

    /**
     * Use FormData to retrieve forms with file inputs,
     * because Semantic UI's .form() returns fake path string value of files,
     * not the file object itself.
     */
    let data = new FormData();

    data.append('username', fields.username);
    data.append('password', fields.password);
    data.append('name', fields.name);
    data.append('img', $("#registerTab form input[type=file]")[0].files[0])
    data.append('_csrf', fields._csrf);
    
    $.ajax({
      url: '/user/register/',
      method: "POST",
      data: data,
      processData: false,
      contentType: false,
      success: function (status) {
        
        if (status.exists) {
          var list = document.createElement("ul");
          $("#registerTab form").addClass("error");

          list.className = "list";

          if (status.server) {
            $(list).append("<li> Oh Noes! The server broke! </li>");
          } else if (status.db) {
            $(list).append("<li> Uh Oh! Something went wrong with the database </li>");
          } else {
            if (status.username && status.username.length > 0)
              $(list).append("<li>" + status.username + "</li>");

            if (status.password && status.password.length > 0)
              $(list).append("<li>" + status.password + "</li>");

            if (status.name && status.name.length > 0)
              $(list).append("<li>" + status.name + "</li>");
          }

          $("#registerTab form .ui.error.message").append(list);
        } else {
          $("#registerTab, #registerClick").removeClass('active');
          $("#loginTab, #loginClick").addClass('active');

          $("#loginTab").form('reset');
          $("#loginTab").form('set values', {
            username: $("#registerTab form").form('get value', 'username')
          });
        }

      }
    });
  }
})
