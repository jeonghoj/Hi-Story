/**
 * Created by Jeongho on 2017-05-13.
 */
const cwd = process.cwd();
const path=require('path');
const fs=require('fs');
const router =require('express').Router();

const multer  = require('multer');
const storage = multer.diskStorage({
    destination:function(req, file, cb) {
        cb(null, './userfile')
    },
    // 파일네임문제
    // filename: function (req, file, cb) {
    //     const time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    //     cb(null,Date.now()+ '-' + file.fieldname + '-' + file.originalname +'-');
    // }
});
const upload = multer({
    storage:storage,
    limits:{fileSize:100*1024*1024}
});
const controller = require('./controller_main');
const passport = require(cwd+'/config/passport');
//TODO 다른 사용자가 url로 다른 사용자의 글에 접근시 401 unauthorized 작업
//FIXME 안드로이드 인증방식은 아예 따로 둬야한다, 두개 놓으니까 먼저꼐 인식되서 인증이 되지않는다
router.get('/',controller.intro);
router.get('/signup',controller.signup);
router.get('/logout',controller.logout);
// TODO 그 사용자만 이미지 로드할수있게 수정
// router.get('/filedown/:name',passport.authenticate('jwtc',{session:false}),controller.filedown);
router.get('/imageload/userfile/:name',passport.authenticate('jwtc',{session:false}),controller.imageload);

router.get('/action',passport.authenticate('jwtc',{session:false}),controller.action);
router.get('/timeline',passport.authenticate('jwtc',{session:false}),controller.timeline);
router.get('/story/:id',passport.authenticate('jwtc',{session:false}),controller.list_page);

router.post('/list_book', passport.authenticate('jwtc',{session:false}),controller.list_book);
router.post('/list_story', passport.authenticate('jwtc',{session:false}),controller.list_story);

router.post('/delete_story',passport.authenticate('jwtc',{session:false}),controller.delete_story);


router.post('/insert_book',passport.authenticate('jwtc',{session:false}),controller.insert_book);
router.post('/insert_story',passport.authenticate('jwtc',{session:false}),controller.insert_story);
// router.post('/insert_page',passport.authenticate('jwtc',{session:false}),
//     upload.fields([{ name: 'Page_File', maxCount: 1 }, { name: 'Page_Image', maxCount: 6 }]),controller.insert_page);
router.post('/insert_page',passport.authenticate('jwtc',{session:false}),
    upload.array('Page_Image',6),controller.insert_page);
//TODO : done url은 insert page에 done true 추가 done은 상시 edit 가능
module.exports = router;