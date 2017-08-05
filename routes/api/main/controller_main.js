/**
 * Created by Jeongho on 2017-05-13.
 */
const path=require('path');
const cwd = process.cwd();
const db=require(cwd+'/config/db');
const fs=require('fs');
const passport=require(cwd+'/config/passport');
const xss=require('xss');
// 대부분의 URL에 사용자 인증 정보를 담은 토큰을 보내므로, 사용자인지 확인하는 query를 작성해야한다.

// 인트로
exports.intro=(req,res,next)=>{
    //쿠키값으로 로그인 ? 되면 바로 action으로 이동 : 안되면 로그인 화면으로
    passport.authenticate('jwtc', {session: false}, function(err, user, info) {
        if (err) return next(err);
        if (!user) {
            return fs.readFile('views/intro.html','utf8',(error,data)=>{
                res.send(data);});
        }else {
            res.redirect('/action');
        }
    })(req, res, next);
};
// 회원가입
exports.signup=(req,res)=>{
    fs.readFile('views/sign-up.html','utf8',(error,data)=>{
        res.send(data);
    });
};
// 로그아웃
exports.logout=(req,res)=>{
    // jwt 쿠키 삭제 후 인트로로 이동
    res.clearCookie('jwt').redirect('/');
};
// 아이디중복확인
exports.check_idOverlap=(req,res)=>{
    const userid=req.body.userid;
    // 중복된 아이디 갯수 조사
    db.query('select count(*) as overlap from member where Member_ID=?',
        [userid],(error,results)=>{
        if(results[0].overlap === 0) {
            res.json({result: true, message:'사용 가능한 아이디입니다!'});
        }else{
            res.json({result:false,message:'중복된 아이디입니다.'})
        }
    });
};
// 이미지 로드
exports.imageload=(req,res)=>{
    const imagepath = req.query.imagepath;
    fs.readFile(cwd+'/'+imagepath,function (error,data) {
        if(error) console.log(error);
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.end(data);
    });
};
// 북 리스트(new-story 버튼)
exports.list_book=(req,res)=>{
    db.query('select * from book where Member_No=?',[req.user.Member_No],function (error,results) {
        if(error) console.log(error);
        res.json(results);
    });
};

