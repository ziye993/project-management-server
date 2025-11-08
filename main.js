import path from "path";
import express from 'express';
import app from './src/app.js';  // 假设 app 是一个 Express 实例
import server from './src/serverHttp.js';  // 假设 server 已经包含 express 实例
import openUrl from './src/utils/openUrl.js';

app.use(express.static(path.join(process.cwd(), "html")));

import './src/server/index.js';  // 加载其他初始化文件（如果需要）

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 30000;

// 配置静态文件目录

// 配置通配符路由，处理 React Router 路由
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// 启动服务器
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
  openUrl(`http://localhost:${port}`);  // 打开浏览器访问当前端口
});