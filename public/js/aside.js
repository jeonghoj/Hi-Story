// scroll하는 aside 구현
$("document").ready(function () {
    var left = $('.left');
    var right = $('.right');

    $(window).scroll(function () {
        var leftBot = left.offset().top+left.height();
        var rightBot = right.offset().top+right.height();

        if (leftBot >= $(window).scrollTop()+600) {
            right.animate({
                top: $(window).scrollTop() + "px"
            }, {
                queue: false,
                duration: 350
            })
        }
    });

    // 페이지 로드시 slideUp 되어있다.
    $('.right .aside .infor').slideUp();
});

// RIGHT ASIDE의 SLIDE UP AND DOWN 구현
// TODO: action에서 story의 공백을 클릭해도 right가 바뀌도록 변경
$( '.sel-story, .story').click(function(e) {
    alert($(this).index());
    if(!$(event.target).is('.edit, .f-title')) {
        if (!$('.right .aside .infor').is(':animated')) $('.right .aside .infor').slideUp();
        $('.right .aside .infor').slideDown('slow');
    };
});
// Timeline에서는 story를 클릭하면 보여줌
$( '.page' ).click(function() {
    if(!$('.right .aside .infor').is(':animated')) $('.right .aside .infor').slideUp();
    $('.right .aside .infor').slideDown('slow');
});
