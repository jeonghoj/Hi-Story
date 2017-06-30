/**
 * Created by Jeongho on 2017-05-11.
 */
// const passport = require('../../../config/passport');
const db = require('../../../config/db');
const bkfd2Password = require("pbkdf2-password");
const hasher= bkfd2Password();
const jwt = require('jsonwebtoken');
const config = require("../../../config/config.js");
const nodemailer=require('nodemailer');
let transporter=nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'historygdrive@gmail.com',
        pass: '20170406'
    }
});
exports.register = (req,res) => {
    console.log(req.body);
    const {userid, password, realname} = req.body;
    let verifycode=randomString();
    hasher({password: password}, (error, pass, salt, hash) => {
        const user = {
            authID: 'jwt:' + userid,
            Member_ID: userid,
            Member_PW: hash,
            Member_salt: salt,
            Member_Name: realname,
            Member_VerifyCode:verifycode,
            Member_EmailVerified:0,
        };
        const sql = 'insert into member set ?';
        db.query(sql, user, (error) => {
            if (error) {
                console.log(error);
                res.status(500); //정확히 알아볼것
            } else {
                let mailoptions={
                    from:'historygdrive@gmail.com',
                    to:'jjhh3079@gmail.com',
                    subject:'Hi-Story 이메일 인증을 완료해 주세요',
                    text:'회원가입을 완료하려면 http://127.0.0.1/auth/verifyemail?verifycode='+verifycode,
                };
                transporter.sendMail(mailoptions,function (err,info) {
                    if(err) console.log(err);
                    console.log('Mail send Success -',info.response);
                    transporter.close();
                    res.status(200).json({message : "success register! please verify your email"});
                });
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
                if(user.Member_EmailVerified===0)
                {
                    console.log('아직 이메일 인증이 되지 않은 회원입니다');
                }else {
                    // id로 사람 구분
                    const payload = {authID: 'jwt:'+user.Member_ID};
                    const token = jwt.sign(payload, config.secret,{expiresIn: '9000m'});
                    console.log('login',token);
                    res.cookie('jwt',token);
                    res.redirect('/action');
                    // res.json({message: "ok", token: token});
                }

            } else {
                res.status(401).json({message:"passwords did not match"});
            }
        });
    });
};

exports.verifyemail=(req,res)=>{
    console.log(req.params.code);
    let verifycode = req.params.code;
    let sql = 'update member set Member_EmailVerified=1 where Member_VerifyCode=?';
    db.query(sql,verifycode,(error,result)=>{
        console.log(result);
        if(error) console.log(error);

        if(result.affectedRows===0){
            console.log('데이터없거나 잘못된 접근');
        }else if(result.changedRows===0){
            console.log('이미 이메일 인증이 되었습니다. 로그인 해주세요');
            res.redirect('/');
        }else{
            console.log('이메일 인증이 완료 되었습니다. 로그인 해주세요');
            res.redirect('/');
        }
    })
};

function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 18;
    var randomstring = '';
    for (var i=0; i<string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
//document.randform.randomfield.value = randomstring;
    return randomstring;
}