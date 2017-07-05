// TODO scroll하는 aside 구현
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
//TODO 슬라이드 업 애니메이션 후  -> 문자를 추가 -> 슬라이드 다운 애니메이션

$('.story').click(function () {

    var index = $(this).index();

    if(!$(event.target).is('.edit, .f-title')) {
        if (!$('.right .aside .infor').is(':animated')) {
            $('.right .aside .infor').slideUp(300, function () {
                $('.story-no-infor').empty();
                $('.book-name').empty();
                $('.story-name').empty();
                $('.date').empty();
                $('.del-name').empty();

                //변수를 집어넣을땐 + + 사이에 ^^7
                var storyno = $('.story-no:eq(' + index + ')').text();
                var bookname = $('.book-no:eq(' + index + ')').text();
                var storyname = $('.story-title:eq(' + index + ')').text();
                var storydate = $('.story-start-date:eq(' + index + ')').text();
                $('#story-enter').children('a').attr("href", "/story/" + storyno);
                $('.story-no-infor').append(storyno);
                $('.book-name').append(bookname);
                $('.story-name').append(storyname);
                $('.del-name').append(storyname + "을(를) 삭제합니다.");
                $('.date').append(storydate);
            });
        }

        $('.right .aside .infor').slideDown('slow');
    }
});

// TODO Timeline에서는 story를 클릭하면 보여줌
$( '.page, .last-page' ).click(function(event) {
    if(!$('.right .aside .infor').is(':animated')) $('.right .aside .infor').slideUp();
    $('.story-setting').empty();
    $('.story-setting').append('<button id="change-story-infor" class="f-basic">Edit history information</button>');
    if($(this).is($('.page:last')) && (!($('.last-page').length)))
    {
        $('.story-setting').append('<button id="page-edit" class="f-basic">Edit last page</button>');
    }
    $('.story-setting').append('<hr class="hr-infor">');
    $('.story-setting').append('<button id="done-btn" class="f-basic">Done</button>');
    $('.story-setting').append('<button id="delete-btn" class="f-basic">Delete</button>');

    var index = $(this).index();
    var booktitle =$('.book-title:eq('+ index +')');


    $('.right .aside .infor').slideDown('slow');
});