/**
* Created by Jeongho on 2017-05-11.
*/

const db = require('./db');
const config  = require('./config');
const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
//jwt 설정
const cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies) token = req.cookies['jwt'];
    return token;
};
const jwtOptionshead = {
    jwtFromRequest : ExtractJwt.fromAuthHeader(),
    secretOrKey : config.secret
};
const jwtOptionscookie = {
    jwtFromRequest : cookieExtractor,
    secretOrKey : config.secret
};
passport.use('jwth', new JwtStrategy(jwtOptionshead, (jwt_payload, done) => {
    console.log('payload received', jwt_payload);
    let user = null;
    db.query('select Member_No,authID,Member_Name from member where authID=?',[jwt_payload.authID],(error, results) => {
        if(error) console.log(error);
        user = results[0];
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
}));

passport.use('jwtc', new JwtStrategy(jwtOptionscookie, (jwt_payload, done) => {
    console.log('payload received', jwt_payload);
    let user = null;
    db.query('select * from member where authID=?',[jwt_payload.authID],(error, results) => {
        if(error) console.log(error);
        user = results[0];
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
}));
// passport.use(Strategy);

passport.serializeUser(function(user, done) {
    console.log('serializeUser',user);
    done(null,user.authID);
});
//페이지가 실행 될 때 마다 deserializeUser가 실행 id에는 authid가 들어간다
// passport.deserializeUser(function(id, done) {
//     console.log('deserializerUser',id);
//     var sql = 'select * from member where authID=?';
//     db.query(sql,[id],function (err,results) {
//         if(err){
//             console.log(err);
//             done('There is no user.');
//         }else{
//             done(null,results[0]);
//         }});
// });

module.exports=passport;