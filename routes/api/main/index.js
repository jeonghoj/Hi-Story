/**
 * Created by Jeongho on 2017-05-13.
 */
const fs=require('fs');
const db=require('../../../config/db');
const router =require('express').Router();
const multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './tmp')
    },
    filename: function (req, file, cb) {
        cb(null,file.filename + '_'  + file.originalname + '_' + Date.now())
    }
});
const upload = multer({storage: storage,limits:{fileSize:100*1024*1024},
    });

const controller = require('./main_controller');
const passport = require('../../../config/passport');
router.get('/',(req,res)=>{
    fs.readFile('public/main_intro.html','utf8',(error,data)=>{
        res.send(data);
    });
});
router.get('/overview',(req,res)=>{
    // passport.authenticate('jwt',{session:false});
    // db.query('select Member_No from member where authID=?',req.user.authID,function (error,results) {
    //     if(error){
    //         console.log(error);
    //         return res.redirect('/');
    //     }
    // });
    // fs.readFile('public/list_book.html','utf8',function (err,data) {
    //     db.query('select * from book where Member_No=?',req.user.Member_No,function (err,results) {
    //         // console.log(results);
    //         res.send(ejs.render(data,{
    //             data: results}));
    //     });
    // });
    fs.readFile('public/list_book.html','utf8',(error,data)=>{
        res.send(data);
    });
    }
);
router.post('/list_story',
    passport.authenticate('jwt',{session:false}),
    (req,res)=>{
        let story = null;
        let story_list = [];
        //이중 db는 비동기작업때문에 하나만 실행되고 나머지는 나중에 실행된다 이 문제를 promise로 해결할 방법을 공부하자
        db.query('select * from story where Member_No=?',req.user.Member_No,(error,results)=>{
            if(error) console.log(error);
             story =results;
            for(let i = 0 ; i<story.length; i++){
                db.query('select * from story_memo where Story_No=?',story[i].Story_No,(error,results)=>{
                    if(error) console.log(error);
                    story[i].Story_Memo=results;
                    console.log('테스트',story[i]);
                    console.log(story[i].Story_Memo.length);
                    story_list.push(story[i]);
                    console.log('스토리 길이',story_list.length);
                    if(story_list.length === story.length){
                        console.log('스토리 리스트',story_list);
                        res.json(story_list);
                    }
                });
            }

        });


    });
router.post('/list_book',
    passport.authenticate('jwt',{session:false}),
    (req,res)=>{
    console.log(req.user);
    db.query('select * from book where Member_No=?',req.user.Member_No,function (error,results) {
        // console.log(results);
        if(error) console.log(error);
        res.json(results);
    });
});
router.get('/action',(req,res)=>{
    fs.readFile('public/action.html','utf8',(error,data)=>{
        res.send(data);
    })
});
router.get('/upload',(req,res)=>{
    fs.readFile('public/upload.html','utf8',(error,data)=>{
        res.send(data);
    })
});
// router.post('/upload',passport.authenticate('jwt',{session:false}),
//     upload.single('bookimg'),controller.upload);
router.post('/upload',passport.authenticate('jwt',{session:false}),
    upload.array('bookimg',3),controller.upload);

router.post('/uploaddebug',upload.single('bookimg'),(req,res)=>{
    console.log(req.body.bookname);
    console.log(req.file);
});

module.exports = router;