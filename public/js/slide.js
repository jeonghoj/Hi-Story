// history에서 각 book의 설정 화면으로 넘어가는 애니메이션 구현
$(document).on('click', '.go-setting', function () {
    $(event.target).parent().parent().parent().parent().parent().toggleClass('now-inside now-setting');
});
$(document).on('click', '.go-inside', function () {
    if($('.modi-title input').val() === "") {
        event.preventDefault();
        $(this).parent().parent().parent().find('.modi-title').fadeToggle('fast').fadeToggle('fast');
    }else {
        $(event.target).parent().parent().parent().parent().parent().toggleClass('now-setting now-inside');
    }
})
$(document).on('click', '.insert-btn .cls', function () {
    if($('.modi-title input').val() === "") {
        event.preventDefault();
        $(this).parent().parent().parent().find('.modi-title').fadeToggle('fast').fadeToggle('fast');
    }else {
        $(event.target).parent().parent().parent().toggleClass('now-setting now-inside');
    }
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
});

// 클릭 가능할 때만 진하게
$('.a-book').hover(
    function () {
    var slide = $(this).find('.book-stories .book-story-slide');
    var top = slide.position().top;
    var top_ = slide.parent().position().top;
    var bottom = slide.position().top + slide.outerHeight(true);
    var bottom_ = slide.parent().position().top + slide.parent().outerHeight(true);

    if(top < top_){
        $(this).find('.btn .up-btn img').css('opacity', '1');
    }
    if(bottom > bottom_){
        $(this).find('.btn .down-btn img').css('opacity', '1');
    }
}, function () {
    $(this).find('.btn .up-btn img').css('opacity', '.3');
    $(this).find('.btn .down-btn img').css('opacity', '.3');
});


// slide가 아니라 book에 관련된 기능들도 이곳에 넣기로 한다.
// book의 공개 및 비공개 설정
$(document).on('click', '.book-setting .modi-pub', function () {
    if($(this).find('input').is(':checked')){
        // make it unchecked
        $(this).find('label').empty().append('<input type="checkbox" style="display: none;">공개');
        $(this).css('background', 'rgba(240, 240, 240, 1)');
    } else{
        // make it checked
        $(this).find('label').empty().append('<input type="checkbox" style="display: none;" checked>비공개');
        $(this).css('background', 'rgba(200, 200, 200, 1)');
    }
});
// 기존 book의 setting 표시
$(document).on('click', '.go-setting', function () {
    if($('.book-setting .modi-pub').find('input').is(':checked')){
        // TODO: load시 비공개를 append 해준다.
        $(this).css('background', 'rgba(200, 200, 200, 1)');
    }
});

// 삭제시 story check
$(document).on('click', '.book-setting .delete', function () {
        if(!($(this).parent().parent().find('.story-title').length == 0)){
            $(this).find('label .typ').slideUp().delay(1200).slideDown();
            $(this).find('label .del-nav').slideDown().delay(1200).slideUp();
            event.preventDefault();
        }
});