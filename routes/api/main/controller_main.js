/**
 * Created by Jeongho on 2017-05-13.
 */
const path=require('path');
const db=require('../../../config/db');
const fs=require('fs');
exports.list_book=(req,res)=>{
    console.log(req.user);
    db.query('select * from book where Member_No=?',req.user.Member_No,function (error,results) {
        if(error) console.log(error);
        res.json(results);
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
    const new_story={
        Book_No : req.body.Book_No,
        Member_No : req.user.Member_No,
        Story_Title : req.body.Story_Title,
        Story_Owner : req.user.Member_Name,
        Story_Public : req.body.Story_Public ? 1 : 0,
    };
    console.log('뉴스토리',new_story);
    db.query('insert into story set ? ',new_story, (error)=>{
        if(error){
            console.log(error);
            res.json({message:'fail!'});
        }
        else{
            console.log('스토리 삽입 성공!');
            res.json({message:'ok!'});
        }
    });
};

exports.action=(req,res)=>{
    let story = null;
    let story_list = [];
    //FIXME 이중쿼리를 promise로 제대로 구현하는 방법?
    db.query('select book.Book_Name,story.* from book,story where story.Member_No=? group by story.Story_No' ,req.user.Member_No,(error,results)=>{
        if(error) console.log(error);
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
    });
};
exports.list_page=(req,res)=>{
    let page=null;
    let list_page=[];
    const sql = "select book.Book_Name, page.Story_No, page.* " +
        "from book,story,page " +
        "where book.Book_No=story.Book_No and story.Story_No = page.Story_No=?";
    db.query(sql,req.params.id,(error,results)=>{
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
        Page_Content:req.body.page_content,
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

exports.timeline=(req,res)=>{
    let tldata=[];
    let sql = 'select story.Story_No,Story_Title,Page_No,Page_Content,Page_Date ' +
        'from story,page ' +
        'where page.Story_No=story.Story_No ' +
        'Order By page.Page_Date DESC ';

    db.query(sql,(error,results)=>{
        if(error) console.log(error);
        tldata=results;
        JSON.stringify(tldata);
        res.render('action_timeline',{tldata:tldata});
    })

};