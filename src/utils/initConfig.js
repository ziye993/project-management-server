
import { fileExists, getConfig, getFolders, readJSON, setConfig, writeJSON } from './jsonFile.js'

export default function initConfig(forceRefresh) {
  const config = getConfig();
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
            const fIndex = (config?.soltScript || [])?.findIndex(_=>item===_);
            return {
              label: item,
              value: item,
              command: scripts[item],
              sortIndex: fIndex || config?.soltScript?.length + 100
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
  console.log(config)
  return data
}