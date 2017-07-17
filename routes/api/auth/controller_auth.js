/**
 * Created by Jeongho on 2017-05-11.
 */
const cwd = process.cwd();
const db = require(cwd+'/config/db');
const bkfd2Password = require("pbkdf2-password");
const hasher= bkfd2Password();
const jwt = require('jsonwebtoken');
const config = require(cwd+"/config/config.js");
const emailaccount=require(cwd+'/config/emailaccount');
const nodemailer=require('nodemailer');
const fs=require('fs');
let transporter=nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: emailaccount.emailid,
        pass: emailaccount.emailpw
    }
});
exports.register = (req,res) => {
    console.log(req.body);
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
        db.query('insert into member set ?',[user],(error) => {
            if (error) {
                console.log(error);
                res.status(500); //정확히 알아볼것
            } else {
                const defaultimg={
                    No:results.insertId,
                    Image_Fieldname:'Member_Profileimg',
                    Image_Path:'public/img/logo/logo.png',
                    Image_Originalname:'defaultimg'
                };
                db.query('insert into image set ?',[defaultimg],(error,results)=> {
                    if(error) console.log(error);
                    let mailoptions={
                        from:'historygdrive@gmail.com',
                        to:userid,
                        // to:user.Member_ID,
                        subject:'Hi-Story 이메일 인증을 완료해 주세요',
                        text:'회원가입을 완료하려면 https://history-dcy.com/auth/verifyemail?emailtoken='+emailtoken,
                    };
                    transporter.sendMail(mailoptions,function (err,info) {
                        if(err) console.log(err);
                        console.log('Mail send Success -',info.response);
                        transporter.close();
                        res.status(200).json({message : "success register! please verify your email"});
                    });
                });

            }
        });
    });
};
exports.login = (req,res) => {
    console.log('로그인',req.body);
    const { userid , password } = req.body; // 웹에서 널값 못보내도록 막기처리 해줘야
    db.query('select * from member where Member_ID=?',[userid],(error,results) => {
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
                    const payload = {authID: user.authID};
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
    const emailtoken=req.query.emailtoken;
    jwt.verify(emailtoken,config.secret,(error,decoded)=>{
        if(error) console.log(error);
        if(decoded===undefined){
            res.json({message:'토큰이 만료되었거나 잘못된 접근입니다.',result:false});
        }else{
            // 이메일 인증 true 값으로 설정
            db.query('update member set Member_EmailVerified=1 where Member_ID=?',
                [decoded.Member_ID],(error,result)=>{
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
            });
        }
    });
};
exports.find_PW_page=(req,res)=>{
    fs.readFile('views/find-PW.html','utf8',(error,data)=>{
        res.send(data);
    });
};
exports.new_PW_page=(req,res)=>{
    fs.readFile('views/new-PW.html','utf8',(error,data)=>{
        res.send(data);
    });
};
exports.find_PW=(req,res)=>{
    const payload = {Member_ID: req.body.userid};
    const token = jwt.sign(payload, config.secret ,{expiresIn: '120m'});
    console.log(token);
    let mailoptions={
        from:'historygdrive@gmail.com',
        to:'jjhh3079@gmail.com',
        subject:'비밀번호 초기화',
        text:'비밀번호를 초기화하려면 이 링크로 접속해주세요. https://history-dcy.com/auth/new_PW?memberinfo='+token,
    };
    transporter.sendMail(mailoptions,(err,info) => {
        if(err) console.log(err);
        console.log('Mail send Success -',info.response);
        transporter.close();
        res.status(200).json({message : '비밀번호 초기화 이메일을 발송했습니다!'});
    });
};
exports.new_PW=(req,res)=>{
    // TODO 웹에서 Get으로 전달된 토큰을 받아서 같이 보내준다.
    const token=req.body.token;
    const newpassword=req.body.Member_PW;
    jwt.verify(token,config.secret,(error,decoded)=>{
        if(error) console.log(error);
        if(decoded===undefined){
            res.json({message:'잘못된 토큰입니다. 비밀번호 초기화를 다시 진행해주세요',result:false});
        }else{
            hasher({password: newpassword}, (error, pass, salt, hash) => {
                if (error) console.log(error);
                const new_PW = {
                    Member_PW: hash,
                    Member_salt: salt,
                };
                // 새로운 패스워드로 설정
                db.query('update into member set ? where Member_ID=?',
                    [new_PW, decoded.Member_ID],(error, results) => {
                    if (error) console.log(error);
                    if (results.affectedRows === 1) {
                        res.json({message: '비밀번호가 성공적으로 변경되었습니다.', result: true});
                    } else {
                        res.json({message: '잘못된 정보입니다.',result:false});
                    }
                });
            });
        }
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
//document.randform.randomfield.value = randomstring;
    return randomstring;
}