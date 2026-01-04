import multer from 'multer';

export const init = () => {
  const storage = multer.diskStorage({// 设置存储引擎
    destination: function (req, file, cb) {
      const path = req.savePath;
      if (!path) {
        return cb(new Error('No save path'));
      }
      cb(null, path); // 指定文件保存路径
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);// 设置上传文件的名称
    }
  });
  return multer({storage: storage})
}
