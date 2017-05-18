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

$('.page').click(function () {
    x = event.pageX;
    y = event.pageY;
    $('#page-set').css({
        "visibility": "visible",
        "left": x,
        "top": y
    });
});
$(document).mouseup(function () {
    var page = $('.page'),
        set = $('#page-set');
    
    if (!set.is(event.target) && !page.is(event.target) && page.has(event.target).length === 0){
        set.css({
            "visibility": "hidden"
        })
    }
});
