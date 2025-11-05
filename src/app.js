import express from 'express'
import cors from 'cors'

const app = express();

app.use(cors()); // 全局允许所有跨域
app.use(express.json());

// POST 接口
export default app