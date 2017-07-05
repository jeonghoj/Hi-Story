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

exports.imageload=(req,res)=>{
    console.log(req.params.name);
    fs.readFile('public/img/'+req.params.name,function (error,data) {
        if(error) {
            console.log(error);
        }
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.end(data);
    })
};

exports.list_book=(req,res)=>{
    console.log(req.user);
    db.query('select * from book where Member_No=?',req.user.Member_No,function (error,results) {
        if(error) console.log(error);
        res.json(results);
    });
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
exports.list_story= (req,res)=> {
    let story = null;
    let story_list = [];
    //FIXME 이중쿼리를 promise로 제대로 구현하는 방법?
    db.query('select * from story where Member_No=?', req.user.Member_No, (error, results) => {
        if (error) console.log(error);
        story = results;
        for (let i = 0; i < story.length; i++) {
            db.query('select * from story_memo where Story_No=?', story[i].Story_No, (error, results) => {
                if (error) console.log(error);
                story[i].Story_Memo = results;
                story_list.push(story[i]);
                if (story_list.length === story.length) {
                    res.json(story_list);
                }
            });
        }
    });
};
exports.insert_story=(req,res)=>{
    console.log(req.body);
    const new_story={
        Book_No : req.body.Book_No,
        Member_No : req.user.Member_No,
        Story_Title : req.body.Story_Title,
        Story_Owner : req.user.Member_Name,
    };
    console.log('뉴스토리',new_story);
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



exports.list_page=(req,res)=>{
    let page=null;
    let list_page=[];
    const sql = "select book.Book_Name,story.Story_Title, story.Story_DateStart, page.* " +
        "from book,story,page " +
        "where book.Book_No=story.Book_No and story.Story_No = page.Story_No=?";
    db.query(sql,req.params.id,(error,results)=>{
        console.log(results.length);
        // 페이지가 없을경우
        if(results.length===0)
        {
            db.query('select book.Book_Name,story.Story_Title,story.Story_DateStart ' +
                'from book,story ' +
                'where story.Story_No=1 and story.Book_No=book.Book_No',req.params.id,(error,results)=>{
                if(error) console.log(error);
                console.log(results);
                res.render('story',
                    {   page:results,
                        Story_No: req.params.id});
            });

        }
        // FIXME PAGE가 없을 경우 이 부분에서 문제가 발생할수 있음. if문에서 dbquery를 점프하게끔하기
        page=results;
        for(let i=0;i<page.length;i++){
            let Page_No = page[i].Page_No;
            db.query('select * from image where Page_No=?',Page_No,(error,results)=>{
                if(error) console.log(error);
                page[i].Imgdata=results;
                list_page.push(page[i]);
                if(list_page.length===page.length){
                    list_page.push({Story_No : req.params.id});
                    JSON.stringify(list_page);
                    console.log(list_page);
                    res.render('story',{page:list_page});
                }
            })

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
        Page_Content:Page_Content,
    };
    db.query(sql,page,(error,results)=>{
        if(error) console.log(error);
        const page_no=results.insertId;
        if(req.files[0]!==undefined){
            for(let i =0; i<req.files.length;i++){
                let imgdata = {
                    Page_No:page_no,
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
exports.action=(req,res)=>{
    let story = null;
    let story_list = [];
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
exports.timeline=(req,res)=>{
    let tldata=[];
    let sql = 'select book.Book_Name,story.Story_No,Story_Title,Page_No,Page_Content,Page_Date ' +
        'from story,page,book ' +
        'where book.Book_No=story.Book_No and page.Story_No=story.Story_No ' +
        'Order By page.Page_Date DESC';

    db.query(sql,(error,results)=>{
        if(results.length===0) res.render('action_timeline',{tldata:null});
        if(error) console.log(error);
        tldata=results;
        JSON.stringify(tldata);
        console.log(tldata);
        res.render('action_timeline',{tldata:tldata});
    })

};