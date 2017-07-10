/**
 * Created by Jeongho on 2017-05-11.
 */
const cwd = process.cwd();
const router =require('express').Router();
const fs=require('fs');
const passport = require(cwd+'/config/passport');
const controller = require('./controller_auth');
router.post('/register',controller.register);
router.post('/login',controller.login);
module.exports = router;