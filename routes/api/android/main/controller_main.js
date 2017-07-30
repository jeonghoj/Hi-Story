/**
 * Created by Jeongho on 2017-05-13.
 */
const cwd = process.cwd();
const db=require(cwd+'/config/db');
const fs=require('fs');
const xss=require('xss');
exports.action= (req,res)=> {
    let story = null;
    //FIXME : promise로 이중쿼리 구현
    db.query('select story.Book_No,Book_Title,Book_Public,Story_No,Story_Title,Story_DateStart,Story_DateEnd,' +
        'Story_Citation,Story_Follow,Story_View,Story_Priority ' +
        'from story,book ' +
        'where story.Member_No=? and story.Book_No=book.Book_No ' +
        'order by Story_No asc',[req.user.Member_No], (error, results) => {
        if (error) console.log(error);
        // 데이터가 없다면
        if(!results[0]){
            res.json([{message:'NoData'}]);
        }else{
            story = results;
            for(let i=0;i<story.length;i++) {
                story[i].Story_Memo = [];
            }
            db.query(
                'select story_memo.Story_Memo_No,story_memo.Story_No,story_memo.Story_Memo_Text ' +
                'from story,story_memo ' +
                'where story.Story_No=story_memo.Story_No and story.Member_No=?',[req.user.Member_No], (error, results) => {
                if(error) console.log(error);
                for(let i=0; i<story.length;i++) {
                    for (let j = 0; j < results.length; j++) {
                        if (story[i].Story_No === results[j].Story_No) {
                            story[i].Story_Memo.push(results[j]);
                        }
                    }
                    if(i===story.length-1){
                        res.json(story);
                    }
                }

            });
        }
    });
};
exports.history=(req,res)=>{
    let historydata=null;
    db.query('select book.Book_No,Book_Title,Book_Public from book where Member_No=?',
        [req.user.Member_No],(error,results)=>{
        if(error) console.log(error);
        if(!results[0]){
            res.json({message:'NoData'});
        }else{
            historydata=results;
            for(let i=0;i<historydata.length;i++){
                db.query('select Story_No,Story_Title,Story_Owner,Story_DateStart,Story_DateEnd ' +
                    'from story where Book_No=?',
                    [historydata[i].Book_No],(error,results)=>{
                    if(error) console.log(error);
                    historydata[i].Story=results;
                    if(i===historydata.length-1){
                        res.json(historydata);
                    }
                });
            }
        }


    });
};

