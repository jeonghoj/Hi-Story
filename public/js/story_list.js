/**
 * Created by Jeongho on 2017-05-28.
 */
var story ="<div class='story'>"+
    "<div class='story-header'>" +
    "<div class='story-no' style='display:none'>${Story_No}</div>"+
    "<div class='story-title'><a href='/story.html' class='f-title'>${Story_Title}</a></div>"+
    "<a href='#' class='onoff'><img src='/img/icon/ic_settings_black_24px.svg' border='0'></a>"+
    "<div class='webui-popover-content'>"+
    "<div class='story-set-popover'>"+
    "<button>NewMemo</button>"+
    "<button>Done</button>"+
    "<button>Delete</button>"+
    "</div>"+
    "</div>"+
    "</div>"+
    "{{each(Story_Memo_No,Story_Memo_Text) Story_Memo}}"+
    "<div class='memo'>"+
    "<a href='#' class='edit f-sub'>Edit</a>"+
    "<div class='story-memo-no' style='display: none'>${Story_Memo_No}</div>"+
    "<div class='story-memo'>${Story_Memo_Text}</div>"+
    "</div>"+
    "{{/each}}" +
    "</div>";
//        var story_memo="<div class='memo'>"+
//            "<a href='#' class='edit f-sub'>Edit</a>"+
//                "<div class='story-memo-no' style='display: none'>${Story_Memo_No}</div>"+
//            "<div class='story-memo'>${Story_Memo_Text}</div>"+
//            "</div>";

$.template("story_list_template",story);
//        $.template("story_memo_template",story_memo);

$(document).ready(function () {
    $.ajax({
        url:'http://127.0.0.1:3000/main/list_story',
        type:'post',
        headers: {"Authorization": 'JWT '+localStorage.getItem('token')},
        success:function(data){
            $.tmpl("story_list_template", data).appendTo("#story_list");
        },
        statusCode: {
            401: function() {
                alert( "로그인해주세요!" );
                window.location.href="http://127.0.0.1:3000/main"
            }}
    })
});