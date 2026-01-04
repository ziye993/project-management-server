import path from "path";
import express from 'express';
import app from './src/app.js';
import server from './src/serverHttp.js';  // 假设 server 已经包含 express 实例
import openUrl from './src/utils/openUrl.js';
import './src/server/index.js';  // 加载其他初始化文件（如果需要）
import { fileURLToPath } from 'url';
import cache from "./src/cache.js";
cache.flushAll();

app.use(express.static(path.join(process.cwd(), "html")));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 30000;


// 配置通配符路由，处理 React Router 路由
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});


// 启动服务器
server.listen(port, '0.0.0.0', () => {
  console.log("ok\n")
  openUrl(port);
});