putContent(_TYPES.user, {
  user
}, limit, skip);
skip += 5;

$(window).scroll((e) => {
  if (!fetching && $(window).scrollTop() + $(window).height() > $(document).height() - 100) {
    putContent(_TYPES.user, {
      user
    }, limit, skip);
    skip += 5;
  }
});