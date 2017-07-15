// history에서 각 book의 설정 화면으로 넘어가는 애니메이션 구현
// 톱니를 클릭하면 특정 컴포넌트의 class를 토글해줌
// 토글하면 css를 통해서 transform 시켜줌
$('.go-setting').click(function () {
    $(event.target).parent().parent().parent().parent().parent().toggleClass('now-inside now-setting');
});
$('.go-inside').click(function () {
    $(event.target).parent().parent().parent().parent().parent().toggleClass('now-setting now-inside');
});

// 이 경우에는 안쪽 부분, 위와는 다르게 jQuery animate를 이용하여 조작
// Story의 갯수가 정해져있지 않아서 범용적인 코드를 사용하기 위해 이렇게 구현
// if 문 안에 든 계산식은 현제 위치를 계산해서 슬라이드를 제한
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

$('.btn').click(function () {
    // alert("test");
    $(this).find('.up-btn').trigger('click');
    $(this).find('.down-btn').trigger('click');
})

