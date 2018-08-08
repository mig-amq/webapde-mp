$("input[name=q]").val(q);

putContent(_TYPES.search, {q}, limit, skip);
skip += 5;

$(window).scroll((e) => {
  if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
    putContent(_TYPES.search, {q}, limit, skip);
    skip += 5;
  }
});