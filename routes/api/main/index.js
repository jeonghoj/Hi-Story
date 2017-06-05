/**
 * Created by Jeongho on 2017-05-13.
 */
const fs=require('fs');
const db=require('../../../config/db');
const router =require('express').Router();
const multer  = require('multer');
const storage = multer.diskStorage({
    destination:function(req, file, cb) {
        cb(null, './tmp')
    },
    filename: function (req, file, cb) {
        const time = new Date().toISOString().slice(0, 19).replace('T', ' ');
        cb(null,time + '_' + file.fieldname + '_' +file.originalname)
    }
});
const upload = multer({
    storage:storage,
    limits:{fileSize:100*1024*1024}
});
// const upload = multer({storage: storage,limits:{fileSize:100*1024*1024},
//     });
const controller = require('./main_controller');
const passport = require('../../../config/passport');
router.get('/',(req,res)=>{
    fs.readFile('public/main_intro.html','utf8',(error,data)=>{
        res.send(data);
    });
});
router.get('/overview',(req,res)=>{
    fs.readFile('public/story.html','utf8',(error,data)=>{
        res.send(data);
    });
});
router.post('/list_story', passport.authenticate('jwt',{session:false}),
    (req,res)=>{
        let story = null;
        let story_list = [];
        //FIXME 이중쿼리를 promise로 제대로 구현하는 방법?
        db.query('select * from story where Member_No=?',req.user.Member_No,(error,results)=>{
            if(error) console.log(error);
             story =results;
            for(let i = 0 ; i<story.length; i++){
                db.query('select * from story_memo where Story_No=?',story[i].Story_No,(error,results)=>{
                    if(error) console.log(error);
                    story[i].Story_Memo=results;
                    story_list.push(story[i]);
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

router.post('/insert_book',passport.authenticate('jwt',{session:false}),
    (req,res)=>{
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
    });
// router.get('/action',(req,res)=>{
//     // console.log(datetest);
//     // fs.readFile('public/action.html','utf8',(error,data)=>{
//     //     res.send(data);
//     // })
// });
router.get('/action',passport.authenticate('jwt',{session:false}),
    (req,res)=>{
        let story = null;
        let story_list = [];
        //FIXME 이중쿼리를 promise로 제대로 구현하는 방법?
        db.query('select * from story where Member_No=?',req.user.Member_No,(error,results)=>{
            if(error) console.log(error);
            story =results;
            for(let i = 0 ; i<story.length; i++){
                db.query('select * from story_memo where Story_No=?',story[i].Story_No,(error,results)=>{
                    if(error) console.log(error);
                    story[i].Story_Memo=results;
                    story_list.push(story[i]);
                    if(story_list.length === story.length){
                        console.log('스토리 리스트',story_list);
                        JSON.stringify(story_list);
                        res.render('action',{data:story_list});
                    }
                });
            }
        });

});
router.get('/action/story/:id',(req,res)=>{
    console.log(req.params.id);
    var sql = "select book.Book_Name, page.Story_No, page.* " +
        "from book,story,page " +
        "where book.Book_No=story.Book_No and story.Story_No = page.Story_No=?";
    db.query(sql,req.params.id,(error,results)=>{
        JSON.stringify('페이지',results);
        console.log(results);
        res.render('story',{page:results});
    });

});
// router.get('/action/story',(req,res)=>{
//     fs.readFile('public/story.html','utf8',(error,data)=>{
//         res.send(data);
//     })
// });
router.post('/list_page',passport.authenticate('jwt',{session:false}),
    (req,res)=> {
        console.log(req.user);
        db.query('select * from book where Member_No=?', req.user.Member_No, function (error, results) {
            // console.log(results);
            if (error) console.log(error);
            res.json(results);
        });
});
// upload.array('image',5)
// passport.authenticate('jwt',{session:false}),
router.post('/insert_page',
    upload.fields([
        {name:'page_image_1'},{name:'page_image_2'},{name:'page_image_3'},{name:'page_image_4'},{name:'page_image_5'},
    ]),(req,res)=>{
    console.log('파일들',req.files);
    res.end('업로드 완료');
});
router.post('/test',(req,res)=>{
    console.log(req.body);
});

// router.post('/upload',passport.authenticate('jwt',{session:false}),
//     upload.array('bookimg',3),controller.upload);

// router.post('/uploaddebug',upload.single('bookimg'),(req,res)=>{
//     console.log(req.body.bookname);
//     console.log(req.file);
// });

module.exports = router;