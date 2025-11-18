import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = '../../data/config.json';
export let config =null;
config = getConfig(configPath);

// 读取 JSON 文件
export function readJSON(fileName) {
  const filePath = path.resolve(__dirname, fileName);
  const data = fs.readFileSync(filePath, 'utf-8');

  return JSON.parse(data);
}

// 写入 JSON 文件
export function writeJSON(fileName, content) {
  const filePath = path.resolve(__dirname, fileName);
  config = content;
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8',);
}

export function fileExists(fileName) {
  const filePath = path.resolve(fileName);
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}



// 获取配置
export function getConfig(refresh) {
  if (config && !refresh) {
    return config
  }
  const filePath = path.resolve(__dirname, configPath);
  if (!fs.existsSync(filePath)) return {};
  config = readJSON(configPath);
  return config
}

// 设置配置
export function setConfig(newConfig) {
  const dirPath = path.dirname(path.resolve(__dirname, configPath));
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, {recursive: true});
  const oldConfig = getConfig(true);
  const merged = {...oldConfig, ...newConfig};
  writeJSON(configPath, merged);
}


export function getFolders(dirPath) {
  return fs.readdirSync(dirPath)
  .filter(name => fs.statSync(path.join(dirPath, name)).isDirectory());
}

// // 示例
// const folders = getFolders('./data');
// console.log(folders);