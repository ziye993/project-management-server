import fs from 'fs';
import {isWin} from "./index.js";
import cache from "../cache.js";
import os from "os";// 获取操作系统信息
import ffmpeg from "fluent-ffmpeg";
import {DEFAULT_PATH, FILE_TYPE_ENUM, PATH_CACHE_KEY} from "../const.js";
import path from "path";

/**
 * 这会将访问过的文件列表缓存起来 用此key:PATH_CACHE_KEY获取
 */
const pathCache = cache.get(PATH_CACHE_KEY);

/**
 * 判断文件夹下是否有 .tmp 文件夹，如果没有则创建
 * @param {string} folderPath 文件夹路径
 * @param {boolean} create 是否需要创建 .tmp 文件夹
 */
export function checkAndCreateTmpFolder(folderPath, create = false) {
  const tmpFolderPath = path.join(folderPath, '.tmp');
  console.log(tmpFolderPath)
  return new Promise((resolve, reject) => {
    fs.access(tmpFolderPath, fs.constants.F_OK, (err) => {
      if (err && create) {

        fs.mkdir(tmpFolderPath, {recursive: true}, (err) => {
          if (err) {
            reject(false)
          } else {
            console.log(`创建了${tmpFolderPath}`)
            resolve(true)
          }
        });
      } else {
        resolve(true)
      }
    });
  });
}

/**
 * 获取缓存中的文件夹列表
 * @param inputPath
 * @returns {unknown}
 */
function getCacheForPath(inputPath) {
  const cacheData = pathCache && pathCache[inputPath];
  return cacheData ? cacheData : null;
}

/**
 * 是否存在某个缓存文件
 * @param filePath
 */
export const hasTmpFile = (filePath) => {
  const tmpDir = path.join(path.dirname(filePath), '.tmp');  // .tmp 文件夹路径
  const outputFilePath = path.join(tmpDir, path.basename(filePath)); // 缩略图文件路径
  return fs.existsSync(outputFilePath)
}

/**
 * 设置缓存
 * @param inputPath
 * @param data
 */
function setCacheForPath(inputPath, data) {
  if (pathCache) {
    pathCache[inputPath] = data;
    cache.set(PATH_CACHE_KEY, pathCache); // 更新缓存
  }
}

/**
 * 读取目录的文件夹列表
 * @param inputPath
 * @returns {Promise<unknown>}
 */
function readDirectory(inputPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(inputPath, {withFileTypes: true}, (err, files) => {

      if (err) {
        reject(err);
        return;
      }
      // 过滤出文件夹
      const dirs = files.map(_ => ({
        ..._,
        isDirectory: _.isDirectory(),
        path: `${_.parentPath}/${_.name}`
      }));
      resolve(dirs);
    });
  });
}

/**
 * 获取目录内容
 * @param inputPath
 * @returns {Promise<{code: *, msg: string, data: *[]}|{code: *, msg: string, data: *[]}|{data: *, code: number, msg: string}|{code: number, msg: string, data: *[], success: boolean}|{data: *, code: number, msg: string}|{data: unknown, code: number, msg: string}>}
 */
export async function getDirectoryContents(inputPath = DEFAULT_PATH) {
  const cachedDirs = getCacheForPath(inputPath);
  if (cachedDirs) {
    return {data: cachedDirs, code: 0, msg: ""}
  }

  if (inputPath === DEFAULT_PATH && isWin()) {
    const list = await checkDrives();
    setCacheForPath(inputPath, list); // 将目录内容加入缓存
    return {data: list, code: 0, msg: ""}
  }
  // 如果缓存没有，读取目录内容
  try {
    const dirs = await readDirectory(inputPath);
    setCacheForPath(inputPath, dirs); // 将目录内容加入缓存
    return {data: dirs, code: 0, msg: ""}
  } catch (err) {
    if (err.code === 'EPERM') {
      return {code: err.code, msg: "你没有权限", data: []}
    } else if (err.code === "ENOENT") {
      return {code: 0, msg: '', data: [], success: true}
    } else {
      return {code: err.code, msg: "未知错误", data: []}
    }
  }
}

/**
 * 获取window所有判读只能最多到 Z://
 * @returns {Promise<unknown>}
 */
const checkDrives = () => {
  const drives = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  return new Promise((resolve, reject) => {
    const existingDrives = drives.filter(drive => {
      return fs.existsSync(`${drive}:/`);
    });
    resolve(existingDrives.map(_ => ({name: _, path: `${_}:/`, isDirectory: true})));
  })
};

/**
 * 将路径数组转化为对应平台的路径string格式
 * @param pathArray
 * @returns {*|string|null}
 */
export function convertToSystemPath(pathArray) {
  if (!pathArray?.length) {
    return null;
  }

  const separator = os.platform() === 'win32' ? '\\' : '/'; // Windows 使用反斜杠，其他平台使用正斜杠

  // 如果是 Windows 系统，需要特别处理盘符
  if (os.platform() === 'win32') {
    // 假设第一个元素是盘符，如 'C:'
    const drive = pathArray.shift(); // 移除第一个元素作为盘符
    return drive + ':' + separator + pathArray.join(separator); // 拼接成 Windows 路径
  } else {
    // 对于其他操作系统，直接使用斜杠
    return pathArray.join(separator);
  }
}

/**
 * 创建  缩略图
 * @param filePath
 * @param _outputDir
 * @param targetSizeKB
 * @returns {Promise<unknown>}
 */
export function createThumbnail(filePath, _outputDir = null, targetSizeKB = 50) {
  let outputDir = _outputDir;
  if (!outputDir) {
    const dir = path.dirname(filePath);  // 获取文件夹路径
    outputDir = path.join(dir, '.tmp');  // 返回目标路径
  }
  return new Promise((resolve, reject) => {
    const fileStats = fs.statSync(filePath);
    const fileSizeKB = fileStats.size / 1024; // 获取文件大小 (KB)

    // 如果文件大于200KB
    if (fileSizeKB > 200) {
      const fileName = path.basename(filePath);
      const ext = path.extname(fileName);
      const baseName = path.basename(fileName, ext);
      const outputFilePath = path.join(outputDir, `${baseName}${ext}`);

      let quality = 50; // 初始质量

      // 使用fluent-ffmpeg生成缩略图
      const generateThumbnail = () => {
        ffmpeg(filePath)
        .output(outputFilePath)
        .outputOptions([
          `-q:v ${quality}`, // 设置压缩质量
          '-vf scale=640:360' // 你可以调整尺寸，保证图片小巧
        ])
        .on('end', () => {
          const outputFileStats = fs.statSync(outputFilePath);
          const outputSizeKB = outputFileStats.size / 1024;

          if (outputSizeKB >= 20 && outputSizeKB <= targetSizeKB) {
            resolve(outputFilePath);
          } else if (outputSizeKB > targetSizeKB) {
            // 如果生成的图片大于目标大小，继续降低质量
            quality += 5;
            if (quality <= 90) { // 降低质量的最大值
              generateThumbnail();
            } else {
              reject('Unable to generate an image within the desired size range.');
            }
          } else {
            reject('Generated image is too small.');
          }
        })
        .on('error', (err) => {
          reject(`Error generating thumbnail: ${err.message}`);
        })
        .run();
      };

      // 如果.tmp文件夹不存在，则创建
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      // 开始生成缩略图
      generateThumbnail();
    } else {
      resolve(filePath); // 如果文件大小已经小于200KB，直接返回原图
    }
  });
}


export function isPicFile(fileType) {
  return FILE_TYPE_ENUM.includes(fileType.toLowerCase())
}