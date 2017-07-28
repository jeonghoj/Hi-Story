// New story 열기
$(document).on('click', '.right .aside .aside-btn #new-story-btn', function () {
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
    $(document).on('click', '.closeup .new-story #new-story-close', function () {
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
$(document).on('click', '#delete-btn', function () {
    $('#del-story-no').empty();
    var delstoryno=$('.story-no-infor').html();
    $('#del-story-no').html(delstoryno);
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
$(document).on('click', '.closeup .story-delete #story-delete-close', function () {
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
$(document).on('click', '#done-btn', function () {
    $('.closeup').css({
        "visibility": "visible"
    });
    $('.closeup .story-done').css({
        "visibility": "visible"
    });
});

// Done 닫기
$(document).on('click', '.closeup .story-done #story-done-close', function () {
    $('.closeup').css({
        "visibility": "hidden"
    });
    $('.closeup .story-done').css({
        "visibility": "hidden"
    });
//    $('body').css({
//        "overflow": "scroll"
//    });
});

// TODO: 모든 창 닫기에서 esc나 다른 부분을 클릭해도 나가지도록 한다.
