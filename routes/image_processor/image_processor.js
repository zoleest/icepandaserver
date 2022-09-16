const express = require('express');
const router = express.Router();

const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const fs = require('fs');
router.get('/', function (req, res) {
    res.render('users');
})

router.post('/', multipartMiddleware, function (req, res) {


    fs.readFile(req.files.upload.path, function (err, data) {
        let timestamp = Math.floor(Date.now() / 1000);
        let newPath = __dirname + '../../../public/images/uploads/' + timestamp + req.files.upload.name;
        fs.writeFile(newPath, data, function (err) {
            if (err) console.log({err: err});
            else {
                res.send("<script type='text/javascript'>\
      (function(){var d=document.domain;while (true){try{var A=window.parent.document.domain;break;}catch(e) {};d=d.replace(/.*?(?:\.|$)/,'');if (d.length==0) break;try{document.domain=d;}catch (e){break;}}})();\
      window.parent.CKEDITOR.tools.callFunction('" + req.query.CKEditorFuncNum + "','" + "/images/uploads/" + timestamp + req.files.upload.name + "', '" + "ASDASD" + "');\
      </script>");

            }
        });
    });
});

module.exports = router;