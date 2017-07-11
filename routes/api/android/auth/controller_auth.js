/**
 * Created by Jeongho on 2017-05-11.
 */
// const passport = require('../../../config/passport');
// require에는 상대경로만 들어가므로 currentworkingdirectory를 추가한다
const cwd = process.cwd();
const db = require(cwd+"/config/db");
const bkfd2Password = require("pbkdf2-password");
const hasher= bkfd2Password();
const jwt = require("jsonwebtoken");
const config = require(cwd+"/config/config");
const emailaccount=require(cwd+'/config/emailaccount');
const nodemailer=require('nodemailer');
let transporter=nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: emailaccount.emailid,
        pass: emailaccount.emailpw
    }
});
exports.register = (req,res) => {
    const {userid, password, realname} = req.body;
    let emailtoken = jwt.sign({Member_ID:userid},config.secret,{expiresIn: '300m'});
    hasher({password: password}, (error, pass, salt, hash) => {
        const user = {
            authID: 'jwt:' + randomString(),
            Member_ID: userid,
            Member_PW: hash,
            Member_salt: salt,
            Member_Name: realname,
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
                    to:userid,
                    subject:'Hi-Story 이메일 인증을 완료해 주세요',
                    text:'회원가입을 완료하려면 http://127.0.0.1/auth/verifyemail?emailtoken='+emailtoken,
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
    // TODO 웹에서 널값 못보내도록 막기처리 해줘야
    const { userid , password } = req.body;
    const sql='select * from member where Member_ID=?';
    db.query(sql,[userid],(error,results) => {
        if(error) console.log(error);
        const user = results[0];
        if(!user){
            return res.status(401).json({message:"no such user found"});
        }
        return hasher({password:password,salt:user.Member_salt},(error, pass, salt, hash) => {
            if(hash === user.Member_PW) {
                if(user.Member_EmailVerified===0)
                {
                    console.log('아직 이메일 인증이 되지 않은 회원입니다');
                    res.json({message:"email not verified, please check your email"});
                }else {
                    // id로 사람 구분
                    const payload = {authID: user.authID};
                    const token = jwt.sign(payload, config.secret,{expiresIn: '9000m'});
                    console.log('login',token);
                    res.json({message: "ok", token: token});
                }

            } else {
                res.status(401).json({message:"passwords did not match"});
            }
        });
    });
};

function randomString() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    const string_length = 18;
    let randomstring = '';
    for (let i=0; i<string_length; i++) {
        let rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;
}