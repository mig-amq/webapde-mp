var bar_loc = $("#navbar").offset().top + 5;

$("#loginModal").click(() => $("#login").modal('show'));
$("#shareModal").click(() => $("#share").modal('show'));
$(".ui.checkbox").checkbox();

$(window).on('scroll', (e) => {
  if ($(window).scrollTop() >= bar_loc)
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

  $("#showImage img").attr("src", URL.createObjectURL(e.target.files[0]));
  $("#showImage i").addClass("hidden");
})

$("#img-name-edit, #img-browse-edit").click((e) => {
  e.preventDefault();
  $("#img-edit").click();
})

$("#img-edit").on('change', (e) => {
  $("#img-name-edit").val(e.target.files[0].name);
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

$('.ui.dropdown:not(#viewers)').dropdown({
  allowAdditions: true,
  keys: {
    delimiter: 32,
  }
});

$('.ui.dropdown#viewers').dropdown({
  keys: {
    delimiter: 32,
  }
})

$('.ui.dropdown.search').on('keypress', (e) => {
  if (e.keyCode === 13)
    e.preventDefault();
});

$("#share #private").on('change', (e) => {
  if ($("#share").form("get value", "private")) {
    $("#share #viewers").parents(".field").removeClass('hidden');
  } else {
    $("#share #viewers").dropdown("clear");
    $("#share #viewers").parents(".field").addClass('hidden');
  }
})

$(".ui.cancel.button").on('click', (e) => {
  $($(".ui.cancel.button").parents(".modal")[0]).modal("hide");
})