exports.member_profile=(req,res)=>{
    let Member_Name,Member_Profile,Member_Profileimg;
    db.query('select Member_Name,Member_Profile from member where Member_No=?',
        [req.user.Member_No],(error,results)=>{
        Member_Name=results[0].Member_Name;
        Member_Profile=results[0].Member_Profile;
        db.query('select Image_Path from image where No=? and Image_Fieldname=?',
            [req.user.Member_No,'Member_Profileimg'],(error,results)=>{
            Member_Profileimg='http://history-dcy.com/imageload?imagepath='+results[0].Image_Path;
            res.json({Member_Name:Member_Name,Member_Profile:Member_Profile,Member_Profileimg:Member_Profileimg});
        })
    });

};
exports.update_member_profile=(req,res)=>{
    // 변수
    let Member_Name,Member_Profile_text,Member_Profileimg_State,profileimgdata;
    // 안드로이드 2바이트 자르기
    if(req.body.Member_Name){
        Member_Name=((req.body.Member_Name).slice(2));
    }
    if(req.body.Member_Profile){
        Member_Profile_text=((req.body.Member_Profile).slice(2));
    }
    Member_Profileimg_State=((req.body.Member_Profileimg_State).slice(2));
    // 이미지 데이터가 있을때
    if(req.file){
        profileimgdata={
            Image_Fieldname:req.file.fieldname,
            Image_Path:req.file.path,
            Image_Originalname:req.file.originalname
        };
    }
    const Member_Profile={
        Member_Name:Member_Name,
        Member_Profile:Member_Profile_text
    };
    const defaultimg={
        Image_Fieldname:'Member_Profileimg',
        Image_Path:'public/img/logo/logo.png',
        Image_Originalname:'defaultimg',
    };
    switch (Member_Profileimg_State) {
        //사진이 변하지 않은 상태
        case '0' :{
            db.query('update member set ? where Member_No=?',[Member_Profile,req.user.Member_No],(error,results)=>{
                if(error) console.log(error);
                res.json({message:'success'});
            });
            break;
        }
        // 사진이 변한 상태
        case '1' :{
            db.query('update member set ? where Member_No=?',[Member_Profile,req.user.Member_No],(error,results)=> {
                if (error) console.log(error);
                db.query('update image set ? where No=? and Image_Fieldname=?',
                    [profileimgdata, req.user.Member_No, 'Member_Profileimg'], (error, results) => {
                        if (error) console.log(error);
                        if (results.affectedRows === 0) {
                            res.json({message: '잘못된 접근입니다.'});
                        } else if (results.changedRows === 0) {
                            res.json({message: '같은 내용입니다'});
                        } else {
                            res.json({message: 'success'});
                        }
                    });
            });
            break;
        }
        // 기본 이미지로 변경
        case '2' :{
            db.query('update member set ? where Member_No=?',[Member_Profile,req.user.Member_No],(error,results)=> {
                if (error) console.log(error);
                db.query('update image set ? where No=? and Image_Fieldname=?',
                    [defaultimg, req.user.Member_No, 'Member_Profileimg'], (error, results) => {
                        if (error) console.log(error);
                        if (results.affectedRows === 0) {
                            res.json({message: '잘못된 접근입니다.'});
                        } else if (results.changedRows === 0) {
                            res.json({message: '같은 내용입니다'});
                        } else {
                            res.json({message: 'success'});
                        }
                    });
            });
            break;
        }
        default:{
            res.json({message:'state잘못보냄'});
            break;
        }
    }
};

exports.insert_book=(req,res)=>{
    const new_book={
        Member_No:req.user.Member_No,
        Book_Title:req.body.Book_Title,
        Book_Author:req.user.Member_Name,
        Book_Public : req.body.Book_Public ? 1 : 0,
    };
    db.query('insert into book set ? ',[new_book],(error,results)=>{
        if(error) console.log(error);
        db.query('select Book_No,Book_Title,Book_Date,Book_Public from book where Book_No=?',
            [results.insertId],(error,results)=>{
            res.json(results);
        });
    });
};
exports.update_book=(req,res)=>{
    // 0이면 비공개 1이면 공개
    const updatebookdata={
        Book_No:req.body.Book_No,
        Book_Title:req.body.Book_Title,
        Book_Public:req.body.Book_Public
    };
    db.query('update book set ? where Book_No=? and Member_No=?',
        [updatebookdata,req.body.Book_No,req.user.Member_No],(error,results)=>{
        if(error) console.log(error);
        if(results.affectedRows===0){
            // 바뀐 북이 없다는건 다른 사용자가 접근을 하려고 했다는것
            res.json({message:'잘못된 접근입니다.'});
        }else if(results.changedRows===0){
            res.json({message:'같은 내용입니다'});
        }else{
            res.json({message:'success'});
        }
    });
};
exports.delete_book=(req,res)=>{
    const Book_No = req.body.Book_No;
    // 북 삭제 쿼리
    db.query('delete from book where Member_No=? and Book_No=?',
        [req.user.Member_No,Book_No],(error,results)=>{
        if(error) console.log(error);
        if(results.affectedRows===0){
            res.json({message:'데이터가 잘못됬거나, 없습니다'});
        }else{
            res.json({message:'success'});
        }
    });
};