// 북 타이틀 수정
exports.update_book_info=(req,res)=>{
    // 수정하려는 북의 넘버와 북타이틀을 불러온다
    const {Book_No,Book_Title,Book_Public}=req.body;
    // 북 타이틀 업데이트
    const update_book_info={
        Book_No:Book_No,
        Book_Title:Book_Title,
        Book_Public:Book_Public
    };
    db.query('update book set ? where Book_No=? and Member_No=?',
        [update_book_info,Book_No,req.user.Member_No],(error,results)=>{
        if(error){
            console.log(error);
            res.json(false);
        }else{
            res.json(true);
        }

    });
};
// // 북 공개 여부 수정 (토글식)
// exports.update_book_public=(req,res)=>{
//     const Book_No=req.body.Book_No;
//     // 북 공개 여부를 토글로 설정 가능
//     db.query('update book set Book_Public=!Book_Public where Member_No=? and Book_No=?',
//         [req.user.Member_No,Book_No],(error,results)=>{
//         if(error) console.log(error);
//         if(results.affectedRows===0){
//             // 바뀐 데이터가 없다는건 다른 사용자가 접근을 하려고 했다는것
//             res.json({result:false,message:'잘못된 접근입니다.'});
//         }else if(results.changedRows===0){
//             res.json({result:false,message:'같은 내용입니다'});
//         }else{
//             res.json({result:true,message:'변경되었습니다.'})
//         }
//     });
// };
// 스토리 타이틀 수정
exports.update_story_info=(req,res)=>{
    const {Book_No,Story_No,Story_Title,Story_Public}=req.body;
    const updatestoryinfo={
        Book_No:Book_No,
        Story_No:Story_No,
        Story_Title:Story_Title,
        Story_Public:Story_Public,
    };
    db.query('update story set ? where Member_No=? and Story_No=?',
        [updatestoryinfo,req.user.Member_No,Story_No],(error,results)=>{
        if(error) console.log(error);
        if(results.affectedRows===0){
            // 바뀐 데이터가 없다는건 다른 사용자가 접근을 하려고 했다는것
            res.json(false);
        }else if(results.changedRows===0){
            res.json(false);
        }else{
            res.json(true)
        }
    });
};
//스토리 완료 & 마지막 글 쓰기
exports.update_story_done=(req,res)=>{
    console.log('업로드된 파일',req.files);
    const Story_No=req.body.Story_No;
    const Page_Link=xss(req.body.Page_Link);
    const Page_Content=xss(req.body.Page_Content);
    // Page_Done을 1으로 하는 페이지를 삽입
    const pagedata = {
        Story_No:Story_No,
        Member_No:req.user.Member_No,
        Page_Author:req.user.Member_Name,
        Page_Content:Page_Content,
        Page_Link:Page_Link,
        Page_Last:1,
        Page_Done:1
    };
    // 스토리가 done인지 확인
    db.query('select Story_Done from story where Member_No=? and Story_No=?'
        ,[req.user.Member_No,Story_No],(error,results)=>{
        if(error) console.log(error);
        if(results[0].Story_Done===1){
            res.json({result:false,message:'이미 완료한 스토리입니다.'});
        }else {
            db.beginTransaction((error)=>{
                if(error) throw error;
                //전에 쓴 글 page last를 0으로 바꿈
                db.query('update page set Page_Last=0 where Story_No=? and Member_No=? order by Page_No desc limit 1',
                    [Story_No,req.user.Member_No],(error,results)=>{
                    if(error) console.log(error);
                    // results가 null이어도 문제없음
                    // 페이지 삽입
                    db.query('insert into page set ?',[pagedata],(error,results)=>{
                        if(error) return db.rollback(()=>{throw error;});
                        // 삽입한 페이지에 이미지 넣는 과정
                        const page_no = results.insertId;
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
                                    db.query('update page set Story_Done=1 where Story_No=?',Story_No,(error,results)=>{
                                        if(error) return db.rollback(()=>{throw error;});
                                    });
                                });
                            }
                        }
                        db.commit((error)=>{
                            if(error) return db.rollback(()=>{throw error});
                            console.log('Transaction Complete.');
                            res.json({result:true, message:'스토리가 완성되었습니다!', url:'/story/'+req.body.Story_No});
                        });
                        // db엔드콜 하면 문제가 생긴다 connection pool에 대해서 알아보라는데?
                        // db.end();
                    });
                });
            })
        }
    });
};
//페이지 수정
exports.update_page=(req,res)=>{
    //1. PageLast 확인
    //2. 이미지가 있다면 -> 원래 있던 이미지 + 삽입할 이미지 - 제거할 이미지
    // 지울 이미지의 번호를 delete_Image_No 변수에 push한다.
    const Page_No=req.body.Page_No;
    // 지울 이미지는 array로 받는다. 만약 단일값이라면 array로 만들어서 담아준다
    let delete_Images_No=[];
    let delete_Images_count;
    if(req.body.delete_Images_No){
        if(Array.isArray(req.body.delete_Images_No)){
            delete_Images_No=req.body.delete_Images_No;
        }else{
            delete_Images_No.push(req.body.delete_Images_No);
        }
        delete_Images_count=delete_Images_No.length;
    }
    const updatepagedata={
        Page_Content:xss(req.body.Page_Content),
        Page_UpdateDate:new Date(),
        Page_Link:xss(req.body.Page_Link),
    };
    // Page_Last가 1인지 확인
    db.query('select Page_Last from page where Member_No=? and Page_No=?',
        [req.user.Member_No,Page_No],(error,results)=>{
        if(error) console.log(error);
        if(results[0].Page_Last===0){
            res.json({result:false,message:'마지막 페이지만 수정할 수 있습니다.'});
        }else {
            // 이미지가 있다면
            if (req.files) {
                // 이미지 갯수 가져오기
                db.query('select Page_Imgcount from page where Member_No=? and Page_No=?',
                    [req.user.Member_No, Page_No], (error, results) => {
                    if (error) console.log(error);
                    let updateimgcount = results[0].Page_Imgcount + req.files.length - delete_Images_count;
                    if (updateimgcount > 6) {
                        res.json({result: false, message: '이미지 삽입 갯수 초과'});
                    } else {
                        //이미지 지우는작업 fs.unlink사용
                        // TODO 작업중
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
                }else if(results.changedRows===0){
                    // 같은내용
                    res.json({result:true});
                }else{
                    // 수정완료
                    console.log('page수정');
                    res.json({result:true});
                }
            })
        }
    })
};

// 북 삭제
exports.delete_book=(req,res)=>{
    const Book_No = req.body.Book_No;
    // 북 삭제
    db.query('delete from book where Member_No=? and Book_No=?',
        [req.user.Member_No,Book_No],(error,results)=>{
        if(error) console.log(error);
        if(results.affectedRows===0){
            res.json({message:'데이터가 잘못됬거나, 없습니다',result:false});
        }else{
            res.json({message:'성공적으로 삭제되었습니다.',result:true});
        }
    });
};
// 스토리 삭제
exports.delete_story=(req,res)=>{
    const Story_No = req.body.Story_No;
    // 스토리안의 페이지 넘버를 불러옴
    db.query('select Page_No from page where Member_No=? and Story_No=?',
        [req.user.Member_No,Story_No],(error,results)=>{
        if(error) console.log(error);
        let pageno=[];
        // 지울 페이지가 있으면
        if(results[0]){
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
                if(results.length){
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
                }
            });
        }

        db.query('delete from story where Member_No=? and Story_No=?',[req.user.Member_No,Story_No],(error,results)=>{
            if(error) console.log(error);
            if(results.affectedRows===0){
                res.json(false);
            }else{
                res.json(true);
            }
        });
    });
    // 스토리 삭제

};
// 페이지 삭제는 기본적으로 안됨
exports.delete_page=(req,res)=>{};

