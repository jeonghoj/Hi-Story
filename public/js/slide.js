$('.go-setting').click(function () {
    $(event.target).parent().parent().parent().parent().parent().toggleClass('now-inside now-setting');
});
$('.go-inside').click(function () {
    $(event.target).parent().parent().parent().parent().parent().toggleClass('now-setting now-inside');
});

$('.up-btn').click(function () {
    if($(event.target).parent().parent().parent().find('.book-story-slide').position().top < -209) {
        $(event.target).parent().parent().parent().find('.book-story-slide').animate({ 
            top: '+=280px'
        }, 300);
    }
});
$('.down-btn').click(function () {
    if($(event.target).parent().parent().parent().find('.book-story-slide').position().top
    > 69 - (parseInt($(event.target).parent().parent().parent().find('.story-title').length / 7) - 1) * 280) {
        $(event.target).parent().parent().parent().find('.book-story-slide').animate({
            top: '-=280px'
        }, 300);
    }
});