exports.insert_story=(req,res)=>{
    const new_story={
        Book_No : req.body.Book_No,
        Member_No : req.user.Member_No,
        Story_Title : req.body.Story_Title,
        Story_Owner : req.user.Member_Name,
    };
    db.query('insert into story set ? ',[new_story], (error,results)=>{
        db.query('select Story_No,Story_DateStart,Story_Citation,Story_Follow,Story_View ' +
            'from story where Story_No=?',[results.insertId],(error,results)=>{
            if(error){
                console.log(error);
                res.json({result:false, message:'스토리 삽입 실패!'});
            }
            else{
                res.json({result:true, message:'스토리 삽입 성공!',Story:results[0]});
            }
        });

    });
};
exports.update_story=(req,res)=>{
    const {Story_No,Story_Title} =req.body;
    // 들어오는 값에 따라서
    // 0이면 비공개 1이면 공개
    const Story_Public=req.body.Story_Public;
    const updatestory={
        Story_Title:Story_Title,
        Story_Public:Story_Public
    };
    db.query('update story set ? where Member_No=? and Story_No=?',
        [updatestory,req.user.Member_No,Story_No],(error,results)=>{
        if(error) console.log(error);
        if(results.affectedRows===0){
            // 바뀐 데이터가 없다는건 다른 사용자가 접근을 하려고 했다는것
            res.json({message:'fail'});
        }else if(results.changedRows===0){
            res.json({message:'fail'});
        }else{
            res.json({message:'success'})
        }
    });
};
exports.delete_story=(req,res)=>{
    const Story_No = req.body.Story_No;
    // 스토리안의 페이지 넘버를 불러옴
    db.query('select Page_No from page where Member_No=? and Story_No=?',
        [req.user.Member_No,Story_No],(error,results)=>{
            if(error) console.log(error);
            let pageno=[];
            for(let i=0;i<results.length;i++){
                pageno.push(results[i].Page_No);
            }
            db.query('delete from page where Page_No in (?)',[pageno],(error,results)=>{
                if(error) console.log(error);
                console.log('페이지 삭제');
            });
            db.query('select Image_No,Image_Path from image where Image_Fieldname=? and No in (?)',
                ['Page_Image',pageno],(error,results)=>{
                    if(error) console.log(error);
                    let delimgno=[];
                    for(let i=0;i<results.length;i++){
                        delimgno.push(results[i].Image_No);
                        fs.unlink(cwd+'/'+results[i].Image_Path,(error)=>{
                            if(error) console.log(error);
                            console.log('파일 삭제');
                        });
                    }
                    db.query('delete from image where Image_No in (?)',
                        [delimgno],(error,results)=>{
                            if(error) console.log(error);
                            console.log('이미지 삭제');
                        });
                });
            db.query('delete from story where Member_No=? and Story_No=?',[req.user.Member_No,Story_No],(error,results)=>{
                if(error) console.log(error);
                if(results.affectedRows===0){
                    res.json({message:'error',result:false});
                }else{
                    res.json({message:'success',result:true});
                }
            });
        });
    // 스토리 삭제
};

