import express from 'express'
import cors from 'cors'
const app = express();
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {authenticateToken} from "./server/user/auth.js";

app.use(cookieParser()); // 解析 Cookie
app.use(cors({
  origin: 'http://127.0.0.1:5173', // 必须指定前端地址
  credentials: true,               // 允许带 cookie
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // 解析 URL-encoded 格式的请求体
app.use('/api', authenticateToken); // 只拦 /api 相关接口
// POST 接口
export default app