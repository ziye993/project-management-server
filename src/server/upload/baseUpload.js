import {config} from "../../utils/initConfig.js";
import {init} from "./storage.js";

let upload = init();
let uploadFile = upload.array('files'); // 多个文件上传

export const baseUpload = (type,req,res)=>{
  const pathMap = {
    pic:config?.picUploadPath,
    mov:config?.movUploadPath,
    file:config?.fileUploadPath,
  }
// 确保上传路径已经初始化
  if (!pathMap[type]) {
    return res.status(500).send({success: false, code: 1, msg: "你还未设置存储路径", data: null});
  }

  req.savePath =pathMap[type] || ''; // 使用 req.body 来存储路径

  // 处理上传
  uploadFile(req, res, (err) => {
    if (err) {
      return res.status(400).send({success: false, msg: '文件上传失败', error: err.message});
    }
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
}