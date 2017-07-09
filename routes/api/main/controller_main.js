/**
 * Created by Jeongho on 2017-05-13.
 */
const path=require('path');
const cwd = process.cwd();
const db=require(cwd+'/config/db');
const fs=require('fs');
const passport=require(cwd+'/config/passport');

exports.intro=(req,res,next)=>{
    // FIXME 추후 문제 발생 소지
    passport.authenticate('jwtc', {session: false}, function(err, user, info) {
        if (err) return next(err);
        if (!user) {
            console.log('유저없음');
            return fs.readFile('views/intro.html','utf8',(error,data)=>{
                res.send(data);});
        }else {
            res.redirect('/action');
        }
    })(req, res, next);
};
exports.signup=(req,res)=>{
    fs.readFile('views/sign-up.html','utf8',(error,data)=>{
        res.send(data);
    });
};
exports.logout=(req,res)=>{
    res.clearCookie('jwt').redirect('/');
};
exports.check_idOverlap=(req,res)=>{
    const sql = 'select count(*) as overlap from member where Member_ID=?';
    db.query(sql,req.body.userid,(error,results)=>{
        if(results[0].overlap === 0) {
            res.json({result: true, message:'사용 가능한 아이디입니다!'});
        }else{
            res.json({result:false,message:'중복된 아이디입니다.'})
        }
    });
};
exports.imageload=(req,res)=>{
    console.log(req.params.name);
    fs.readFile(cwd+'/userfile/'+req.params.name,function (error,data) {
        if(error) console.log(error);
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.end(data);
    });
};

exports.list_book=(req,res)=>{
    db.query('select * from book where Member_No=?',req.user.Member_No,function (error,results) {
        if(error) console.log(error);
        res.json(results);
    });
};
exports.list_story=(req,res)=>{
    let story = null;
    let story_list=[];
    //FIXME 이중쿼리를 promise로 제대로 구현하는 방법?
    db.query('select book.Book_Name,story.* from book,story where story.Member_No=? group by story.Story_No' ,req.user.Member_No,(error,results)=>{
        if(error) console.log(error);
        // 데이터가 없다면
        if(results[0]===undefined){
            res.render('action_overview',{data:false});
        }else {
            story =results;
            for(let i = 0 ; i<story.length; i++){
                db.query('select * from story_memo where Story_No=?',story[i].Story_No,(error,results)=>{
                    if(error) console.log(error);
                    story[i].Story_Memo=results;
                    story_list.push(story[i]);
                    if(story_list.length === story.length){
                        JSON.stringify(story_list);
                        // console.log('스토리 리스트',story_list);
                        res.render('action_overview',{data:story_list});
                    }
                });
            }
        }

    });
};

exports.update_book_title=(req,res)=>{
    // 수정하려는 북의 넘버와 북타이틀을 불러온다
    console.log(req.body);
    let booktitle={
        Book_Name:req.body.Book_Name,
    };
    let sql='update into book set ? where Book_No=? and Member_No=?';
    db.query(sql,booktitle,req.body.Book_No,req.user.Member_No,(error,results)=>{
        if(error) console.log(error);
        if(results.affectedRows===0){
            // 바뀐 북이 없다는건 다른 사용자가 접근을 하려고 했다는것
            res.json({result:false,message:'잘못된 접근입니다.'});
        }else if(results.changedRows===0){
            res.json({result:false,message:'같은 내용입니다'});
        }else{
            console.log('book변경');
            res.json({result:true,message:'변경되었습니다.'})
        }
    });
};
//작업중
exports.update_book_public=(req,res)=>{
    console.log(req.body.Book_No);
    console.log(req.body.Book_Public);
};

exports.delete_story=(req,res)=>{
    db.query('delete from story where Story_No=?',req.body.Story_No,(error,results)=>{
        if(error) console.log(error);
        console.log(results);
        if(results.affectedRows===0){
            res.json({message:'데이터가 잘못됬거나, 없습니다',result:false});
        }else{
            res.json({message:'성공적으로 삭제되었습니다.',result:true});
        }
    })
};

