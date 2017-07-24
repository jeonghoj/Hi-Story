/**
 * Created by Jeongho on 2017-05-13.
 */
const path=require('path');
const cwd=process.cwd();
const fs=require('fs');
const router =require('express').Router();

const multer  = require('multer');
const storage = multer.diskStorage({
    destination:function(req, file, cb) {
        cb(null, './../userfile')
    },
});
const upload = multer({
    storage:storage,
    limits:{fileSize:100*1024*1024}
});

const controller = require('./controller_main');
const passport = require(cwd+'/config/passport');
//TODO 다른 사용자가 url로 다른 사용자의 글에 접근시 401 unauthorized 작업
// 헤더에 JWT 토큰  삽입
router.post('/action',passport.authenticate('jwth',{session:false}),controller.action);
router.post('/history',passport.authenticate('jwth',{session:false}),controller.history);

router.get('/timeline',passport.authenticate('jwth',{session:false}),controller.timeline);
router.post('/member_profile',passport.authenticate('jwth',{session:false}),controller.member_profile);
router.post('/update_member_profile',passport.authenticate('jwth',{session:false}),upload.single('Member_Profileimg'),controller.update_member_profile);

router.post('/insert_book',passport.authenticate('jwth',{session:false}),controller.insert_book);
router.post('/update_book',passport.authenticate('jwth',{session:false}),controller.update_book);
router.post('/delete_book',passport.authenticate('jwth',{session:false}),controller.delete_book);

router.post('/insert_story',passport.authenticate('jwth',{session:false}),controller.insert_story);
router.post('/update_story',passport.authenticate('jwth',{session:false}),controller.update_story);
router.post('/delete_story',passport.authenticate('jwth',{session:false}),controller.delete_story);

router.post('/insert_story_memo',passport.authenticate('jwth',{session:false}),controller.insert_story_memo);
router.post('/update_story_memo',passport.authenticate('jwth',{session:false}),controller.update_story_memo);
router.post('/delete_story_memo',passport.authenticate('jwth',{session:false}),controller.delete_story_memo);

router.post('/list_page',passport.authenticate('jwth',{session:false}),controller.list_page);
router.post('/insert_page',passport.authenticate('jwth',{session:false}),upload.array('Page_Image',6),controller.insert_page);
router.post('/update_page',passport.authenticate('jwth',{session:false}),upload.array('Page_Image',6),controller.update_page);

// todo 그냥 인풋 파일 하나에 여러개 파일 올리고, 순서 바뀌어도 인식하게끔하기 근데 이게 사용자가 더 알기 쉬울거같다
// router.post('/insert_page',passport.authenticate('jwth',{session:false}),
//     upload.fields([{ name: 'Page_File', maxCount: 1 }, { name: 'Page_Image', maxCount: 6 }]),controller.insert_page);
module.exports = router;