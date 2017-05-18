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