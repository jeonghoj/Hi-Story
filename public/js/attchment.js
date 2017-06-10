$('#to-right').click(function () {
    $(event.target).parent().parent().fadeToggle(function () {
        if (!($(event.target).parent().parent().children('.active').next().is('#to-right'))) {
            $(event.target).parent().parent().children('.active')
                .addClass('hidden').removeClass('active')
                .next().removeClass('hidden').addClass('active');
        }
    }).fadeToggle();
})
$('#to-right').ready(function () {
    if ($(event.target).parent().parent().is(':hidden')) alert("!!!");
});
$('#to-left').click(function () {
    if (!($(event.target).parent().parent().children('.active').prev().is('#to-left'))) {
        $(event.target).parent().parent().children('.active')
            .addClass('hidden').removeClass('active')
            .prev().removeClass('hidden').addClass('active');
    }
})