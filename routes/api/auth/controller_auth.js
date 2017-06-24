/**
 * Created by Jeongho on 2017-05-11.
 */
// const passport = require('../../../config/passport');
const db = require('../../../config/db');
const bkfd2Password = require("pbkdf2-password");
const hasher= bkfd2Password();
const jwt = require('jsonwebtoken');
const config = require("../../../config/config.js");

exports.register = (req,res) => {
    console.log(req.body);
    const {userid, password, realname} = req.body;
    hasher({password: password}, (error, pass, salt, hash) => {
        const user = {
            authID: 'jwt:' + userid,
            Member_ID: userid,
            Member_PW: hash,
            Member_salt: salt,
            Member_Name: realname
        };
        const sql = 'insert into member set ?';
        db.query(sql, user, (error) => {
            if (error) {
                console.log(error);
                res.status(500); //정확히 알아볼것
            } else {
                console.log('성공!');
                res.status(200).json({message : "success register"});
                //성공스테이터스 or 리다이렉트
            }
        });
    });
};

exports.login = (req,res) => {
    console.log('로그인',req.body);
    const { userid , password } = req.body; // 웹에서 널값 못보내도록 막기처리 해줘야
    const sql='select * from member where Member_ID=?';
    db.query(sql,[userid],(error,results) => {
        if(error){
            console.log(error);
        }
        const user = results[0];
        if(!user){
            return res.status(401).json({message:"no such user found"});
        }
        return hasher({password:password,salt:user.Member_salt},(error, pass, salt, hash) => {
            if(hash === user.Member_PW) {
                // id로 사람 구분
                const payload = {authID: 'jwt:'+user.Member_ID};
                const token = jwt.sign(payload, config.secret,{expiresIn: '30m'});
                console.log('login',token);
                res.cookie('jwt',token);
                res.redirect('/action');

                // res.json({message: "ok", token: token});
            } else {
                res.status(401).json({message:"passwords did not match"});
            }
        });
    });
};

exports.sendmail=(req,res)=>{
    const nodemailer=require('nodemailer');

    let transporter=nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'historygdrive@gmail.com',
            pass: '20170406'
        }
    });
    let mailoptions={
        from:'historygdrive@gmail.com',
        to:'jjhh3079@gmail.com',
        subject:'이메일 제목',
        text:'테스트',
    };
    transporter.sendMail(mailoptions,function (err,info) {
        if(err) console.log(err);
        console.log('Mail send Success -',info.response);
        transporter.close();
        res.status(200);
    })
};