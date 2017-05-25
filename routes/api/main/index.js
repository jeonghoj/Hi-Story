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
router.post('list_story',
    passport.authenticate('jwt',{session:false}),
    (req,res)=>{
        db.query('select * from story where Member_No=?',req.user.Member_No,function (error,results) {
            if(error) console.log(error);
            res.json(results);
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
router.get('/action/')
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