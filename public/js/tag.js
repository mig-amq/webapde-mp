$("input[name=q]").val(tag);

putContent(_TYPES.tag, {
  tag
}, limit, skip);
skip += 5;

$(window).scroll((e) => {
  if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
    putContent(_TYPES.tag, {
      tag
    }, limit, skip);
    skip += 5;
  }
});