import express from 'express'
import cors from 'cors'

const app = express();
import bodyParser from 'body-parser';

app.use(cors()); // 全局允许所有跨域
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // 解析 URL-encoded 格式的请求体

// POST 接口
export default app