// 북 삽입
exports.insert_book=(req,res)=>{
    const new_book={
        Member_No:req.user.Member_No,
        Book_Title:req.body.Book_Title,
        Book_Author:req.user.Member_Name,
        Book_Public : req.body.Book_Public ? 0 : 1,
    };
    db.query('insert into book set ? ',[new_book],(error,results)=>{
        if(error) console.log(error);
        res.json(results.insertId);
    });
};
// 스토리 삽입
exports.insert_story=(req,res)=>{
    const new_story={
        Book_No : req.body.Book_No,
        Member_No : req.user.Member_No,
        Story_Title : req.body.Story_Title,
        Story_Owner : req.user.Member_Name,
        Story_Public: req.body.Story_Public ? 1 : 0
    };
    db.query('insert into story set ? ',[new_story], (error)=>{
        if(error){
            console.log(error);
            res.send({result:false,url:'/action'});
        }
        else{
            console.log('스토리 삽입 성공!');
            res.json({result:true,url:'/action'});
        }
    });
};
// 페이지 삽입 (로직에 대한 설명 필요)
exports.insert_page=(req,res)=>{
    // 1.전에 쓴 페이지의 page_last를 0 으로 업데이트. 첫글이면 undefined가 나올테니 if문으로 조건검사
    // 2.내용을 넣음과 동시에 pagelast를 1로 해서 같이 입력
    // 3.page를 수정할때는 pagelast가 1인지 확인
    // 4.story가 done이라면 새 page 작성이 되지 말아야한다.
    console.log('업로드된 파일',req.files);
    const Story_No=req.body.Story_No;
    const Page_Content=xss(req.body.Page_Content);
    const Page_Link=xss(req.body.Page_Link);
    let Page_Imgcount;
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
    // 완료된 스토리인지 확인
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
                    db.query('insert into page set ?',[pagedata],(error,results)=>{
                        if(error){
                            return db.rollback(()=>{throw error;});
                        }
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
                                    if(error){
                                        return db.rollback(()=>{throw error;});
                                    }
                                });
                            }
                        }
                        db.commit((error)=>{
                            if(error){
                                return db.rollback(()=>{throw error});
                            }
                            console.log('Transaction Complete.');
                            res.json({result:true, url:'/story/'+req.body.Story_No});
                        });
                        // db엔드콜 하면 문제가 생긴다 connection pool에 대해서 알아보라는데?
                        // db.end();
                    });
                });
            })
        }
    });
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
            res.json(false);
        }else{
            // 삽입 후 해당 스토리의 메모를 전부 다시 가져옴
            res.json(results.insertId);
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
                res.json(false);
            }else{
                res.json(true);
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
            res.json(false);
        }else{
            res.json(true);
        }
        });

};

