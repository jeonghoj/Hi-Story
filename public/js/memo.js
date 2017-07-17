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

        for (var i=0; i<$('.story').length; i++) {
            var no_ = $('.story:eq('+i+')').find('.story-no').text();
            if(no == no_) {
                $('.story:eq('+i+')')
                    .append(
                        "<div class='memo'>" +
                        "<a class='edit f-sub'>Edit</a>" +
                            "<div class='story-memo-no' style='display: none'> " +
                            "</div> <textarea class='story-memo' rows='1' cols='72' style='height: 28px;' placeholder='빈 MEMO는 삭제 됩니다.'></textarea> </div>" )
                    .find('.story-memo').focus();
                break;
            }
        }
    });

    // memo 수정
    $(document).ready(function () {
        $(document).on('click', '.edit', function () {
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


    // textarea에서 엔터 시 바로 저장 및 실시간 높이 조정
    $(document).on('keydown', '.story-memo', function () {
        if(event.keyCode == 13) {
            event.preventDefault();
            $(this).prev().prev().trigger('click');
            if($(this).val() == "") {
                $(this).parent().remove();
            }
        }
        $(this).css({
           'height': $(this).prop('scrollHeight')
        });
    });


});



