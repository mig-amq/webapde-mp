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
    data.append('private', fields.private);
    data.append('viewers', fields.viewers);

    $("#showImage img").attr("src", "");
    $("#showImage i").removeClass("hidden");
    $("#shareForm button[type=submit]").addClass("loading");
    $("#shareForm button[type=submit]").attr("disabled", true);

    $.ajax({
      url: '/post/share/',
      data: data,
      method: "POST",
      processData: false,
      contentType: false,
      mimeType: 'multipart/form-data',
      headers: {
        "X-CSRF-TOKEN": fields._csrf
      },
      success: (status) => {
        $("#shareForm button[type=submit]").removeClass("loading");
        $("#shareForm button[type=submit]").attr("disabled", false);

        if (!status.exists) {
          status = JSON.parse(status);
          status.owned = true;

          $("#content #cards").prepend(parsePost(status));
          $("#share").modal('hide');

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