// 액션 timeline
exports.timeline=(req,res)=>{
    let tldata=[];
    // 타임라인 데이터 쿼리 추후
    db.query('select book.Book_Title,story.Story_No,Story_Title,Story_DateStart,Page_No,Page_Content,Page_UpdateDate ' +
        'from story,page,book ' +
        'where story.Member_No=? and book.Book_No=story.Book_No and page.Story_No=story.Story_No ' +
        'Order By page.Page_UpdateDate DESC limit 15',[req.user.Member_No],(error,results)=>{
        if(error) console.log(error);
        if(results.length===0){
            res.render('action_timeline',{tldata:null});
        }else{
            tldata=results;
            for(let i=0;i<tldata.length;i++){
                tldata[i].Imgdata=[];
            }
            // 이미지 가져오기
            db.query('select image.* from image,page ' +
                'where page.Member_No=? and Image_Fieldname=? and image.No=page.Page_No',
                [req.user.Member_No,'Page_Image'],(error,results)=>{
                    if(error) console.log(error);
                    const filecount = results ? results.length : 0;
                    for(let i=0;i<tldata.length;i++){
                        for(let j=0; j<filecount;j++){
                            if(tldata[i].Page_No===results[j].No){
                                tldata[i].Imgdata.push({
                                    Image_No:results[j].Image_No,
                                    No:results[j].No,
                                    Image_Path:'/imageload?imagepath='+results[j].Image_Path
                                });
                            }
                        }
                        if(i===tldata.length-1){
                            // 함수의 종료를 선언하지 않으면 무한루프가 돌아버린다
                            return res.render('action_timeline',{tldata:tldata});
                        }
                    }
                });
        }
    });
};

exports.timeline_update=(req,res)=>{
    const page= req.body.page;
    let tldata=[];
    // 타임라인 데이터 쿼리 추후
    db.query('select book.Book_Title,story.Story_No,Story_Title,Story_DateStart,Page_No,Page_Content,Page_UpdateDate,Page_Link ' +
        'from story,page,book ' +
        'where story.Member_No=? and book.Book_No=story.Book_No and page.Story_No=story.Story_No ' +
        'Order By page.Page_UpdateDate DESC limit ?,5',[req.user.Member_No,15+page*5],(error,results)=>{
        if(error) console.log(error);
        if(results.length===0){
            res.json(null);
        }else{
            tldata=results;
            for(let i=0;i<tldata.length;i++){
                tldata[i].Imgdata=[];
            }
            // 이미지 가져오기
            db.query('select image.* from image,page ' +
                'where page.Member_No=? and Image_Fieldname=? and image.No=page.Page_No',
                [req.user.Member_No,'Page_Image'],(error,results)=>{
                    if(error) console.log(error);
                    const filecount = results ? results.length : 0;
                    for(let i=0;i<tldata.length;i++){
                        for(let j=0; j<filecount;j++){
                            if(tldata[i].Page_No===results[j].No){
                                tldata[i].Imgdata.push({
                                    Image_No:results[j].Image_No,
                                    No:results[j].No,
                                    Image_Path:'/imageload?imagepath='+results[j].Image_Path
                                });
                            }
                        }
                        if(i===tldata.length-1){
                            // 함수의 종료를 선언하지 않으면 무한루프가 돌아버린다
                            return res.json(tldata);
                        }
                    }
                });
        }
    });
}

