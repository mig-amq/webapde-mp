$.ajax({
  url: '/post/random/init',
  method: 'GET',
}).then((res) => {
  var title = document.createElement("div");
  title.className = "ui large center header";
  $(title).append(res);
  $("#content").prepend(title);

  // Run at page load to get initial posts
  putContent(_TYPES.rand, {
    tag: res,
  }, limit, skip);
  skip += 5;

  // Load new posts if user is near bottom of the page
  $(window).scroll((e) => {
    if (!fetching && $(window).scrollTop() + $(window).height() > $(document).height() - 100) {
      putContent(_TYPES.rand, {tag: res}, limit, skip);
      skip += 5;
    }
  });
})