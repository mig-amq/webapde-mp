// Run at page load to get initial posts
putContent(_TYPES.def, {}, 5, 0);
skip += 5;

// Load new posts if user is near bottom of the page
$(window).scroll((e) => {
  if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
    putContent(_TYPES.def, {}, limit, skip);
    skip += 5;
  } 
});