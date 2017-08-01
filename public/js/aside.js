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
    $(document).ready(function () {
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
    })
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
                // page의 첫번째 자식이 book-title이라는 클래스를 가지고있다면
                if(temp.children(":nth-child(1)").hasClass("book-title")){
                    var bookname=temp.children(":nth-child(1)").html();
                    var storyname=temp.children(":nth-child(2)").html();
                    var storydate=temp.children(":nth-child(3)").html();
                    $('.infor > .book-name').empty().html(bookname);
                    $('.infor > .story-name').empty().html(storyname);
                    $('.infor > .date').empty().html(storydate);
                }
                $('.story-setting').empty();
                $('.story-setting').append('<button id="change-story-infor" class="f-basic">Edit information</button>');
                if(!$('.left-top .view-mode .timeline a').is('.active')){
                    if( (temp.is($('.page:last')) && (!($('.last-page').length))) || (temp.is($('.last-page'))))
                    {
                        $('.story-setting').append('<button id="page-edit" class="f-basic">Edit this page</button>');
                        $('.story-setting').append('<button id="cancel-edit" class="f-basic" style="display: none;">Cancel editing</button>');

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

    // var storyname_ =  $('.right .aside .infor').find('.story-name').html();
    // $('.story-delete .del-name').empty().html(storyname_);

    // page의 정보 변경
    $(document).on('click', '#change-story-infor', function () {
        $('#chng-book').empty();
        $.ajax({
            url:'/list_book',
            type:'post',
            success:function (data) {
                for(var i =0; i<data.length; i++){
                    var temp = data[i].Book_Title;

                    // temp 길이 알아내기
                    $('body').append("<sapn>" + temp + "</sapn>");
                    var width = $('body sapn').width();
                    var len = $('body sapn').text().length;
                    $('body sapn').remove();

                    // temp 절단
                    while(true) {
                        if(width > 240){
                            temp = temp.substr(0, len-1);
                            // 값 새로고침
                            $('body').append("<sapn>" + temp + "</sapn>");
                            width = $('body sapn').width();
                            len = $('body sapn').text().length;
                            $('body sapn').remove();
                        }else {
                            break;
                        }
                    }

                    $('#chng-book').append("<option value="+ data[i].Book_No +">"+temp+"</option>");
                }
            }
        });
        // option 길이 조절

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

    // 공개 비공개
    $(document).on('click', '#insert-changing label', function () {
        if($(this).find('input').is(':checked')){
            // make it unchecked
            $(this).empty().append('<input name="story-public" type="checkbox" style="display: none;">공개');
            $(this).css('background', 'rgba(240, 240, 240, 1)');
        } else{
            // make it checked
            $(this).empty().append('<input name="story-public" type="checkbox" style="display: none;" checked>비공개');
            $(this).css('background', 'rgba(200, 200, 200, 1)');
        }
    });

});



