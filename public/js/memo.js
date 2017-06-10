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