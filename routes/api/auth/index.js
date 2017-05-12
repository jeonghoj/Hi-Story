/**
 * Created by Jeongho on 2017-05-11.
 */
const fs=require('fs');
const router =require('express').Router();
const controller = require('./auth.controller');
const passport = require('../../../config/passport');

router.get('/register',(req,res)=>{
    fs.readFile('public/auth_register.html','utf8',(error,data) => {
        res.send(data);
    });
});
router.get('/login',(req,res)=>{
    fs.readFile('public/auth_login.html','utf8',(error,data) => {
        res.send(data);
    });
});
router.get('/secret',passport.authenticate('jwt',{session:false}),(req,res)=>{
    res.json('ok!');
});
router.post('/register',controller.register);
router.post('/login',controller.login);

module.exports = router;