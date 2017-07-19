$(document).on('click', '.to-right', function () {
    if (!($(event.target).parent().parent().find('.active').next().is('.to-right'))) {
        $(event.target).parent().parent().find('.active')
            .addClass('hidden').removeClass('active')
            .next().removeClass('hidden').addClass('active');
    }
});
$('.to-left').click(function () {
    if (!($(event.target).parent().parent().find('.active').prev().is('.to-left'))) {
        $(event.target).parent().parent().find('.active')
            .addClass('hidden').removeClass('active')
            .prev().removeClass('hidden').addClass('active');
    }
});
