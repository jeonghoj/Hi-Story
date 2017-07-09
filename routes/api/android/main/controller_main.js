/**
 * Created by Jeongho on 2017-05-13.
 */
const cwd = process.cwd();
const db=require(cwd+'/config/db');
const fs=require('fs');
exports.action= (req,res)=> {
    let story = null;
    //FIXME : promise로 이중쿼리 구현
    db.query('select story.Book_No,Book_Name,Book_Public,Story_No,Story_Title,Story_DateStart,Story_DateEnd,Story_Citation,Story_Follow,Story_View,Story_Priority ' +
        'from story,book ' +
        'where story.Member_No=? and story.Book_No=book.Book_No', req.user.Member_No, (error, results) => {
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
                        res.json(story);
                    }
                }

            });
        }
    });
};
exports.history=(req,res)=>{
    let historydata=null;
    let sql = 'select book.Book_No,Book_Name,Book_Public ' +
        'from book' +
        'where Member_No=?';
    db.query('select book.Book_No,Book_Name,Book_Public from book where Member_No=?',req.user.Member_No,(error,results)=>{
        if(error) console.log(error);
        historydata=results;
        for(let i=0;i<historydata.length;i++){
            db.query('select Story_No,Story_Title,Story_Owner,Story_DateStart,Story_DateEnd ' +
                'from story ' +
                'where Book_No=?',historydata[i].Book_No,(error,results)=>{
                if(error) console.log(error);
                historydata[i].Story=results;
                if(i===historydata.length-1){
                    res.json(historydata);
                }
            });
        }

    });
};
exports.username=(req,res)=>{
    res.json({Member_Name:req.user.Member_Name});
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

exports.delete_story=(req,res)=>{
    console.log(req.body);
    db.query('delete from story where Member_No=? and Story_No=?',[req.user.Member_No,req.body.Story_No],(error,results)=>{
        if(error) console.log(error);
        console.log(results);
        if(results.affectedRows===0){
            res.json({message:'error',result:false});
        }else{
            res.json({message:'success',result:true});
        }
    })
};
exports.list_page=(req,res)=>{
    let page=null;
    let list_page=[];
    const sql = "select book.Book_Name,story.Story_Title, story.Story_DateStart, page.* " +
        "from book,story,page " +
        "where book.Book_No=story.Book_No and story.Story_No = page.Story_No=?";
    db.query(sql,req.params.id,(error,results)=>{
        // 페이지가 없을경우
        if(results.length===0)
        {
            db.query('select book.Book_Name,story.Story_Title,story.Story_DateStart ' +
                'from book,story ' +
                'where story.Story_No=1 and story.Book_No=book.Book_No',req.params.id,(error,results)=>{
                if(error) console.log(error);
                res.render('story',
                    {   page:results,
                        Story_No: req.params.id});
            });

        }
        // FIXME PAGE가 없을 경우 이 부분에서 문제가 발생할수 있음. if문에서 dbquery를 점프하게끔하기
        page=results;
        for(let i=0;i<page.length;i++){
            let Page_No = page[i].Page_No;
            db.query('select * from image where Image_Fieldname=? and No=?','Page_Image',Page_No,(error,results)=>{
                if(error) console.log(error);
                page[i].Imgdata=results;
                list_page.push(page[i]);
                if(list_page.length===page.length){
                    list_page.push({Story_No : req.params.id});
                    JSON.stringify(list_page);
                    res.render('story',{page:list_page});
                }
            })

        }
    });
};

exports.insert_book=(req,res)=>{
    // TODO: Book_Public들어가야함!
    console.log('북삽입',req.body);
    const new_book={
        Member_No:req.user.Member_No,
        Book_Name:req.body.Book_Name,
        Book_Author:req.user.Member_Name,
        // Book_Public : req.body.Book_Public ? 1 : 0,
    };
    db.query('insert into book set ? ',new_book,(error,results)=>{
        if(error) console.log(error);
        db.query('select Book_No,Book_Name,Book_Date,Book_Public from book where Book_No=?',results.insertId,(error,results)=>{
            res.json(results);
        });
    });
};
exports.insert_story=(req,res)=>{
    const new_story={
        Book_No : req.body.Book_No,
        Member_No : req.user.Member_No,
        Story_Title : req.body.Story_Title,
        Story_Owner : req.user.Member_Name,
    };
    db.query('insert into story set ? ',new_story, (error,results)=>{
        console.log(results);
        db.query('select Story_No,Story_DateStart,Story_Citation,Story_Follow,Story_View ' +
            'from story ' +
            'where Story_No=?',results.insertId,(error,results)=>{
            if(error){
                console.log(error);
                res.json({result:false, message:'스토리 삽입 실패!'});
            }
            else{
                console.log('스토리 삽입 성공!');
                res.json({result:true, message:'스토리 삽입 성공!',Story_No:results[0]});
            }
        });

    });
};
exports.insert_page=(req,res)=>{
    //TODO 2바이트 짜른 데이터를 Story_No는 parseInt해준다. 안드로이드만 ***
    console.log(req.body);
    console.log('업로드된 파일',req.files);
    let Story_No=req.body.Story_No;
    let Page_Content=req.body.Page_Content;
    Story_No=parseInt(Story_No.slice(2));
    Page_Content=Page_Content.slice(2);
    console.log('storyno',Story_No);
    console.log('pagecon',Page_Content);


    const sql = 'insert into page set ?';
    const page = {
        Story_No:Story_No,
        Member_No:req.user.Member_No,
        Page_Author:req.user.Member_Name,
        Page_Content:Page_Content,
        Page_Link:req.body.Page_Link
    };
    db.query(sql,page,(error,results)=>{
        if(error) console.log(error);
        const page_no=results.insertId;
        if(req.files[0]!==undefined){
            for(let i =0; i<req.files.length;i++){
                let imgdata = {
                    No:page_no,
                    Image_Fieldname:req.files[i].fieldname,
                    Image_Path:req.files[i].path,
                    Image_Originalname:req.files[i].originalname
                };
                db.query('insert into image set ?',imgdata,(error)=>{
                    if(error) console.log(error);
                    if(i===req.files.length-1){
                        console.log('완료');
                        res.status(200).json({message:'complete'});
                    }
                })
            }
        }else{
            res.status(200).json({message:'complete(noimg)'});
        }
    });
};
//TODO 값이 없을때 서버, 웹에서의 처리
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