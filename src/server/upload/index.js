import app from '../../app.js';

import {init} from './storage.js';
import {config} from "../../utils/initConfig.js";

let upload = init();
let uploadFile = upload.array('files'); // 多个文件上传

app.post('/api/upload/uploadPic', (req, res) => {
  // 确保上传路径已经初始化
  if (!config.picUploadPath) {
    return res.status(500).send({success: false, code: 1, msg: "你还未设置存储路径", data: null});
  }

  console.log( config.picUploadPath,'config.picUploadPath')
  // 设置保存路径
  req.savePath = config.picUploadPath || ''; // 使用 req.body 来存储路径

  // 处理上传
  uploadFile(req, res, (err) => {
    if (err) {
      return res.status(400).send({success: false, msg: '文件上传失败', error: err.message});
    }

    // 确保至少上传了一个文件
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({success: false, msg: '未上传文件'});
    }

    // 返回上传的文件路径
    const filePaths = req.files.map(file => `${config.picUploadPath}/${file.filename}`);
    res.status(200).send({
      msg: '图片上传成功',
      data: filePaths, // 返回上传文件的路径
      code:0,
      success:true,
    });
  });
});
app.post('/api/upload/uploadMov', (req, res) => {
  if (!upload || !uploadFile) {
    res.status(500).send({success: false, code: 1, msg: "你还未设置存储路径", data: null})
  } else {
    uploadFile(req, res, (err) => {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
      res.status(200).send({
        message: 'File uploaded successfully',
        filePath: `${config.uploadPath}/${req.file.filename}`,
      });
    });
  }
});

// app.post('/api/changeUploadConfig', (req, res) => {
//   const {config} = req.params
//   upload = changeStorageConfig(config);
//   uploadFile = upload.single('file')
// })