// img slide
$(document).on('click', '.to-right', function () {
    if (!($(event.target).parent().parent().find('.active').next().is('.to-right'))) {
        $(event.target).parent().parent().find('.active')
            .addClass('hidden').removeClass('active')
            .next().removeClass('hidden').addClass('active');
    }
});
$(document).on('click', '.to-left', function () {
    if (!($(event.target).parent().parent().find('.active').prev().is('.to-left'))) {
        $(event.target).parent().parent().find('.active')
            .addClass('hidden').removeClass('active')
            .prev().removeClass('hidden').addClass('active');
    }
});

// link name 넘겨주기
$(document).ready(function () {
    var target = $('#page-img');

    target.on('change', function () {
        var filename = $(this)[0].files[0].name;
        $(this).siblings('.upload-name').val(filename);
    });
});

// attachment의 slide down 구현
$(".footer label[for='page-img']").click(function () {
    $('.add-box .add-link').slideUp();
    $('.add-box .add-img').slideDown();
});
$(".footer label[for='page-link']").click(function () {
    $('.add-box .add-img').slideUp();
    $('.add-box .add-link').slideDown();
});
