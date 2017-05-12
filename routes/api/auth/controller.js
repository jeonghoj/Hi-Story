/**
 * Created by Jeongho on 2017-05-11.
 */
exports.register = (req,res) => {
    fs.readFile('public/auth_register.html','utf8',(error,data) => {
        res.send(data);
    });
};
