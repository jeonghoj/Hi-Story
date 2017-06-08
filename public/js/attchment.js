$('#to-right').click(function () {
    if(!($(event.target).parent().parent().children('.active').next().is('#to-right'))) {
        $(event.target).parent().parent().children('.active').addClass('hidden').removeClass('active')
            .next().removeClass('hidden').addClass('active');
    }
})
$('#to-left').click(function () {
    if(!($(event.target).parent().parent().children('.active').prev().is('#to-left'))) {
        $(event.target).parent().parent().children('.active').addClass('hidden').removeClass('active')
            .prev().removeClass('hidden').addClass('active');
    }
})