exports.insert_story_memo=(req,res)=>{
    const {Story_No, Story_Memo_Text} = req.body;
    const new_story_memo_data={
        Story_No:Story_No,
        Member_No:req.user.Member_No,
        Story_Memo_Text:Story_Memo_Text
    };
    // 메모 넣기
    db.query('insert into story_memo set ?',[new_story_memo_data],(error,results)=>{
        if(error){
            console.log(error);
            res.json({message:'fail'});
        }else{
            // 삽입 후 해당 스토리의 메모를 전부 다시 가져옴
            db.query('select Story_Memo_No,Story_Memo_Text ' +
                'from story_memo where Member_No=? and Story_No=?',
                [req.user.Member_No,Story_No],(error,results)=>{
                if(error) console.log(error);
                return res.json({message:'success', Story_Memo:results});
            });
            // const story_memo=fn_story_memo(req.user.Member_No,Story_No);
        }
    });
};
exports.update_story_memo=(req,res)=>{
    const {Story_No,Story_Memo_No,Story_Memo_Text}=req.body;
    // 메모 수정
    db.query('update story_memo set Story_Memo_Text=? ' +
        'where Story_Memo_No=? and Member_No=? and Story_No=?',
        [Story_Memo_Text,Story_Memo_No,req.user.Member_No,Story_No],(error)=>{
        if(error){
            console.log(error);
            res.json({message:'fail'});
        }else{
            // 수정 후 해당 스토리의 메모를 전부 다시 가져옴
            db.query('select Story_Memo_No,Story_Memo_Text from story_memo ' +
                'where Member_No=? and Story_No=?',
                [req.user.Member_No, Story_No], (error, results) => {
                if (error) console.log(error);
                return res.json({message: 'success', Story_Memo: results});
            });
        }
    });
};
exports.delete_story_memo=(req,res)=>{
    const {Story_Memo_No,Story_No}=req.body;
    // 메모 삭제
    db.query('delete from story_memo ' +
        'where Story_Memo_No=? and Member_No=? and Story_No=?',
        [Story_Memo_No,req.user.Member_No,Story_No],(error,results)=>{
        if(error){
            console.log(error);
            res.json({message:'fail'});
        }else{
            // 삭제 후 해당 스토리의 메모 다시 불러오기
            db.query('select Story_Memo_No,Story_Memo_Text ' +
                'from story_memo where Member_No=? and Story_No=?',
                [req.user.Member_No, Story_No], (error, results) => {
                if (error) console.log(error);
                return res.json({message: 'success', Story_Memo: results});
            });
        }
    });

};
// function fn_story_memo(userno,story_no) {
//     const select_story_memo_query=
//         'select Story_Memo_No,Story_Memo_Text ' +
//         'from story_memo ' +
//         'where Member_No=? and Story_No=?';
//     db.query(select_story_memo_query,[userno,story_no],(error,results)=>{
//         if(error) console.log(error);
//         return results;
//     });
// }

