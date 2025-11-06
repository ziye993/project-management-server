import path from "path";
import express from 'express'
import app from'./src/app.js';
import server from './src/serverHttp.js';
import openUrl from './src/utils/openUrl.js'
import './src/server/index.js'

const port = 30000;

app.use(express.static(path.join(process.cwd(), "html")));

server.listen(port, '0.0.0.0', () => {
  console.log('OK');
  openUrl(port);
})