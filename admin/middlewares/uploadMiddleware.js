const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        return cb(new Error('Only DOC, PDF, or image files are allowed!'));
    }
};


// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
// }).single('file');

const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
    }).single('myfile');
    // .fields([
    //     { name: 'profilePix', maxCount: 1 },
    // // { name: 'resume', maxCount: 1 },
    // // { name: 'document', maxCount: 2 }
    // ]);

// Multer middleware (2MB file limit)
const uploadMiddleware = (req, res, next) => {

    upload(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File size should not exceed 2MB.' });
            }
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const extension = path.extname(req.file.originalname).toLowerCase();

        const OrderID = req.body.OrderID ;
        const Pid = req.body.Pid ;
        var uploadPath = ""
       
        
        // Create user-specific folder if it doesn't exist
        
        var filename = ""
        if(req.body.fileType =="ProfPix"){
            uploadPath = `uploads/profile/${Pid}/`;
            fs.mkdirSync(uploadPath, { recursive: true });
            filename= `${Pid}${extension}`;
        }else if(req.body.fileType =="G1ID"){
            uploadPath = `uploads/doc/${OrderID}/`;
            fs.mkdirSync(uploadPath, { recursive: true });
            filename = `guarantor1${extension}`;
        }else if(req.body.fileType =="G2ID"){
            uploadPath = `uploads/doc/${OrderID}/`;
            fs.mkdirSync(uploadPath, { recursive: true });
            filename = `guarantor2${extension}`;
        }else if(req.body.fileType =="CrdID"){
            uploadPath = `uploads/doc/${OrderID}/`;
            fs.mkdirSync(uploadPath, { recursive: true });
            filename = `creditorid${extension}`;
        }else if(req.body.fileType =="BankState"){
            uploadPath = `uploads/doc/${OrderID}/`;
            fs.mkdirSync(uploadPath, { recursive: true });
            filename = `bankstate${extension}`;
        }else if(req.body.fileType =="Cert"){
            uploadPath = `uploads/doc/${OrderID}/`;
            fs.mkdirSync(uploadPath, { recursive: true });
            filename = `cert${extension}`;
        }else if(req.body.fileType =="Memart"){
            uploadPath = `uploads/doc/${OrderID}/`;
            fs.mkdirSync(uploadPath, { recursive: true });
            filename = `memart${extension}`;
        }else if(req.body.fileType =="Collateral"){
            uploadPath = `uploads/doc/${OrderID}/`;
            fs.mkdirSync(uploadPath, { recursive: true });
            filename = `collateral${extension}`;
        }else if(req.body.fileType =="Reason"){
            uploadPath = `uploads/doc/${OrderID}/`;
            fs.mkdirSync(uploadPath, { recursive: true });
            filename = `reason${extension}`;
        }else if(req.body.fileType =="UpldLeter"){
            uploadPath = `uploads/doc/${OrderID}/`;
            fs.mkdirSync(uploadPath, { recursive: true });
            filename = `letter_offer${OrderID}${extension}`;
        }

        
       // `UPDATE persons SET passport_path = :passport_path WHERE id= :id`
           
       
        const filePath = path.join(uploadPath, filename);

        // Write the file manually from memory storage
        fs.writeFileSync(filePath, req.file.buffer);

        // Attach the file path to req for next middleware
        req.uploadedFile = { path: filePath, filename };

        next();
    });

   
    // upload(req, res, (err) => {
    //     if (err) {
    //         if (err.code === 'LIMIT_FILE_SIZE') {
    //             return res.status(400).json({ error: 'File size should not exceed 2MB.' });
    //         }
    //         return res.status(400).json({ error: err.message });
    //     }
    //     next();
    // });


};

module.exports = uploadMiddleware;
