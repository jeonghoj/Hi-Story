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
        db.query('insert into member set ?',[user],(error,results) => {
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
                db.query('insert into image set ?',[defaultimg],(error)=> {
                    if(error) console.log(error);
                    let mailoptions={
                        from:'historygdrive@gmail.com',
                        to:userid,
                        subject:'Hi-Story 이메일 인증을 완료해 주세요',
                        text:'회원가입을 완료하려면 https://history-dcy.com/auth/verifyemail?emailtoken='+emailtoken,
                    };
                    transporter.sendMail(mailoptions,function (err,info) {
                        if(err) console.log(err);
                        console.log('Mail send Success -',info.response);
                        transporter.close();
                    });
                    res.status(200).send(
                        '<script type="text/javascript">' +
                        'alert("회원가입이 완료되었습니다! 이메일 인증을 해주세요.");' +
                        'document.location.href="/";' +
                        '</script>');
                });
            }
        });
    });
};
exports.login = (req,res) => {
    const { userid , password } = req.body; // 웹에서 널값 못보내도록 막기처리 해줘야
    db.query('select * from member where Member_ID=?',[userid],(error,results) => {
        if(error) console.log(error);
        const user = results[0];
        if(!user){
            return res.status(401).send(
                '<script type="text/javascript">' +
                'alert("사용자를 찾을 수 없습니다.");' +
                'document.location.href="/";' +
                '</script>');
        }
        return hasher({password:password,salt:user.Member_salt},(error, pass, salt, hash) => {
            if(hash === user.Member_PW) {
                if(user.Member_EmailVerified===0){
                    res.send(
                        '<script type="text/javascript">' +
                        'alert("이메일 인증을 하지 않았습니다");' +
                        'document.location.href="/";' +
                        '</script>');
                }else{
                    // id로 사람 구분
                    const payload = {authID: user.authID};
                    const token = jwt.sign(payload, config.secret,{expiresIn: '1440m'});
                    res.cookie('jwt',token);
                    res.redirect('/action');
                }
            }else{
                res.status(401).send(
                    '<script type="text/javascript">' +
                    'alert("패스워드가 일치하지 않습니다");' +
                    'document.location.href="/";' +
                    '</script>');
            }
        });
    });
};
exports.verifyemail=(req,res)=>{
    const emailtoken=req.query.emailtoken;
    jwt.verify(emailtoken,config.secret,(error,decoded)=>{
        if(error) console.log(error);
        if(decoded===undefined){
            // 토큰이 만료되었을때 접속을 시도하면 그 사용자를 지우고,
            // 만약 이메일 인증된 사용자가 다시 접근을 하려고했으면 지우지 않게끔 해준다
            res.json({message:'토큰이 만료되었거나 잘못된 접근입니다.',result:false});
            res.send(
                '<script type="text/javascript">' +
                'alert("토큰이 만료되었거나 잘못된 접근입니다.");' +
                'document.location.href="/";' +
                '</script>');
        }else{
            // 이메일 인증 true 값으로 설정
            db.query('update member set Member_EmailVerified=1 where Member_ID=?',
                [decoded.Member_ID],(error,result)=>{
                if(error) console.log(error);
                if(result.affectedRows===0){
                    res.status(500);
                    res.send(
                        '<script type="text/javascript">' +
                        'alert("잘못된 접근입니다");' +
                        'document.location.href="/";' +
                        '</script>');
                }else if(result.changedRows===0){
                    res.send(
                        '<script type="text/javascript">' +
                        'alert("이미 이메일 인증이 되었습니다. 로그인 해주세요");' +
                        'document.location.href="/";' +
                        '</script>');
                }else{
                    res.send(
                        '<script type="text/javascript">' +
                        'alert("이메일 인증이 완료되었습니다! 로그인 해주세요");' +
                        'document.location.href="/";' +
                        '</script>');
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
    const userid=req.body.userid;
    db.query('select count(*) as member_exist from member where Member_ID=?',[userid],(error,results)=>{
        if(error) console.log(error);
        if(results[0].member_exist===0){
            res.send(
                '<script type="text/javascript">' +
                'alert("없는 회원입니다. ID를 제대로 입력하셨는지 확인하여주세요");' +
                'document.location.href="/";' +
                '</script>');
        }else{
            const payload = {Member_ID:userid};
            const token = jwt.sign(payload, config.secret ,{expiresIn: '120m'});
            let mailoptions={
                from:'historygdrive@gmail.com',
                to:userid,
                subject:'비밀번호 초기화',
                text:'비밀번호를 초기화하려면 이 링크로 접속해주세요. https://history-dcy.com/auth/new_PW?memberinfo='+token,
            };
            transporter.sendMail(mailoptions,(err,info) => {
                if(err) console.log(err);
                console.log('Mail send Success -',info.response);
                transporter.close();
            });
            res.send(
                '<script type="text/javascript">' +
                'alert("이메일을 보냈습니다. 이메일의 링크로 접속해주세요.");' +
                'document.location.href="/";' +
                '</script>');
        }
    });

};
exports.new_PW=(req,res)=>{
    // 웹에서 Get으로 전달된 토큰을 받아서 같이 보내준다.
    const token=req.body.token;
    const newpassword=req.body.password;
    console.log(req.body);
    jwt.verify(token,config.secret,(error,decoded)=>{
        console.log(decoded);
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
                db.query('update member set ? where Member_ID=?',
                    [new_PW, decoded.Member_ID],(error, results) => {
                    if (error) {
                        console.log(error);
                        res.send(
                            '<script type="text/javascript">' +
                            'alert("잘못된 정보입니다");' +
                            'document.location.href="/";' +
                            '</script>');
                    }else{
                        console.log(results);
                        res.send(
                            '<script type="text/javascript">' +
                            'alert("비밀번호가 성공적으로 변경되었습니다!");' +
                            'document.location.href="/";' +
                            '</script>');
                    }
                });
            });
        }
    });
};

// setting에서 비밀번호를 바꿧을때의 url
exports.member_new_PW=(req,res)=>{
    const old_pw=req.body.old_pw;
    const new_pw=req.body.new_PW;
    db.query('select * from member where Memeber_ID=?',[req.user.Member_ID],(error,results)=>{
        if(error) console.log(error);
        const user = results[0];
        if(!user){
            hasher({password:old_pw,salt:user.Member_salt},(error,pass,salt,hash)=>{
                if(error) console.log(error);
                // 예전의 비밀번호와 쓴 비밀번호가 같을 때 수행
                if(hash===user.Member_PW){
                    hasher({password:new_pw},(error,pass,salt,hash)=>{
                       if(error) console.log(error);
                       const new_PW={
                           Member_PW:hash,
                           Member_salt:salt
                       };
                       db.query('update member set ? where Member_ID=?',
                           [new_PW,req.user.Member_ID],(error,results)=>{
                           if(error) console.log(error);
                           return res.send(
                               '<script type="text/javascript">' +
                               'alert("비밀번호가 변경되었습니다. 다시 로그인 해주세요");' +
                               'document.location.href="/";' +
                               '</script>');
                       })
                    });
                }
            })
        }else{
            return res.send(
                '<script type="text/javascript">' +
                'alert("비밀번호가 맞지 않습니다.");' +
                'document.location.href="/";' +
                '</script>');
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
    return randomstring;
}