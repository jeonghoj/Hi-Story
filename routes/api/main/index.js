/**
 * Created by Jeongho on 2017-05-13.
 */
const path=require('path');
const fs=require('fs');
const router =require('express').Router();

const multer  = require('multer');
const storage = multer.diskStorage({
    destination:function(req, file, cb) {
        cb(null, './public/img')
    },
    // 파일네임문제
    filename: function (req, file, cb) {
        const time = new Date().toISOString().slice(0, 19).replace('T', ' ');
        cb(null,Date.now()+ '-' + file.fieldname + '-' + file.originalname +'-');
    }
});
const upload = multer({
    storage:storage,
    limits:{fileSize:100*1024*1024}
});

const controller = require('./controller_main');
const passport = require('../../../config/passport');

router.post('/list_book', passport.authenticate('jwt',{session:false}),controller.list_book);
router.post('/list_story', passport.authenticate('jwt',{session:false}),controller.list_story);

router.post('/insert_story',passport.authenticate('jwt',{session:false}),controller.insert_story);
router.get('/action',passport.authenticate('jwt',{session:false}),controller.action);
router.get('/action/story/:id',controller.list_page);

// todo 그냥 인풋 파일 하나에 여러개 파일 올리고, 순서 바뀌어도 인식하게끔하기 근데 이게 사용자가 더 알기 쉬울거같다
router.post('/insert_page',passport.authenticate('jwt',{session:false}),
    upload.fields([
        {name:'page_image_1',maxcount:1},{name:'page_image_2'},{name:'page_image_3'},{name:'page_image_4'},{name:'page_image_5'},
    ]),controller.insert_page);

module.exports = router;