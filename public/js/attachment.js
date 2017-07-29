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

// img box slide down 및 img 미리보기
$(".page-write .footer label[for='page-img']").click(function () {

    var upload = $('.page-write .add-img #page-img')[0];

    upload.onchange = function () {
        $('.page-write .add-box .add-img .upload-img-box').empty();

        if(upload.files.length != 0) {
            $('.page-write .add-box .add-img').slideDown(250, function () {

                for(var i = 0; i < upload.files.length; i++){
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        if($('.page-write .upload-img-box img').length == 0) {
                            $('.page-write .upload-img-box').append('' +
                                '<img class="upload-img" src=' + e.target.result + '>' +
                                ''
                            );
                        }else{
                            $('.page-write .upload-img-box').append('' +
                                '<div class="img-space"> </div>' +
                                '<img class="upload-img" src=' + e.target.result + '>' +
                                ''
                            );
                        }
                    };
                    reader.readAsDataURL(upload.files[i]);
                }
            });
        }else{
            if(upload.files.length == 0) {
                $('.page-write .add-box .add-img').slideUp();
            }
        }
    };

    if($('.add-box .add-img .upload-img-box').html === ''){
        $('.add-box .add-img').slideUp();
    }
});
// link box slidedown
$(".footer label[for='page-link']").click(function () {
    if($('.add-box .add-link').is(':hidden')) {
        $('.add-box .add-link').slideDown();
    }else{
        $('.add-box .add-link').slideUp();
    }
});