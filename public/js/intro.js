$(function () {
    $("#typed1").typed({
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