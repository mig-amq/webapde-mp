$(document).ready(() => {
    $('.post-body').each((index, object) => {
        $(object).children('.post-user').children('.details').stick_in_parent({offset_top: 70});
    });

    $("#top-tags").stick_in_parent({offset_top: 45});

    $("#uploadMeme").click(() => {
        $("#file").trigger('click');
    });

    $("#file").on('change', (e) => {
        if ($("#file").val() != null || $("#file").val() != "") {
            let fileName = e.target.files[0].name;

            if (fileName.length > 18)
                fileName = fileName.substr(0, 18) + "...";
                
            $("#memeDescription").css('display', 'flex');
            $("#uploadMeme").addClass('active');
            $("#fileName").text(fileName);
        }
    });

    $(".tools #switcher").click((e) => {
        e.preventDefault();

        if ($('#switcherType').val() === "login") {
            $("#rememberMe").css('display', 'none');
            $("#fullName").css('display', 'block');

            $("#switcher").text('I have an account');
            $('#switcherType').val('register');
            
            $(".tools input[type='submit']").val('Register');
            $("#login-register").attr('action', '/register');
        } else {
            $("#rememberMe").css('display', 'block');
            $("#fullName").css('display', 'none');

            $("#switcher").text('I don\'t have an account');
            $('#switcherType').val('login');

            $(".tools input[type='submit']").val('Log In');
            $("#login-register").attr('action', '/login');
        }
    });

    $("#fileUpload").submit((e) => {
        e.preventDefault();

        var data = new FormData();

        data.append('memeName', $("#fileUpload #memeName").val());
        data.append('memeTags', $("#fileUpload #memeTags").val());
        data.append('file', $("#fileUpload #file")[0].files[0]);

        $.ajax({
            url: '/upload',
            method: 'POST',
            data: data,
            processData: false,
            contentType: false,
            success: (response) => {
                $("#uploadMeme").removeClass('active');
                $("#memeDescription").css('display', 'none');
                $("#memeDescription").children('input').each((index, object) => {
                    $(object).val("");
                });
                
                $("#fileName").text("Upload");

                location.reload(true);
            }
        });
    });
});