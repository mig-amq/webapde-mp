var bar_loc = $("#navbar").offset().top + 5;

$("#loginModal").click(() => $("#login").modal('show'));

$(window).on('scroll', (e) => {
  if($(window).scrollTop() >= bar_loc)
    $("#navbar, #content").addClass('sticky');
  else 
    $("#navbar, #content").removeClass('sticky');
})

$("#loginClick").click(() => {
  $("#loginClick").addClass("active");
  $("#loginTab").addClass("active");

  $("#registerClick").removeClass("active");
  $("#registerTab").removeClass("active");
})

$("#registerClick").click(() => {
  $("#loginClick").removeClass("active");
  $("#loginTab").removeClass("active");

  $("#registerClick").addClass("active");
  $("#registerTab").addClass("active");
})

$("#img-name, #img-browse").click((e) => {
  e.preventDefault();
  $("#img").click();
})

$("#img").on('change', (e) => {
  $("#img-name").val(e.target.files[0].name);
})

$(".nav-form").click((e) => {
  $(".nav-form input").focus();
});

$(".nav-form input").click((e) => e.stopPropagation());

$("#nav-expander, body").click((e) => {
  e.stopPropagation();
  if ($("#nav-expand").hasClass("active") && !$(e.target).is("#nav-expand *, #nav-expand"))
    $("#nav-expand").removeClass('active');
  else
    if ($(e.target).is("#nav-expander *, #nav-expander"))
      $("#nav-expand").addClass('active');
});

$('.ui.dropdown').dropdown();