exports.list_page=(req,res)=>{
    let page=null;
    const Story_No = req.body.Story_No;
    // 스토리 사이테이션 팔로우 뷰 가져오기
    db.query('select Story_Citation,Story_Follow,Story_View from story where Member_No=? and Story_No=?',
        [req.user.Member_No,Story_No],(error,results)=>{
        if(error) console.log(error);
        let {Story_Citation,Story_Follow,Story_View} =results[0];
        // 페이지 데이터 가져오기
        db.query("select Page_No,page.Member_No,Page_Author," +
            "Page_Content,Page_UpdateDate,Page_Link,Page_Last,Page_Done " +
            "from story,page where story.Story_No = page.Story_No and page.Story_No=?",
            [Story_No],(error,results)=>{
            // 페이지가 없을경우
            if(results.length===0)
            {
                res.json({
                    Story_Citation:Story_Citation,
                    Story_Follow:Story_Follow,
                    Story_View:Story_View,
                    Page_Data:[]
                });
            }else{
                page=results;
                for(let i=0;i<page.length;i++){
                    page[i].Imgdata=[];
                }
                // 이미지 가져오기
                db.query('select image.* from image,page ' +
                    'where page.Member_No=? and Image_Fieldname=? and image.No=page.Page_No',
                    [req.user.Member_No,'Page_Image'],(error,results)=>{
                    if(error) console.log(error);
                    const filecount = results ? results.length : 0;
                    for(let i=0;i<page.length;i++){
                        for(let j=0; j<filecount;j++){
                            if(page[i].Page_No===results[j].No){
                                page[i].Imgdata.push({
                                    Image_No:results[j].Image_No,
                                    Page_No:results[j].No,
                                    Image_Path:'http://history-dcy.com/imageload?imagepath='+results[j].Image_Path
                                });
                            }
                        }
                        if(i===page.length-1){
                            // 함수의 종료를 선언하지 않으면 무한루프가 돌아버린다
                            return res.json({
                                Story_Citation:Story_Citation,
                                Story_Follow:Story_Follow,
                                Story_View:Story_View,
                                Page_Data:page
                            });
                        }
                    }
                });
            }
        });
    });
};
exports.insert_page=(req,res)=>{
    //multipart
    // 1.전에 쓴 페이지의 page_last를 0 으로 업데이트. 첫글이면 undefined가 나올테니 if문으로 조건검사
    // 2.내용을 넣음과 동시에 pagelast를 1로 해서 같이 입력
    // 3.page를 수정할때는 pagelast가 1인지 확인
    // 4.story가 done이라면 새 page 작성이 되지 말아야한다.
    console.log('업로드된 파일',req.files);
    const Story_No=parseInt((req.body.Story_No).slice(2));
    const Page_Content=xss((req.body.Page_Content).slice(2));
    let Page_Link,Page_Imgcount;
    if(req.body.Page_Link){
        Page_Link=xss((req.body.Page_Link).slice(2));
    }
    if(req.files){
        Page_Imgcount=req.files.length;
    }
    const pagedata = {
        Story_No:Story_No,
        Member_No:req.user.Member_No,
        Page_Author:req.user.Member_Name,
        Page_Content:Page_Content,
        Page_Link:Page_Link,
        Page_Last:1,
        Page_Imgcount:Page_Imgcount
    };
    // 완성된 스토리인지 확인
    db.query('select Story_Done from story where Member_No=? and Story_No=?',
        [req.user.Member_No,Story_No],(error,results)=>{
            if(error) console.log(error);
            if(results[0].Story_Done===1){
                res.json({result:false,message:'이미 완료한 스토리에 더이상 페이지를 작성할수 없습니다.'});
            }else {
                db.beginTransaction((error)=>{
                    if(error) throw error;
                    //전에 쓴 글 page last를 0으로 바꿈
                    db.query('update page set Page_Last=0 where Story_No=? and Member_No=? order by Page_No desc limit 1',
                        [Story_No,req.user.Member_No],(error,results)=>{
                            if(error) console.log(error);
                            // 첫글이어도 상관없다 없으면 없는대로
                            db.query('insert into page set ?',pagedata,(error,results)=>{
                                if(error) return db.rollback(()=>{throw error;});
                                const page_no = results.insertId;
                                // if(!(req.files.Page_File)){
                                //     let filedata = {
                                //         Page_No:page_no,
                                //         File_Fieldname:req.files.Page_File[0].fieldname,
                                //         File_Path:req.files.Page_File[0].path,
                                //         File_Originalname:req.files.Page_File[0].originalname,
                                //     };
                                //     db.query('insert into file set ?',filedata,(error)=>{
                                //         if(error){
                                //             return db.rollback(()=>{throw error;});
                                //         }
                                //     });
                                //     console.log('파일넣는데이터',filedata);
                                // }

                                // 파일이 있으면
                                if(req.files){
                                    for(let i=0;i<req.files.length;i++){
                                        //변수 초기화
                                        let imgdata={};
                                        imgdata={
                                            No:page_no,
                                            Image_Fieldname:req.files[i].fieldname,
                                            Image_Path:req.files[i].path,
                                            Image_Originalname:req.files[i].originalname
                                        };
                                        db.query('insert into image set ?',[imgdata],(error)=>{
                                            if(error) return db.rollback(()=>{throw error;});
                                        });
                                    }
                                }
                                db.commit((error)=> {
                                    if (error) return db.rollback(() => {
                                        throw error
                                    });
                                    console.log('Transaction Complete.');
                                    db.query('select Story_Citation,Story_Follow,Story_View from story where Member_No=? and Story_No=?',
                                        [req.user.Member_No, Story_No], (error, results) => {
                                            if (error) console.log(error);
                                            let Story_Citation,Story_Follow,Story_View;
                                            Story_Citation = results[0].Story_Citation;
                                            Story_Follow = results[0].Story_Follow;
                                            Story_View = results[0].Story_View;
                                            db.query('select Page_No,page.Member_No,Page_Author,' +
                                                'Page_Content,Page_UpdateDate,Page_Link,Page_Last,Page_Done from page ' +
                                                'where Member_No=? and Story_No=?', [req.user.Member_No, Story_No], (error, results) => {
                                                if (error) console.log(error);
                                                let res_pagedata = results;
                                                for (let i = 0; i < res_pagedata.length; i++) {
                                                    res_pagedata[i].Imgdata = [];
                                                }
                                                db.query('select image.* from image,page ' +
                                                    'where page.Member_No=? and Image_Fieldname=? and image.No=page.Page_No',
                                                    [req.user.Member_No, 'Page_Image'], (error, results) => {
                                                        if (error) console.log(error);
                                                        const filecount = results ? results.length : 0;
                                                        for (let i = 0; i < res_pagedata.length; i++) {
                                                            for (let j = 0; j < filecount; j++) {
                                                                if (res_pagedata[i].Page_No === results[j].No) {
                                                                    res_pagedata[i].Imgdata.push({
                                                                        Image_No: results[j].Image_No,
                                                                        Page_No: results[j].No,
                                                                        Image_Path: 'http://history-dcy.com/imageload?imagepath=' + results[j].Image_Path
                                                                    });
                                                                }
                                                            }
                                                            if (i === res_pagedata.length - 1) {
                                                                // 함수의 종료를 선언하지 않으면 무한루프가 돌아버린다
                                                                return res.json({
                                                                    Story_Citation:Story_Citation,
                                                                    Story_Follow:Story_Follow,
                                                                    Story_View:Story_View,
                                                                    Page_Data: res_pagedata
                                                                });
                                                            }
                                                        }
                                                    });
                                            });
                                        });
                                })
                                // db엔드콜 하면 문제가 생긴다 connection pool에 대해서 알아보라는데?
                                // db.end();
                            });
                        });
                })
            }
        });
};