// 액션 overview
exports.action= (req,res)=> {
    let story = null;
    //FIXME : promise로 이중쿼리 구현
    db.query('select book.Book_Title,story.* from book,story where book.Book_No=story.Book_No and story.Member_No=?',
        [req.user.Member_No], (error, results) => {
        if (error) console.log(error);
        // 데이터가 없다면
        if(results[0]===undefined){
            res.render('action_overview',{data:false});
        }else{
            story = results;
            for(let i=0;i<story.length;i++) {
                story[i].Story_Memo = [];
            }
            db.query('select story_memo.* from story,story_memo ' +
                'where story.Story_No=story_memo.Story_No and story.Member_No=?',
                [req.user.Member_No], (error, results) => {
                if(error) console.log(error);
                for(let i=0; i<story.length;i++) {
                    for (let j = 0; j < results.length; j++) {
                        if (story[i].Story_No === results[j].Story_No) {
                            story[i].Story_Memo.push(results[j]);
                        }
                    }
                    if(i===story.length-1){
                        res.render('action_overview',{data:story});
                    }
                }

            });
        }
    });
};
// 히스토리
exports.history=(req,res)=>{
    let historydata = null;
    db.query('select book.Book_No,Book_Title,Book_Public from book where Member_No=?',
        [req.user.Member_No],(error,results)=>{
        if(error) console.log(error);
        if(!results[0]){
            res.render('history',{historydata:null});
        }else{
            historydata=results;
            // Story라는 JSON 키값을 추가해준다
            for(let i =0; i<historydata.length;i++){
                historydata[i].Story=[];
            }
            db.query('select Book_No,Story_No,Story_Title,Story_Owner,Story_DateStart,Story_DateEnd ' +
                'from story where Member_No=?',[req.user.Member_No],(error,results)=>{
                if(error) console.log(error);
                for(let i=0;i<historydata.length;i++){
                    for(let j=0;j<results.length;j++){
                        if(historydata[i].Book_No === results[j].Book_No){
                            historydata[i].Story.push(results[j]);
                        }
                    }
                    if(i===historydata.length-1){
                        res.render('history',{historydata:historydata});
                    }
                }
            });
        }
    });
};

// story.ejs
exports.list_page=(req,res)=>{
    let page=null;
    const Story_No = req.params.id;
    db.query("select book.Book_Title,story.Story_No,story.Story_Title, story.Story_DateStart, page.* " +
        "from book,story,page where book.Book_No=story.Book_No and story.Story_No = page.Story_No and page.Story_No=?",
        [Story_No],(error,results)=>{
        // 페이지가 없을경우
        if(results.length===0)
        {
            db.query('select book.Book_Title,story.Story_Title,story.Story_DateStart ' +
                'from book,story where story.Story_No=? and story.Book_No=book.Book_No',
                [req.params.id],(error,results)=>{
                if(error) console.log(error);
                res.render('story',{page:results,Story_No: Story_No});
            });
        }else{
            page=results;
            for(let i=0;i<page.length;i++){
                page[i].Imgdata=[];
            }
            //이렇게하면 그 회원의 모든 이미지를 불러오게된다 그 스토리에 딸린 page만 불러올순 없을까 ㅠㅠ
            db.query('select image.* from image,page where page.Member_No=? and Image_Fieldname=? and image.No=page.Page_No',
                [req.user.Member_No,'Page_Image'],(error,results)=>{
                if(error) console.log(error);
                const filecount = results ? results.length : 0;
                for(let i=0;i<page.length;i++){
                    for(let j=0; j<filecount;j++){
                        if(page[i].Page_No===results[j].No){
                            page[i].Imgdata.push({
                                Image_No:results[j].Image_No,
                                No:results[j].No,
                                Image_Path:'/imageload?imagepath='+results[j].Image_Path
                            });
                        }
                    }
                    if(i===page.length-1){
                        // page.push({Story_No : Story_No});
                        // 함수의 종료를 선언하지 않으면 무한루프가 돌아버린다
                        return res.render('story',{page:page,Story_No : Story_No});
                    }
                }
            });
            // for(let i=0;i<page.length;i++){
            //     let Page_No = page[i].Page_No;
            //     db.query('select * from image where Page_No=?',Page_No,(error,results)=>{
            //         if(error) console.log(error);
            //         page[i].Imgdata=results;
            //         list_page.push(page[i]);
            //         if(list_page.length===page.length){
            //             list_page.push({Story_No : req.params.id});
            //             JSON.stringify(list_page);
            //             // console.log(list_page);
            //             res.render('story',{page:list_page});
            //         }
            //     })
            //
            // }
        }
    });
};

exports.explore=(req,res)=>{
    res.render('explore');
};

exports.setting=(req,res)=>{
    res.render('setting');
};

// 파일다운
// exports.filedown=(req,res)=>{
//     fs.readFile(cwd+'/userfile/'+req.params.name,(error,data)=>{
//         if(error) console.log(error);
//         const filename = req.params.name;
//         const filepath = cwd+"/userfile/"+filename;
//         res.download(filepath);
//     });
// };
