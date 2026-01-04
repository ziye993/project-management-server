import app from '../../app.js';
import {getConfig, setConfig} from "../../utils/jsonFile.js";

app.post('/api/config/setPicUploadPath', (req, res) => {
  const {uploadPath} = req.body;
  if(!uploadPath) {
    res.status(400).send({code:1,success:false,data:null,msg:''})
    return
  }
  const config = getConfig(true) || {};
  config.picUploadPath = uploadPath;
  setConfig(config);
  res.send({code:0,success:true,data:null,msg:''})
})
app.post('/api/config/setMovUploadPath', (req, res) => {
  const {uploadPath} = req.body;
  if(!uploadPath) {
    res.status(400).send({code:1,success:false,data:null,msg:''})
    return
  }
  const config = getConfig(true) || {};
  config.movUploadPath = uploadPath;
  setConfig(config);
  res.send({code:0,success:true,data:null,msg:''})
})
app.post('/api/config/setFileUploadPath', (req, res) => {
  const {uploadPath} = req.body;
  if(!uploadPath) {
    res.status(400).send({code:1,success:false,data:null,msg:''})
    return
  }
  const config = getConfig(true) || {};
  config.fileUploadPath = uploadPath;
  setConfig(config);
  res.send({code:0,success:true,data:null,msg:''})
})

// app.post('/api/config/getConfig', (req, res) => {
//
// })
