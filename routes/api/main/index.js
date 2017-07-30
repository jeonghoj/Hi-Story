/**
 * Created by Jeongho on 2017-05-13.
 */
const cwd = process.cwd();
const path=require('path');
const fs=require('fs');
const router =require('express').Router();
const controller = require('./controller_main');
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
const passport = require(cwd+'/config/passport');
//TODO 다른 사용자가 url로 다른 사용자의 글에 접근시 401 unauthorized 작업
router.get('/',controller.intro);
router.get('/signup',controller.signup);
router.post('/logout',controller.logout);
router.post('/check_idOverlap',controller.check_idOverlap);

router.get('/imageload',controller.imageload);

router.post('/list_book', passport.authenticate('jwtc',{session:false}),controller.list_book);

router.post('/update_book_info',passport.authenticate('jwtc',{session:false}),controller.update_book_info);
// router.post('/update_book_public',passport.authenticate('jwtc',{session:false}),controller.update_book_public);

router.post('/update_story_info',passport.authenticate('jwtc',{session:false}),controller.update_story_info);
router.post('/update_story_done',passport.authenticate('jwtc',{session:false}),upload.array('Page_Image',6),controller.update_story_done);

router.post('/update_page',passport.authenticate('jwtc',{session:false}),upload.array('Page_Image',6),controller.update_page);

router.post('/delete_book',passport.authenticate('jwtc',{session:false}),controller.delete_book);
router.post('/delete_story',passport.authenticate('jwtc',{session:false}),controller.delete_story);

router.post('/insert_book',passport.authenticate('jwtc',{session:false}),controller.insert_book);
router.post('/insert_story',passport.authenticate('jwtc',{session:false}),controller.insert_story);
router.post('/insert_page',passport.authenticate('jwtc',{session:false}),upload.array('Page_Image',6),controller.insert_page);

router.post('/insert_story_memo',passport.authenticate('jwtc',{session:false}),controller.insert_story_memo);
router.post('/update_story_memo',passport.authenticate('jwtc',{session:false}),controller.update_story_memo);
router.post('/delete_story_memo',passport.authenticate('jwtc',{session:false}),controller.delete_story_memo);

router.get('/action',passport.authenticate('jwtc',{session:false}),controller.action);
router.get('/history',passport.authenticate('jwtc',{session:false}),controller.history);
router.get('/timeline',passport.authenticate('jwtc',{session:false}),controller.timeline);
router.get('/story/:id',passport.authenticate('jwtc',{session:false}),controller.list_page);
router.get('/explore',passport.authenticate('jwtc',{session:false}),controller.explore);
router.get('/setting',passport.authenticate('jwtc',{session:false}),controller.setting);
//TODO : done url은 insert page에 done true 추가 done은 상시 edit 가능

// router.get('/filedown/:name',passport.authenticate('jwtc',{session:false}),controller.filedown);
// router.post('/insert_page',passport.authenticate('jwtc',{session:false}),
//     upload.fields([{ name: 'Page_File', maxCount: 1 }, { name: 'Page_Image', maxCount: 6 }]),controller.insert_page);

module.exports = router;