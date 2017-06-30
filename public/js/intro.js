// Typed라는 플러그인을 사용하여 타자로 글을 치는 듯한 느낌을 준다.
$(function () {
    $("#typed1").typed({
        // ^300은 300ms 대기를 의미
        strings: ["HiStory^300"],
        typeSpeed: 80,
        callback: function () {
            $("#typed2").typed({
                strings: ["^150 Discover"],
                typeSpeed: 80,
                callback: function () {
                    $("#typed3").typed({
                        strings: ["YOU!^1000", "your Meaning!^500", "your Vision!^500", "your Ability!^500", "your Possibility!^500", "YOU!"],
                        typeSpeed: 80,
                        backSpeed: 40
                    })
                    $('#typed2 + .typed-cursor').css({
                        "visibility": "hidden"
                    })
                }
            });
            $('#typed1 + .typed-cursor').css({
                "visibility": "hidden"
            })
        }
    });
});

// sign up에서 pw 확인
$('.sign-up input[type="submit"]').click(function () {
    if($('.sign-up input[type="text"]').val() != ""
    && $('.sign-up input[type="password"]').val() != "") {
        if($('#make-user-password').val() != $('#check-user-password').val()) {
            event.preventDefault();
        }
    }
});