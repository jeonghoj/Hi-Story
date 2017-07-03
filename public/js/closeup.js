// New story 열기
$('.right .aside .aside-btn #new-story-btn').click(function () {
    $('.closeup').css({
        "visibility": "visible"
    });
    $('.closeup .new-story').css({
        "visibility": "visible"
    });
//    $('body').css({
//        "overflow": "hidden" 
//    });
});

// New story 닫기
$('.closeup .new-story #new-story-close').click(function () {
    $('.closeup').css({
        "visibility": "hidden"
    });
    $('.closeup .new-story').css({
        "visibility": "hidden"
    });
//    $('body').css({
//        "overflow": "scroll"
//    });
});

// Story del 열기
$('#delete-btn').click(function () {
    $('.closeup').css({
        "visibility": "visible"
    });
    $('.closeup .story-delete').css({
        "visibility": "visible"
    });
//    $('body').css({
//        "overflow": "hidden" 
//    });
    WebuiPopovers.hide('.left .story-list .story .story-header .onoff');
});

// Story del 닫기
$('.closeup .story-delete #story-delete-close').click(function () {
    $('.closeup').css({
        "visibility": "hidden"
    });
    $('.closeup .story-delete').css({
        "visibility": "hidden"
    });
//    $('body').css({
//        "overflow": "scroll" 
//    });
});

// Done 열기
$('.right .aside .aside-btn #new-story-btn').click(function () {
    $('.closeup').css({
        "visibility": "visible"
    });
    $('.closeup .new-story').css({
        "visibility": "visible"
    });
});
// Done 닫기

// TODO: 모든 창 닫기에서 esc나 다른 부분을 클릭해도 나가지도록 한다.
