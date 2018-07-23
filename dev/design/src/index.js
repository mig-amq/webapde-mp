$(document).ready(() => {
  $(".navigation #header #hamburger").click(() => {
    var items = $(".navigation #items");
    if (items.data("expanded")) {
      items.slideUp();
      items.data("expanded", false);
    } else  {
      items.slideDown();
      items.data("expanded", true);
    }
  })
});