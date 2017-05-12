/**
 * Created by Jeongho on 2017-05-11.
 */
const router =require('express').Router();
const auth=require('./auth');

router.use('/auth',auth);

module.exports=router;