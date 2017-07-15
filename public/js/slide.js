// history에서 각 book의 설정 화면으로 넘어가는 애니메이션 구현
$('.go-setting').click(function () {
    $(event.target).parent().parent().parent().parent().parent().toggleClass('now-inside now-setting');
});
$('.go-inside').click(function () {
    $(event.target).parent().parent().parent().parent().parent().toggleClass('now-setting now-inside');
});

// History의 slide 구현
$('.up-btn').click(function () {
    var slide = $(event.target).parent().parent().parent().find('.book-story-slide');
    var top = slide.position().top;
    var top_ = slide.parent().position().top;
    if (top < top_) {
        if(!(slide.is(':animated'))) {
            slide.animate({
                top: '+=280px'
            }, 300);
        }
    } else {
        event.preventDefault();
    }
});
$('.down-btn').click(function () {
    var slide = $(event.target).parent().parent().parent().find('.book-story-slide');
    var bottom = slide.position().top + slide.outerHeight(true);
    var bottom_ = slide.parent().position().top + slide.parent().outerHeight(true);
    if(bottom > bottom_) {
        if(!(slide.is(':animated'))) {
            slide.animate({
                top: '-=280px'
            }, 300);
        }
    } else {
        event.preventDefault();
    }

});

// click 범위 증가
$('.btn').click(function () {
    // alert("test");
    $(this).find('.up-btn').trigger('click');
    $(this).find('.down-btn').trigger('click');
})

