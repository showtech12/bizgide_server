const multer = require("multer");
module.exports = async (req, res, next) => {
    //console.log(req.body.prdt_id);
    const storage = multer.memoryStorage(); // Store files in memory buffer
//const upload = multer({ storage: storage });

const upload = multer({

  
 // storage: storage,
  limits: { fileSize: 1024 * 1024 }, // Limit file size to 1 MB

  fileFilter: function (req, file, cb) {
    // Check the file's MIME type for jpg and png
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true); // Accept the file if it's a JPG or PNG
    } else {
      cb(new Error('Only JPG and PNG files are allowed!'), false); // Reject other formats
    }
  },
});

    upload.array('imgInput[]', 7)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          // Multer-specific error
         // return res.status(200).json({ message: 'Images more than 5' });
          return res.status(500).json({ message: 'Images more than 7 Or Image more than 500kb' });
        } else if (err) {
          // Validation error (e.g., wrong file type)
          return res.status(400).json({ message: err.message });
        }
    
        // Continue with image processing if no error
        next();
      });
    
}