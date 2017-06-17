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
        $(this).next().css({
            'height': $(this).next().prop('scrollHeight')
        });
    }
});