$(document).ready(function () {


    // Web Road 시 memo의 높이를 고려해서 출력
    $('.story-memo').each(function () {
        $(this).css({
            'height': $(this).prop('scrollHeight')
        });
    });


    // 기본 값 설정
    $('.story-no-infor').append('1');


    // 새 메모 추가
    $("#new-memo-btn").click(function () {
        var no = $(event.target).parent().parent().find('.story-no-infor').text();

        for (var i=0; i<$('.story').length-1; i++) {
            var no_ = $('.story:eq('+i+')').find('.story-no').text();
            if(no == no_) {
                $('.story:eq('+i+')').append("<div> INSERT THE MEMO </div>");
                break;
            }
        }
    });


    // memo 수정
    $(document).ready(function () {
        $('.edit').click(function () {
            if ($(this).next().next().is('[readonly]')) {
                $(this).css({
                    "opacity": "1"
                });
                $(this).next().next().removeAttr('readonly').css({
                    "opacity": ".5"
                // TODO: textarea의 마지막으로 cusor를 이동시키고 싶다.
                }).focus();
            } else {
                $(this).css({
                    "opacity": ".3"
                });
                $(this).next().next().attr('readonly', 'readonly').css({
                    "opacity": "1"
                });
                // TODO: box가 작아졌을 때 크기를 줄인다.
                $(this).next().next().css({
                    'height': $(this).next().next().prop('scrollHeight')
                });
            }
        });
    });


    // textarea에서 엔터 시 바로 저장
    $(document).on('keydown', '.story-memo', function () {
        if(event.keyCode == 13) {
            event.preventDefault();
            $(this).prev().prev().trigger('click');
        }
    });
});



