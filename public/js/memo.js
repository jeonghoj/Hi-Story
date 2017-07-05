// Web Road 시 memo의 높이를 고려해서 출력
$(document).ready(function () {
    $('.story-memo').each(function () {
        $(this).css({
            'height': $(this).prop('scrollHeight')
        });
    });
});

$('.edit').click(function () {
    if ($(this).next().is('[readonly]')) {
//        alert("!");
        $(this).css({
            "opacity": "1"
        });
        $(this).next().removeAttr('readonly').css({
            "opacity": ".5"
        });
    } else {
        $(this).css({
            "opacity": ".3"
        });
        $(this).next().attr('readonly', 'readonly').css({
            "opacity": "1"
        });
        // box가 작아졌을 때 크기를 줄인다.
        $(this).next().css({
            'height': $(this).next().prop('scrollHeight')
        });
    }
});

// 새 메모 추가
$("#new-memo-btn").click(function () {
    var no = $(event.target).parent().parent().find('.story-no-infor').text();

    for (var i=0; i<$('.story').length-1; i++) {
        var j = i+1;
        var no_ = $('.story:eq('+j+')').find('.story-no').text();
        if(no == no_) {
            $('.story:eq('+j+')').append("<div> INSERT THE MEMO </div>");
            break;
        }
    }
});