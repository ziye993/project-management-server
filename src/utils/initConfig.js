
import {config as _config, fileExists, getConfig, getFolders, readJSON, setConfig} from './jsonFile.js'

export let config = _config ;

export const refreshConfig = ()=>{
  config = getConfig(true);
}

/**
 * 初始化congif,返回 项目文件列表
 * @param forceRefresh
 * @returns {*[]}
 */
export default function getProjectList(forceRefresh) {
  const config = getConfig(forceRefresh);
  if (!forceRefresh) {
    return config.projectList || []
  }
  const data = []
  config?.projectPaths?.map?.(_ => {
    const keys = getFolders(_);
    keys.forEach(__ => {
      const _path = _ + "/" + __;
      let scriptConfig, scripts;
      if (fileExists(_path + '\\package.json')) {
        scriptConfig = readJSON(_path + '\\package.json');
        scripts = scriptConfig?.scripts;
        if (scripts) {
          scripts = Object?.keys?.(scripts).map(item => {
            const fIndex = (config?.soltScript || [])?.findIndex(_ => item === _);
            return {
              label: item,
              value: item,
              command: scripts[item],
              sortIndex: fIndex > -1 ? fIndex : config?.soltScript?.length + 100
            }
          })
        } else {
          scripts = []
        }
      }
      data.push({ path: _path, label: __, value: __, scripts: scripts || [] })
    })

  });
  config.projectList = data;
  setConfig(config);
  return data
}