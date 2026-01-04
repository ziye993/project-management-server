import app from '../../app.js';
import cache from '../../cache.js';
import {
  convertToSystemPath,
  getDirectoryContents, readDirectory
} from "../../utils/file.js";
import {cachePicListKey, DEFAULT_PATH} from "../../const.js";
import {init} from "../upload/storage.js";
import {config} from "../../utils/jsonFile.js";
import './initPicData.js';

let isRefresh = false; // 是否正在刷新asd


// 获取文件列表接口
app.post('/api/file/fileList', async (req, res) => {
  const {path: _dirPath} = req.body;
  const dirPath = convertToSystemPath(_dirPath);
  try {
    // 如果有传递路径，使用传递的路径；没有则默认根目录
    const data = await getDirectoryContents(dirPath || DEFAULT_PATH);
    res.status(200).json(data);
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
});

/**
 * 获取图片的list
 */
app.post("/api/file/getPicList", async (req, res) => {
  cache.flushAll();
  let data = cache.get(cachePicListKey);
    if (!data) {
      data =( await readDirectory(config?.picUploadPath)).filter(_=>!_.isDirectory);

      cache.set(cachePicListKey, data)
    }
    console.log(cache.get(cachePicListKey), ' cache.get(cachePicListKey)')
    data = data.map(_ => ({
      url: `${config?.picRequestPath}/${_.name}`,
      size: _?.size,
      fileType: _?.fileType,
      name: _?.name,
      prefixName: _?.prefixName,
      unit: _.unit,
      tmpPath: `${config?.picRequestPath}/.tmp/${_.name}`
    }))
    return res.send({code: 0, success: true, data, msg: ''})
  }
)

app.post("/api/file/refreshPicList", async (req, res) => {
  if (isRefresh) {
    const data = await init(config.picUploadPath)
    res.send({success: false, code: 1, data: null, msg: '正在刷新',})
  } else {
    /**
     * 刷新 // todo
     */

    res.send({code: 0, success: true, data, msg: ''});
  }
})

// 刷新缓存接口
app.post('/api/refreshCache', (req, res) => {
  // 清空缓存
  cache.clear();
  res.status(200).json({msg: 'Cache cleared and refreshed.'});
});
