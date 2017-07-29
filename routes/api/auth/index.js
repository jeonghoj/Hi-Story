/**
 * Created by Jeongho on 2017-05-11.
 */
const cwd=process.cwd();
const router =require('express').Router();
const fs=require('fs');
const passport = require(cwd+'/config/passport');
const controller = require('./controller_auth');

router.post('/register',controller.register);
router.post('/login',controller.login);

router.get('/verifyemail',controller.verifyemail);

router.get('/find_PW',controller.find_PW_page);
router.get('/new_PW',controller.new_PW_page);

router.post('/find_PW',controller.find_PW);
router.post('/new_PW',controller.new_PW);
router.post('/member_new_PW',passport.authenticate('jwtc',{session:false}),controller.member_new_PW);

module.exports = router;