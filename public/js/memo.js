$(document).ready(function () {

    // Web Road 시 memo의 높이를 고려해서 출력
    $('.story-memo').each(function () {
        if( $(this).prop('scrollHeight') < 60) {
            $(this).height( 32 );
        }else {
            $(this).height($(this).prop('scrollHeight') - 4);
        }
    });

    // // 기본 값 설정
    // $('.story-no-infor').append('1');


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
                        "<div class='story-memo-no' style='display: none'></div>" +
                        "<textarea class='story-memo' rows='1' cols='72' style='height: 28px;' placeholder='빈 MEMO는 삭제 됩니다.'></textarea>" +
                        "</div>" )
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
                $(this).next().next().height( $(this).next().next().prop('scrollHeight') - 4);
                var Story_No=$(this).parent().parent().find('.story-no').html();
                var Story_Memo_Text=$(this).next().next().val();
                var Story_Memo_No=$(this).next();
                var new_memo={
                    Story_No:Story_No,
                    Story_Memo_Text:Story_Memo_Text
                };
                var update_memo={
                    Story_No:Story_No,
                    Story_Memo_No:Story_Memo_No.html(),
                    Story_Memo_Text:Story_Memo_Text
                };

                if(Story_Memo_Text === "") {
                    $(this).parent().remove();
                    if(Story_Memo_No.html()){
                        var delete_memo={
                            Story_No:Story_No,
                            Story_Memo_No:Story_Memo_No.html()
                        };
                        $.ajax({
                            url:'/delete_story_memo',
                            type:'post',
                            data:delete_memo,
                            success:function (data) {
                                if(!data) alert('오류!');
                            }
                        })
                    }
                }else{
                    if(Story_Memo_No.html()){
                        $.ajax({
                            url:'/update_story_memo',
                            type:'post',
                            data:update_memo,
                            success:function (data) {
                                if(!data) alert('오류!');
                            }
                        })
                    }else{
                        $.ajax({
                            url:'/insert_story_memo',
                            type:'post',
                            data:new_memo,
                            success:function (data) {
                                if(!data) alert('오류!');
                                Story_Memo_No.html(data);
                            }
                        });
                    }
                }
            }
        });
    });

    // MEMO에서 short cut
    $(document).on('keydown', '.story-memo', function (e) {
        // enter: 메모 저장
        if(event.keyCode === 13) {
            event.preventDefault();
            $(this).prev().prev().trigger('click');
        }
        // ctrl+a: 전체 선택
        if (e.keyCode == 65 && e.ctrlKey) {
            e.target.select();
        }
    });


});



