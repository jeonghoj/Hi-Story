function setCookie(cookie_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var cookie_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = cookie_name + "=" + cookie_value;
}

function getCookie(cookie_name) {
    var search = cookie_name+"=";
    var cookies = document.cookie.split(";");
    for (var i = 0; i<cookies.length; i++) {
        var x = cookies[i];
        while(x.charAt(0) == ' ') {
            x = x.substring(1, x.length);
        }
        if(x.indexOf(search) == 0) {
            return x.substring(search.length, x.length);
        }
    }
    return null;
}

$(document).ready(function () {
    var cookie_check = getCookie('argNum');
    var story_ary = [];
    var i;

    // story의 내용을 담은 객체 배열 초기화
    for (i = 0; i < $('.story').length; i++) {
        story_ary[i] = {
            html: $('.story:eq(' + i + ')').html(),
            name: $('.story:eq(' + i + ') .story-header .story-title a').html(),
            date: $('.story:eq(' + i + ') .story-header .story-start-date').html(),
            edit: $('.story:eq(' + i + ') ').html()
        }
    }

    // alert(getCookie('argNum'));
    // 저장된 cookie가 없는 경우에 기본적으로 이름 순 정렬
    if ((cookie_check == null)) {
        // setCookie('argNum', 0);
        story_ary.sort(function (a, b) {
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });
        for (i = 0; i < $('.story').length; i++) {
            $('.story:eq(' + i + ')').empty();
            $('.story:eq(' + i + ')').append(story_ary[i].html);
        }
    }
    // 저장된 cookie가 있는 경우에는 저장된 변수에 따라 다르게 구현
    else {
        switch (cookie_check) {
            case '0':
                story_ary.sort(function (a, b) {
                    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
                });
                break;
            case '1':
                story_ary.sort(function (a, b) {
                    return a.name > b.name ? -1 : a.name < b.name ? 1 : 0;
                });
                console.log(story_ary);
                break;
            case '2':
                story_ary.sort(function (a, b) {
                    return a.date < b.date ? -1 : a.name > b.name ? 1 : 0;
                });
                break;
            case '3':
                story_ary.sort(function (a, b) {
                    return a.date > b.date ? -1 : a.name < b.name ? 1 : 0;
                });
                break;
        }
        for (i = 0; i < $('.story').length; i++) {
            $('.story:eq(' + i + ')').empty();
            $('.story:eq(' + i + ')').append(story_ary[i].html);
        }
        // console.log(cookie_check);
    }
});

// btn을 클릭하면 어떤 버튼이었는지를 cookie로 저장하고 reload
$('.arg-popover button').click(function () {
    setCookie('argNum', $(event.target).index(), 10000);
    location.reload();
});

