const multer = require('multer');
const path =  require('path');

module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb)=>{
        let ext = path.extname(file.originalname);
        if(ext !== ".jpeg" && ext !== ".png" && ext !== ".jpg" && ext !== ".webp"){
            cb(new Error("file not supported !!!"), false);
            return;
        }
        cb(null, true);
    }
})