/**
 * Created by Jeongho on 2017-05-13.
 */
exports.upload = (req, res)=>{
    const fs = require("fs");
    const db=require('../../../config/db');
    const action = req.query.action;
    console.log(req.body);
    const Book_Name = req.body.bookname;
    const Book_Author = req.user.Member_Name;
    // const Book_Date = Date.now();  //어떤형식으로 들어갈지 찍어보자
    const Book_Public = req.body.bookpublic;
    const Member_No = req.user.Member_No;
    const upFile = req.files ? req.files : null; //Book_Thumbnail로 리사이즈된 파일로 대체할듯 원본 db도 필요해보임
    //클라이언트에서 최대 첨부파일 갯수 넘을시 첨부못하게 미연에 방지해야됨
    console.log(req.body.bookname);
    console.log(req.user.Member_Name);
    console.log(req.body.bookpublic);
    console.log(req.user.Member_No);
    console.log(req.files);
    if(action === 'add'){
        if(isSaved(upFile)){
            //코드길이 줄일수 있는 방법 없나
            //BookName 의 중복 방지 처리
            // db.query('select LAST_INSERT_ID() from book',(err,result)=>{
            //     const Book_No=result;
            //     renameUploadFile(Book_No+1,upFile);
            //
            // })
            //bookdate는 잠시 뺌
            const sql ='insert into book (Book_Name,Book_Author,Book_Public,Member_No,Book_Thumbnail) value(?,?,?,?,?)';
            db.query(sql,[Book_Name,Book_Author,Book_Public,Member_No,upFile],(error) =>{
                if(error) console.log(error);
                else  return console.log('성공');
            });
        }else{
            console.log('파일 저장 실패!');
        }
    }

};
exports.uploadtest = (req, res)=>{


};

function isSaved(upFile) {
    //파일 저장 여부 확인
    const savedFile = upFile;
    let count = 0;
    console.log('isSaved 함수',savedFile);
    //저장한 파일이 없으면 true 저장한 파일이 있으면 갯수 확인후 true false 리턴
    if(savedFile !== null){
        for(let i=0;i<savedFile.length;i++){
            if(fs.statSync(getDirname(1)+savedFile[i].path).isFile()){
                count ++;
                return (count === savedFile.length) //맞으면 true 틀리면 false
            }
        }
        // if(count === savedFile.length){
        //     return true;
        // }else{
        //     return false;
        // }
    }else{
        return true;
    }
}
function getDirname(num) {
    let order = num;
    const dirname = __dirname.split('/');
    let result = ''; //null
    console.log(dirname);
    for(let i = 0 ; i<dirname.length-order;i++){
        result += dirname[i] + '/';
    }
    console.log(result);
    return result;
}
function renameUploadFile(itemID,upFile) {
    //리네이밍
    let renameForUpload = {};
    const newFile = upFile; // 새로 들어 온 파일
    console.log('리네임할때 갖고오는 upfile 형식 :',newFile);
    let tmpPath = [];
    let tmpType = [];
    let index = [];
    let rename = [];
    let fileName = [];
    let fullName = []; // 다운로드 시 보여줄 이름 필요하니까 원래 이름까지 같이 저장하자!
    let fsName = [];
    for (let i = 0; i < newFile.length; i++) {
        tmpPath[i] = newFile[i].path;
        tmpType[i] = newFile[i].mimetype.split('/')[1]; // 확장자 저장 //mimetype 오류 가능성?
        index[i] = tmpPath[i].split('/').length;
        console.log('tmpPath가 어떤형식으로 갖고와서 파싱되는지',tmpPath[i].split('/'));
        rename[i] = tmpPath[i].split('/')[index[i] - 1];
        // (itemID + "_" +)  즉 글 번호를 저장해야하는데 이부분이 애매하다 좀더 고민해보자
        fileName [i] = getFileDate(new Date()) + "_" + rename[i] + "." + tmpType[i]; // 파일 확장자 명까지 같이 가는 이름 "글아이디_날짜_파일명.확장자"
        fullName [i] = fileName[i] + ":" + newFile[i].originalname.split('.')[0]; // 원래 이름까지 같이 가는 이름 "글아이디_날짜_파일명.확장자:보여줄 이름"
        fsName [i] = getDirname(1)+"upload/"+fileName[i]; // fs.rename 용 이름 "./upload/글아이디_날짜_파일명.확장자"
    }
    renameForUpload.tmpname = tmpPath;
    renameForUpload.filename = fileName;
    renameForUpload.fullname = fullName;
    renameForUpload.fsname = fsName;
    return renameForUpload;
}
function getFileDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    const fullDate = year + "" + month + "" + day + "" + hour + "" + min + "" + sec;
    return fullDate;
}
