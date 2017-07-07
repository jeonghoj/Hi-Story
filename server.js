/**
 * Created by Jeongho on 2017-05-10.
 */
const http=require('http');
const https=require('https');

const path = require('path');
//웹페이지 아이콘 설정
const favicon = require('serve-favicon');

const passport = require('passport');
const express =require('express');
const cookieParser = require('cookie-parser');
const bodyParser=require('body-parser');
const fs=require('fs');
const app= express();
const morgan = require('morgan');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};
const port1 = 80;
const port2 = 443;

// 웹페이지 아이콘 설정
app.use(favicon(path.join(__dirname, 'public/img/logo', 'favicon.ico')));
//데이터 로그찍기
app.use(morgan('dev'));
//정적 파일 셋팅 -> 이걸해줘야 css js 파일 읽을수 있음
app.use(express.static(__dirname+'/public'));
// parse JSON and url-encoded query and cookie
app.use(cookieParser());
app.use(bodyParser.urlencoded({limit: "50mb", extended: false}));
app.use(bodyParser.json({limit: "50mb"}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//라우트
const routes_auth = require('./routes/api/auth/index');
const routes_main = require('./routes/api/main/index');
const routes_a_auth=require('./routes/api/android/auth/index');
const routes_a_main=require('./routes/api/android/main/index');
app.use('/android/auth',routes_a_auth);
app.use('/android',routes_a_main);
app.use('/auth',routes_auth);
app.use('/',routes_main);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
// app.listen(3000,()=>console.log('서버 가동'));

http.createServer(app).listen(port1, function(){
    console.log("Http server listening on port " + port1);
});


https.createServer(options, app).listen(port2, function(){
    console.log("Https server listening on port " + port2);
});