// Close up 되어 화면에 나타나는 동작
$('.closeup .new-story #new-story-close').click(function () {
    $('.closeup').css({
        "visibility": "hidden"
    });
    $('.closeup .new-story').css({
        "visibility": "hidden"
    });
});

$('.right .aside .aside-btn #new').click(function () {
    $('.closeup').css({
        "visibility": "visible"
    });
    $('.closeup .new-story').css({
        "visibility": "visible"
    });
    $('body').css({
        "overflow": "hidden" 
    });
});