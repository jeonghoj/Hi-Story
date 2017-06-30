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
//TODO 다른 사용자가 url로 다른 사용자의 글에 접근시 401 unauthorized 작업
//FIXME 안드로이드 인증방식은 아예 따로 둬야한다, 두개 놓으니까 먼저꼐 인식되서 인증이 되지않는다
// router.post('/list_book', passport.authenticate('jwth',{session:false}),controller.list_book);
router.post('/list_book', passport.authenticate('jwtc',{session:false}),controller.list_book);
router.post('/list_story', passport.authenticate('jwtc',{session:false}),controller.list_story);

router.post('/insert_story',passport.authenticate('jwtc',{session:false}),controller.insert_story);

router.get('/action',passport.authenticate('jwtc',{session:false}),controller.action);
router.get('/action/story/:id',passport.authenticate('jwtc',{session:false}),controller.list_page);
router.get('/action/timeline',passport.authenticate('jwtc',{session:false}),controller.timeline);

// todo 그냥 인풋 파일 하나에 여러개 파일 올리고, 순서 바뀌어도 인식하게끔하기 근데 이게 사용자가 더 알기 쉬울거같다
router.post('/insert_page',passport.authenticate('jwtc',{session:false}),
    upload.array('page_image',5),controller.insert_page);

module.exports = router;