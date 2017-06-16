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
});

// RIGHT ASIDE의 SLIDE UP AND DOWN 구현
//TODO 스토리 ID값을 추가해서 ENter눌렀을때 스토리 아이디 값으로 들어갈수있게
$( '.sel-story' ).click(function() {
    $('.book-name').empty();
    $('.story-name').empty();
    $('.date').empty();

    if(!$('.right .aside .infor').is(':animated')) $('.right .aside .infor').slideUp();
    $('.right .aside .infor').slideDown('slow');
    var index = $('.sel-story').index(this);
    //변수를 집어넣을땐 + + 사이에 ^^7
    var bookname = $('.book-no:eq('+index+')').text();
    var storyname = $('.story-title:eq('+index+')').text();
    var storydate = $('.story-start-date:eq('+index+')').text();
    $('.book-name').append(bookname);
    $('.story-name').append(storyname);
    $('.date').append(storydate);



});
// Timeline에서는 story를 클릭하면 보여줌
$( '.page' ).click(function() {
    if(!$('.right .aside .infor').is(':animated')) $('.right .aside .infor').slideUp();
    $('.right .aside .infor').slideDown('slow');
});