// TODO book_public버튼 구현
exports.insert_book=(req,res)=>{
    const new_book={
        Member_No:req.user.Member_No,
        Book_Name:req.body.Book_Name,
        Book_Author:req.user.Member_Name,
        // Book_Public : req.body.Book_Public ? 1 : 0,
    };
    db.query('insert into book set ? ',new_book,(error,results)=>{
        if(error) console.log(error);
        console.log(results);
        res.json(results.insertId);
    });
};
exports.insert_story=(req,res)=>{
    const new_story={
        Book_No : req.body.Book_No,
        Member_No : req.user.Member_No,
        Story_Title : req.body.Story_Title,
        Story_Owner : req.user.Member_Name,
    };
    db.query('insert into story set ? ',new_story, (error)=>{
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
exports.insert_page=(req,res)=>{
    console.log(req.body);
    console.log('업로드된 파일',req.files);
    const sql = 'insert into page set ?';
    const page = {
        Story_No:req.body.Story_No,
        Member_No:req.user.Member_No,
        Page_Author:req.user.Member_Name,
        Page_Content:req.body.Page_Content,
        Page_Link:req.body.Page_Link,
    };
    db.beginTransaction((error)=>{
        if(error) throw error;
        db.query(sql,page,(error,results)=>{
            if(error){
                return db.rollback(()=>{throw error;});
            }
            const page_no = results.insertId;
            // if(!(req.files.Page_File)){
            //     // TODO : 확장자 검사
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
            if(req.files){
                for(let i=0;i<req.files.length;i++){
                    let imgdata={};
                    imgdata={
                        Page_No:page_no,
                        File_Fieldname:req.files[i].fieldname,
                        File_Path:req.files[i].path,
                        File_Originalname:req.files[i].originalname
                    };
                    db.query('insert into file set ?',imgdata,(error)=>{
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
    })
    // db.query(sql,page,(error,results)=>{
    //     if(error) console.log(error);
    //     const page_no=results.insertId;
    //     if(req.files[0]!==undefined){
    //         for(let i =0; i<req.files.length;i++){
    //             let imgdata = {
    //                 Page_No:page_no,
    //                 Image_Fieldname:req.files[i].fieldname,
    //                 Image_Path:req.files[i].path,
    //                 Image_Originalname:req.files[i].originalname
    //             };
    //             db.query('insert into image set ?',imgdata,(error)=>{
    //                 if(error) console.log(error);
    //                 if(i===req.files.length-1){
    //                     console.log('완료');
    //                     res.status(200).json({message:'complete'});
    //                 }
    //             })
    //         }
    //     }else{
    //         res.status(200).json({message:'complete(noimg)'});
    //     }
    // });
};

exports.action= (req,res)=> {
    let story = null;
    //FIXME : promise로 이중쿼리 구현
    db.query('select * from story where Member_No=?', req.user.Member_No, (error, results) => {
        if (error) console.log(error);
        // 데이터가 없다면
        if(results[0]===undefined){
            res.render('action_overview',{data:false});
        }else{
            story = results;
            for(let i=0;i<story.length;i++) {
                story[i].Story_Memo = [];
            }
            db.query('select story_memo.* ' +
                'from story,story_memo ' +
                'where story.Story_No=story_memo.Story_No and story.Member_No=?',req.user.Member_No, (error, results) => {
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
exports.history=(req,res)=>{
    // TODO 널값처리 해줘야
    let historydata = null;
    db.query('select book.Book_No,Book_Name,Book_Public ' +
        'from book ' +
        'where Member_No=?',req.user.Member_No,(error,results)=>{
        if(error) console.log(error);
        historydata=results;
        for(let i =0; i<historydata.length;i++){
            historydata[i].Story=[];
        }
        db.query('select Book_No,Story_No,Story_Title,Story_Owner,Story_DateStart,Story_DateEnd ' +
            'from story ' +
            'where Member_No=?',req.user.Member_No,(error,results)=>{
            if(error) console.log(error);
            for(let i=0;historydata.length;i++){
                for(let j=0;results.length;j++){
                    if(historydata[i].Book_No === results[j].Book_No){
                        historydata[i].Story.push(results[j]);
                    }
                }
                if(i===story.length-1){
                    res.json(historydata);
                }
            }
        });
    });


};
exports.timeline=(req,res)=>{
    let tldata=[];
    let sql = 'select book.Book_Name,story.Story_No,Story_Title,Page_No,Page_Content,Page_UpdateDate ' +
        'from story,page,book ' +
        'where book.Book_No=story.Book_No and page.Story_No=story.Story_No ' +
        'Order By page.Page_UpdateDate DESC';

    db.query(sql,(error,results)=>{
        if(results.length===0) res.render('action_timeline',{tldata:null});
        if(error) console.log(error);
        tldata=results;
        JSON.stringify(tldata);
        console.log(tldata);
        res.render('action_timeline',{tldata:tldata});
    })

};
exports.list_page=(req,res)=>{
    let page=null;
    const sql = "select book.Book_Name,story.Story_Title, story.Story_DateStart, page.* " +
        "from book,story,page " +
        "where book.Book_No=story.Book_No and story.Story_No = page.Story_No and page.Story_No=?";
    db.query(sql,req.params.id,(error,results)=>{
        // 페이지가 없을경우
        if(results.length===0)
        {
            db.query('select book.Book_Name,story.Story_Title,story.Story_DateStart ' +
                'from book,story ' +
                'where story.Story_No=? and story.Book_No=book.Book_No',req.params.id,(error,results)=>{
                if(error) console.log(error);
                res.render('story',
                    {   page:results,
                        Story_No: req.params.id});
            });
        }else{
            page=results;
            for(let i=0;i<page.length;i++){
                page[i].Imgdata=[];
            }
            // TODO :작업중
            db.query('select file.* ' +
                'from file,page ' +
                'where page.Member_No=? and file.Page_No=page.Page_No',req.user.Member_No,(error,results)=>{
                if(error) console.log(error);
                const filecount = results ? results.length : 0;
                for(let i=0;i<page.length;i++){
                    for(let j=0; j<filecount;j++){
                        if(page[i].Page_No===results[j].Page_No){
                            page[i].Imgdata.push(results[j]);
                        }
                    }
                    if(i===page.length-1){
                        page.push({Story_No : req.params.id});
                        // 함수의 종료를 선언하지 않으면 무한루프가 돌아버린다
                        return res.render('story',{page:page});
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
        // FIXME PAGE가 없을 경우 이 부분에서 문제가 발생할수 있음. if문에서 dbquery를 점프하게끔하기

    });
};

// exports.filedown=(req,res)=>{
//     fs.readFile(cwd+'/userfile/'+req.params.name,(error,data)=>{
//         if(error) console.log(error);
//         const filename = req.params.name;
//         const filepath = cwd+"/userfile/"+filename;
//         res.download(filepath);
//     });
// };
