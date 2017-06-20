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
<<<<<<< HEAD
// TODO: action에서 story의 공백을 클릭해도 right가 바뀌도록 변경
$( '.sel-story, .story').click(function(e) {
    alert($(this).index());
    if(!$(event.target).is('.edit, .f-title')) {
        if (!$('.right .aside .infor').is(':animated')) $('.right .aside .infor').slideUp();
        $('.right .aside .infor').slideDown('slow');
    };
=======
//TODO 스토리 ID값을 추가해서 ENter눌렀을때 스토리 아이디 값으로 들어갈수있게
$( '.sel-story,.story' ).click(function(e) {
    if(!$(event.target).is('.edit, .f-title')) {
        $('.book-name').empty();
        $('.story-name').empty();
        $('.date').empty();
        if (!$('.right .aside .infor').is(':animated')) $('.right .aside .infor').slideUp();
        $('.right .aside .infor').slideDown('slow');
        var index = $(this).index();
        //변수를 집어넣을땐 + + 사이에 ^^7
        var bookname = $('.book-no:eq(' + index + ')').text();
        var storyname = $('.story-title:eq(' + index + ')').text();
        var storydate = $('.story-start-date:eq(' + index + ')').text();
        $('.book-name').append(bookname);
        $('.story-name').append(storyname);
        $('.date').append(storydate);
    }
>>>>>>> 10ccf5a143763a22cfda253693ffb550d273d5d5
});
// Timeline에서는 story를 클릭하면 보여줌
$( '.page' ).click(function() {
    if(!$('.right .aside .infor').is(':animated')) $('.right .aside .infor').slideUp();
    $('.right .aside .infor').slideDown('slow');
});