// exports.update_page1=(req,res)=>{
//     //multipart
//     //널값 처리
//     //1. PageLast 확인
//     //2. 이미지가 있다면 -> 원래 있던 이미지 + 삽입할 이미지 - 제거할 이미지
//     // 지울 이미지의 번호를 delete_Image_No 변수에 push한다.
//     console.log(req.body);
//     const Page_No=parseInt((req.body.Page_No).slice(2));
//     const Page_Content=xss((req.body.Page_Content).slice(2));
//     let Page_Link;
//     if(req.body.Page_Link){
//         Page_Link=((req.body.Page_Link).slice(2));
//     }
//     // 지울 이미지는 array로 받는다. 만약 단일값이라면 array로 만들어서 담아준다
//     let delete_Images_No=[];
//     let delete_Images_count=0;
//     if(req.body.delete_Images_No){
//         if(Array.isArray(req.body.delete_Images_No)){
//             for(let i=0; i<delete_Images_No.length;i++){
//                 delete_Images_No[i]=parseInt((req.body.delete_Images_No[i]).slice(2));
//             }
//         }else{
//             delete_Images_No.push(parseInt((req.body.delete_Images_No).slice(2)));
//         }
//         delete_Images_count=delete_Images_No.length;
//     }
//     //페이지 데이터
//     const updatepagedata={
//         Page_Content:Page_Content,
//         Page_UpdateDate:new Date(),
//         Page_Link:Page_Link,
//     };
//     console.log('지울 이미지 번호 ,갯수',delete_Images_No,delete_Images_count);
//     console.log('페이지 데이터',updatepagedata);
//     // Page_Last가 1인지 확인
//     db.query('select Page_Last from page where Member_No=? and Page_No=?',
//         [req.user.Member_No,Page_No],(error,results)=>{
//             if(error) console.log(error);
//             if(results[0].Page_Last===0){
//                 res.json({message:'not last page'});
//             }else {
//                 if (req.files) {
//                     // 업로드한 이미지가 있다면 총 이미지 갯수 확인
//                     db.query('select Page_Imgcount from page where Member_No=? and Page_No=?',
//                         [req.user.Member_No, Page_No], (error, results) => {
//                         if (error) console.log(error);
//                         let updateimgcount = results[0].Page_Imgcount + req.files.length - delete_Images_count;
//                         if (updateimgcount > 6) {
//                             res.json({message: 'exceed img count'});
//                         } else {
//                             //이미지 삭제 fs.unlink사용
//                             for(let i=0; i<delete_Images_count;i++) {
//                                 let delete_image_path='';
//                                 // 삭제할 이미지 경로
//                                 db.query('select Image_Path from image where Image_No=?',[delete_Images_No[i]],(error,results)=>{
//                                     if(error) console.log(error);
//                                     delete_image_path=results[0].Image_Path;
//                                     // 이미지 삭제
//                                     db.query('delete from image where Image_No=?',[delete_Images_No[i]],(error,results)=>{
//                                         if(error) console.log(error);
//                                         if(results.affectedRows===1){
//                                             // 폴더에서 삭제
//                                             fs.unlink(cwd+'/'+delete_image_path,(error)=>{
//                                                 if(error) console.log(error);
//                                                 console.log('파일 삭제');
//                                             });
//                                         }else{
//                                             console.log('삭제 안되었습니다');
//                                         }
//                                     });
//                                 });
//                             }
//                             // 이미지 삽입
//                             for(let i=0;i<req.files.length;i++){
//                                 //변수 초기화
//                                 let imgdata={};
//                                 imgdata={
//                                     No:Page_No,
//                                     Image_Fieldname:req.files[i].fieldname,
//                                     Image_Path:req.files[i].path,
//                                     Image_Originalname:req.files[i].originalname
//                                 };
//                                 db.query('insert into image set ?',[imgdata],(error)=>{
//                                     if(error) console.log(error);
//                                     console.log('이미지 넣었습니다');
//                                 });
//                             }
//                         }
//                     });
//                 }
//                 // 페이지 삽입
//                 db.query('update page set ? where Member_No=? and Page_No=?',
//                     [updatepagedata,req.user.Member_No,Page_No],(error,results)=>{
//                     if(error) console.log(error);
//                     if(results.affectedRows===0){
//                         // 바뀐 데이터가 없다는건 다른 사용자가 접근을 하려고 했다는것
//                         res.json({message:'fail'});
//                     }else if(results.changedRows===0){
//                         res.json({message:'fail'});
//                     }else{
//                         console.log('page수정완료');
//                         res.json({result:true,message:'success'});
//                     }
//                 });
//             }
//         })
// };

