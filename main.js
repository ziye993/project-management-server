import path from "path";
import app from './app.js';
import express from 'express'
import openUrl from './openUrl.js'
import './api.js';

const port = 30000;
app.use(express.static(path.join(process.cwd(), "html")));
app.listen(port, () => {
  console.log('OK');
  openUrl(port);
})