// /**
//  * Created by Jeongho on 2017-05-13.
//  */
// exports.upload = (req, res)=>{
//     const fs = require("fs");
//     const db=require('../../../config/db');
//     const action = req.query.action;
//     const book_data = {
//         'Book_Name' : req.body.bookname,
//         'Book_Author' : req.user.Member_Name,
//         'Book_Date' : Date.now(),
//         'Book_Public' : req.body.bookpublic,
//         'Member_No' : req.user.Member_No
//     };
//     const Book_Name = req.body.bookname;
//     const Book_Author = req.user.Member_Name;
//     const Book_Date = Date.now();  //어떤형식으로 들어갈지 찍어보자
//     const Book_Public = req.body.bookpublic;
//     const Member_No = req.user.Member_No;
//     const upFiles = req.files ? req.files : null; //Book_Thumbnail로 리사이즈된 파일로 대체할듯 원본 db도 필요해보임
//     //클라이언트에서 최대 첨부파일 갯수 넘을시 첨부못하게 미연에 방지해야됨
//     console.log('upload',req.body.bookname,req.user.Member_Name,
//         req.body.bookpublic,req.user.Member_No);
//     console.log('uploadfile',req.file);
//     console.log('uploadfiles',req.files);
//     if(action === 'add'){
//         if(isSaved(upFiles)){
//             //코드길이 줄일수 있는 방법 없나
//             //BookName 의 중복 방지 처리
//             // db.query('select LAST_INSERT_ID() from book',(err,result)=>{
//             //     const Book_No=result;
//             //     renameUploadFile(Book_No+1,upFile);
//             // })
//             //bookdate는 잠시 뺌
//
//             const rename_upFiles = renameUploadFile(Member_No,upFiles);
//             console.log(rename_upFiles);
//             const sql ='insert into book (Book_Name,Book_Author,Book_Date,Book_Public,Member_No,Book_Thumbnail) value(?,?,?,?,?,?)';
//             db.query(sql,[Book_Name,Book_Author,Book_Public,Member_No,rename_upFiles],(error) =>{
//                 if(error) console.log(error);
//                 else  return console.log('성공');
//             });
//         }else{
//             console.log('파일 저장 실패!');
//         }
//     }
//
// };
//
// function isSaved(upFiles) {
//     //파일 저장 여부 확인
//     const savedFile = upFiles;
//     let count = 0;
//     console.log('isSaved 함수',savedFile);
//     //저장한 파일이 없으면 true 저장한 파일이 있으면 갯수 확인후 true false 리턴
//     if(savedFile !== null){
//         for(let i=0;i<savedFile.length;i++){
//             if(fs.statSync(getDirname(1)+savedFile[i].path).isFile()){
//                 count ++;
//                 return (count === savedFile.length) //맞으면 true 틀리면 false
//             }
//         }
//     }else{
//         return true;
//     }
// }
// //디렉토리 네임 가져오기 0은 현재저장된 경로 1은 상위폴더
// function getDirname(num) {
//     let order = num;
//     const dirname = __dirname.split('/');
//     let result = ''; //null
//     console.log(dirname);
//     for(let i = 0 ; i<dirname.length-order;i++){
//         result += dirname[i] + '/';
//     }
//     console.log(result);
//     return result;
// }
// function renameUploadFile(Member_No,upFiles) {
//     //리네이밍
//     let renameForUpload = {};
//     const newFile = upFiles; // 새로 들어 온 파일
//     console.log('리네임할때 갖고오는 upfiles 형식 :',newFile);
//     let tmpPath = [];
//     let tmpType = [];
//     let index = [];
//     let rename = [];
//     let fileName = [];
//     let fullName = []; // 원래이름 파일은 다운로드시, 원본파일명이 필요하기때문에 필요
//     let fsName = [];
//     for (let i = 0; i < newFile.length; i++) {
//         tmpPath[i] = newFile[i].path;
//         tmpType[i] = newFile[i].mimetype.split('/')[1]; // 확장자 저장
//         index[i] = tmpPath[i].split('/').length;
//         console.log('tmpPath가 어떤형식으로 갖고와서 파싱되는지',tmpPath[i].split('/'));
//         rename[i] = tmpPath[i].split('/')[index[i] - 1];
//         fileName [i] = Member_No + "_" + getFileDate(new Date()) + "_" + rename[i] + "." + tmpType[i]; // 파일 확장자 명까지 같이 가는 이름 "날짜_파일명.확장자"
//         fullName [i] = fileName[i] + ":" + newFile[i].originalname.split('.')[0]; // 원래 이름까지 같이 가는 이름 "날짜_파일명.확장자:원본 이름"
//         fsName [i] = getDirname(1)+"upload/"+fileName[i]; // fs.rename 용 이름 "./upload/글아이디_날짜_파일명.확장자"
//     }
//     renameForUpload.tmpname = tmpPath;
//     renameForUpload.filename = fileName;
//     renameForUpload.fullname = fullName;
//     renameForUpload.fsname = fsName;
//     return renameForUpload;
// }
// function getFileDate(date) {
//     const year = date.getFullYear();
//     const month = date.getMonth() + 1;
//     const day = date.getDate();
//     const hour = date.getHours();
//     const min = date.getMinutes();
//     const sec = date.getSeconds();
//     const fullDate = year + "" + month + "" + day + "" + hour + "" + min + "" + sec;
//     return fullDate;
// }
