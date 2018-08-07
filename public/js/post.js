$("#shareForm form").form({
  fields: {
    title: {
      rules: [{
        type: 'empty',
        prompt: "Oops! You need a title for your post"
      }]
    },
    tags: {
      rules: [{
        type: 'empty',
        prompt: "Uh Oh! You need at least one tag for your post"
      }]
    },
    img: {
      rules: [{
        type: 'empty',
        prompt: "You're sharing an empty post?"
      }]
    }
  },
  onSuccess: (event, fields) => {
    event.preventDefault();
    let data = new FormData();

    data.append('title', fields.title);
    data.append('tags', fields.tags);
    data.append('post', $("#shareForm form input[type=file]")[0].files[0]);
    data.append('_csrf', fields._csrf);

    $.ajax({
      url: '/post/share/',
      data: data,
      method: "POST",
      processData: false,
      contentType: false,
      success: (status) => {
        console.log(status);

        if (!status.exists) {
          location.reload();
        } else {
          var list = document.createElement("ul");
          $("#shareForm form").addClass("error");

          list.className = "list";

          if (status.server) {
            $(list).append("<li> Oh Noes! The server broke! </li>");
          } else if (status.db) {
            $(list).append("<li> Uh Oh! Something went wrong with the database </li>");
          } else {
            if (status.post)
              $(list).append("<li>" + status.post + "</li>");

            if (status.title)
              $(list).append("<li>" + status.title + "</li>");

            if (status.user)
              $(list).append("<li>" + status.user + "</li>");
          }

          $("#shareForm form .ui.error.message").append(list);
        }
      }
    })
  }
});