exports.update_page=(req,res)=>{
    //1. PageLast 확인
    //2. 이미지가 있다면 -> 원래 있던 이미지 + 삽입할 이미지 - 제거할 이미지
    const Page_No=parseInt((req.body.Page_No).slice(2));
    const Page_Content=xss((req.body.Page_Content).slice(2));
    let Page_Link=null;
    if(req.body.Page_Link){
        Page_Link=xss((req.body.Page_Link).slice(2));
    }
    // 지울 이미지의 번호를 delete_Image_No 변수에 push한다.
    // 지울 이미지는 array로 받는다. 만약 단일값이라면 array로 만들어서 담아준다
    let delete_Images_No=[];
    let delete_Images_count=0;
    if(req.body.delete_Images_No){
        if(Array.isArray(req.body.delete_Images_No)){
            for(let i=0; i<delete_Images_No.length;i++){
                delete_Images_No[i]=parseInt((req.body.delete_Images_No[i]).slice(2));
            }
        }else{
            delete_Images_No.push(parseInt((req.body.delete_Images_No).slice(2)));
        }
        delete_Images_count=delete_Images_No.length;
    }
    const updatepagedata={
        Page_Content:Page_Content,
        Page_UpdateDate:new Date(),
        Page_Link:Page_Link,
    };
    // Page_Last가 1인지 확인
    db.query('select Page_Last from page where Member_No=? and Page_No=?',
        [req.user.Member_No,Page_No],(error,results)=>{
            if(error) console.log(error);
            if(results[0].Page_Last===0){
                res.json({result:false,message:'마지막 페이지만 수정할 수 있습니다.'});
            }else {
                // 이미지가 있다면 이미지 갯수 가져오기
                if (req.files) {
                    db.query('select Page_Imgcount from page where Member_No=? and Page_No=?',
                        [req.user.Member_No, Page_No], (error, results) => {
                            if (error) console.log(error);
                            let updateimgcount = results[0].Page_Imgcount + req.files.length - delete_Images_count;
                            // 이미지 조건 만족하는지 검사
                            if (updateimgcount > 6) {
                                res.json({result: false, message: '이미지 삽입 갯수 초과'});
                            } else {
                                //이미지 지우는작업 fs.unlink 사용
                                // 지우는 이미지가 있다면
                                if(delete_Images_No[0]){
                                    db.query('select Image_Path from image where No=? and Image_Fieldname=? and Image_No in (?)',
                                        [Page_No,'Page_Image',delete_Images_No],(error,results)=>{
                                        if(error) console.log(error);
                                        db.query('delete from image where Image_No in (?)',
                                            [delete_Images_No],(error,results)=>{
                                                if(error) console.log(error);
                                                console.log('이미지 삭제');
                                            });
                                        for(let i=0; i<results.length;i++){
                                            fs.unlink(cwd+'/'+results[i].Image_Path,(error)=>{
                                                if(error) console.log(error);
                                                console.log('파일 삭제');
                                            });
                                        }
                                    });
                                }
                                // for(let i=0; i<delete_Images_count;i++) {
                                //     delete_Images_No[i]=parseInt(delete_Images_No[i]);
                                //     let delete_image_path='';
                                //     db.query('select Image_Path from image where Image_No=?',[delete_Images_No[i]],(error,results)=>{
                                //         if(error) console.log(error);
                                //         delete_image_path=results[0].Image_Path;
                                //         db.query('delete from image where Image_No=?',
                                //             [delete_Images_No[i]],(error,results)=>{
                                //             if(error) console.log(error);
                                //             if(results.affectedRows===1){
                                //                 fs.unlink(cwd+'/'+delete_image_path,(error)=>{
                                //                     if(error) console.log(error);
                                //                     console.log('파일 삭제');
                                //                 });
                                //             }else{
                                //                 console.log('삭제 안되었습니다');
                                //             }
                                //         });
                                //     });
                                // }

                                // 이미지 삽입
                                for(let i=0;i<req.files.length;i++){
                                    //변수 초기화
                                    let imgdata={};
                                    imgdata={
                                        No:Page_No,
                                        Image_Fieldname:req.files[i].fieldname,
                                        Image_Path:req.files[i].path,
                                        Image_Originalname:req.files[i].originalname
                                    };
                                    db.query('insert into image set ?',[imgdata],(error)=>{
                                        console.log('이미지 넣었습니다');
                                    });
                                }
                            }
                        });
                }
                // 페이지 수정 쿼리
                db.query('update page set ? where Member_No=? and Page_No=?',
                    [updatepagedata,req.user.Member_No,Page_No],(error,results)=>{
                    if(error) console.log(error);
                    if(results.affectedRows===0){
                        // 바뀐 데이터가 없다는건 다른 사용자가 접근을 하려고 했다는것
                        res.json({result:false,message:'잘못된 접근입니다.'});
                    }else{
                        res.json({message:'success'});
                    }
                });
            }
        })
};


//TODO 값이 없을때 서버, 웹에서의 처리
exports.timeline=(req,res)=>{
    let tldata=[];
    const select_tl_query = 'select book.Book_Title,story.Story_No,Story_Title,Page_No,Page_Content,Page_UpdateDate ' +
        'from story,page,book ' +
        'where book.Book_No=story.Book_No and page.Story_No=story.Story_No and Member_No=? ' +
        'Order By page.Page_UpdateDate DESC';
    db.query(select_tl_query,[req.user.Member_No],(error,results)=>{
        if(results.length===0) res.json({tldata:null});
        if(error) console.log(error);
        tldata=results;
        res.json({tldata:tldata});
    })

};