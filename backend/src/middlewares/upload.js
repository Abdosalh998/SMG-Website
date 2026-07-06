const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
});

const processImage = async (req, res, next) => {
    if (!req.files && !req.file) return next();

    req.body.images = [];
    const uploadPath = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const files = req.files ? (Array.isArray(req.files) ? req.files : req.files.images) : [req.file];
    if(!files || files[0] == undefined) return next();
    
    await Promise.all(
        files.map(async (file, i) => {
            if(!file) return;
            const filename = `image-${Date.now()}-${i + 1}.webp`;
            
            await sharp(file.buffer)
                .resize(800, 800, {
                    fit: sharp.fit.inside,
                    withoutEnlargement: true
                })
                .toFormat('webp')
                .webp({ quality: 80 })
                .toFile(path.join(uploadPath, filename));
            
            if(req.file) {
                req.body.image = `/uploads/${filename}`;
            } else {
                req.body.images.push(`/uploads/${filename}`);
            }
        })
    );

    next();
};

module.exports = { upload, processImage };
