const multer = require('multer');
const path =  require('path');

module.exports = multer({
    
    // The disk storage engine gives you full control on storing files to disk.
    storage: multer.diskStorage({}),

    // Which file should be added or skip 
    fileFilter: (req, file, cb)=>{
        let ext = path.extname(file.originalname);
        if(ext !== ".jpeg" && ext !== ".png" && ext !== ".jpg" && ext !== ".webp"){
            cb(new Error("file not supported !!!"), false);
            return;
        }
        cb(null, true);
    }
})