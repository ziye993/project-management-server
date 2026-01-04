import app from "../../app.js";
import {config} from "../../utils/jsonFile.js";
import path from "path";

const picDynamicStatic = (req, res, next) => {
  if (!req.url.startsWith(config?.picRequestPath) || !config?.picUploadPath) return next();
  const filePath = path.join(config?.picUploadPath, req.url.replace(config?.picRequestPath, "")).replace(/^\/+/, "");
  res.setHeader("Content-Type", "image/png");
  const decodedPath = decodeURIComponent(filePath);  // ← 必须加这个！
  res.sendFile(decodedPath, {
    dotfiles: "allow"
  }, (err) => {
    if (err) next();
  });
};
const fileDynamicStatic = (req, res, next) => {
  if (!req.url.startsWith(config?.picRequestPath) || !config?.fileUploadPath) return next();
  const filePath = path.join(config?.fileUploadPath, req.url.replace(config?.picRequestPath, "")).replace(/^\/+/, "");
  res.sendFile(filePath, (err) => {
    if (err) next(); // 文件不存在，继续下一个中间件
  });
};
const movDynamicStatic = (req, res, next) => {
  if (!req.url.startsWith(config?.movRequestPath) || !config?.movUploadPath) return next();
  const filePath = path.join(config?.movUploadPath, req.url.replace(config?.movRequestPath, "")).replace(/^\/+/, "");
  res.sendFile(filePath, (err) => {
    if (err) next(); // 文件不存在，继续下一个中间件
  });
};

app.use(picDynamicStatic);
app.use(fileDynamicStatic);
app.use(movDynamicStatic);