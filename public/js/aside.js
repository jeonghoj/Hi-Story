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
$(document).ready(function () {

    $('.story').click(function () {
        var index = $(this).index();

        if(!$(event.target).is('.edit, .f-title') && !(event.keyCode == 13)) {
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
                    $('.del-name').append(storyname);
                    $('.date').append(storydate);
                });
            }
            $('.right .aside .infor').slideDown('slow');
        }
    });


    $( '.page, .last-page' ).click(function(event) {
        var temp = $(this);

        if(!$(event.target).is('img, button')){
            if(!$('.right .aside .infor').is(':animated')) $('.right .aside .infor').slideUp(300, function () {
                $('.story-setting').empty();
                $('.story-setting').append('<button id="change-story-infor" class="f-basic">Edit history information</button>');
                if(!$('.left-top .view-mode .timeline a').is('.active')){
                    if( (temp.is($('.page:last')) && (!($('.last-page').length))) || (temp.is($('.last-page'))))
                    {
                        $('.story-setting').append('<button id="page-edit" class="f-basic">Edit this page</button>');
                    }
                }
                $('.story-setting').append('<hr class="hr-infor">');
                $('.story-setting').append('<button id="done-btn" class="f-basic">Done this story</button>');
                $('.story-setting').append('<button id="delete-btn" class="f-basic">Delete this story</button>');

                var index = temp.index();
                var booktitle =$('.book-title:eq('+ index +')');
            });

            $('.right .aside .infor').slideDown('slow');
        }
    });

    // page의 정보 변경
    $(document).on('click', '#change-story-infor', function () {
        // console.log();
        $(this).css({
            'opacity': '.9'
        });
        $(this).parent().parent().find('#insert-changing').slideDown(300, function () {

        });
    });
    $(document).on('click', '#insert-changing .insert-btn input:eq(0)', function () {
        console.log('???');
    });
    $(document).on('click', '#insert-changing .insert-btn input:eq(1)', function () {
        // console.log();
        $(this).parent().parent().slideUp();
        $(this).parent().parent().parent().find('#change-story-infor').css({
            'opacity': '.3',
            'transition': 'all .35s ease'
        });
    });

});



