// 플러그인을 통한 popover 구현
$(function () {
    $('.left .left-top .arg').webuiPopover({
        html: true,
        placement: 'bottom',
        width: 120,
        arrow: false
    });
});

$(function () {
    $('.left .story-list .story .story-header .onoff').webuiPopover({
        html: true,
        placement: 'bottom',
        width: 120
    });
});

// 클릭한 부분에 정해둔 box가 popover
$('.page').click(function () {
    x = event.pageX;
    y = event.pageY;
    $('#page-set').css({
        "visibility": "visible",
        "left": x,
        "top": y
    });
});
// 다른 부분을 클릭하면 popover된 box가 사라짐
$(document).mouseup(function () {
    var page = $('.page'),
        set = $('#page-set');
    
    if (!set.is(event.target) && !page.is(event.target) && page.has(event.target).length === 0){
        set.css({
            "visibility": "hidden"
        })
    }
});
