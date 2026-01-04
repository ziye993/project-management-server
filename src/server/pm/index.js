import getProjectList from '../../utils/initConfig.js';
import app from '../../app.js';
import {spawn} from 'child_process';
import {getConfig, setConfig} from '../../utils/jsonFile.js'
import pkg from 'node-file-dialog';
import {killChild} from '../../utils/killChild.js'

let projectList = getProjectList();
let currentChild = {}; // 保存当前子进程

let logs = {}
const cleanup = () => {
  if (!currentChild) {
    return
  }

  console.log("\n🧹 服务即将退出，清理子进程...");
  let length = Object.keys(currentChild)?.filter(_ => !!currentChild[_])?.length;
  let successCount = 0;
  Object.keys(currentChild)?.map(_ => {
    try {
      currentChild[_].kill("SIGTERM");
      successCount += 1;
    } catch (error) {
      console.log(error)
    }

  })
  currentChild = undefined;
  console.log(`\n🧹清理完成; 总计${length} ; 成功${successCount}`);
  process.exit();
};

// 捕获退出事件
process.on("SIGINT", cleanup);   // Ctrl+C
process.on("SIGTERM", cleanup);  // kill 命令
process.on("exit", cleanup);
process.on("uncaughtException", err => {
  console.error("未捕获异常:", err);
  cleanup();
});

app.post('/api/project/getProjectList', (req, res) => {

  res.json({
    msg: '', data: projectList, success: true, code: 0
  });
});

app.post('/api/project/getLogs', (req, res) => {
  res.send({success: true, data: logs, code: 0, msg: ''})
})

app.post('/api/project/forceRefreshList', (req, res) => {
  projectList = getProjectList(true);
  res.json({
    msg: '', data: projectList, success: true, code: 0
  });
});

app.post('/api/project/runCommand', (req, res) => {
  const {path, command, value, project} = req.body;
  if (!command || !path) return res.status(400).send('缺少参数');
  let child;
  if (!currentChild[`${project}:${value}`]) {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'cmd' : 'sh';
    const args = isWin ? ['/c', `cd ${path} & npm run ${value}`] : ['-c', `cd ${path} && npm run ${value}`];
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    child = spawn(cmd, args);
    currentChild[`${project}:${value}`] = child;
  } else {
    child = currentChild[`${project}:${value}`];
    child.stdout.removeAllListeners('data');
    child.stderr.removeAllListeners('data');
  }
  if (!logs[project]) logs[project] = {};
  if (!logs[project][value]) logs[project][value] = {logs: []};
  if (!child) {

    return
  }
  console.log(`${project}:${value}: connect`)
  child.stdout.on('data', data => {
    const buf = Buffer.from(data);
    const str = buf.toString(); // 默认 utf8
    logs[project][value].logs.push({text: str});
    if (logs[project][value].logs.length > 100) {
      logs[project][value].logs.shift(); // 保留最近 1000 行
    }
    res.write(data);
  });

  // 错误输出
  child.stderr.on("data", data => {
    const buf = Buffer.from(data);
    const str = buf.toString(); // 默认 utf8
    logs[project][value].logs.push({text: str, type: 'error'});
    if (logs[project][value].logs.length > 100) {
      logs[project][value].logs.shift(); // 保留最近 1000 行
    }
    res.write(`[[E]][错误] ${data}`);
  });

  // 进程出错（启动失败）
  child.on("error", err => {
    logs[project][value].logs.push({text: err.message, type: 'error'});
    if (logs[project][value].logs.length > 100) {
      logs[project][value].logs.shift(); // 保留最近 1000 行
    }
    res.write(`[[E]][进程启动失败] ${err.message}`);
    res.end();
    currentChild[`${project}:${value}`] = null;
    console.log(`${project}:${value}: 进程启动失败`)
  });

  // 进程退出
  child.on("close", code => {
    if (code === 0) {
      console.log(`\n✅ 进程:${project}:${value} ; 正常退出（退出码 ${code}）`)
      res.end(`\n✅ 进程正常退出（退出码 ${code}）`);
    } else {
      console.log(`\n❌ 进程:${project}:${value} ; 异常退出（退出码 ${code}）`)
      res.end(`\n❌ 进程异常退出（退出码 ${code}）`);
    }
    currentChild[`${project}:${value}`] = null;
  });

  // req.on('close', () => {
  //   if (!res.writableEnded) res.end();
  // });
});

app.post('/api/project/stopCommand', async (req, res) => {
  const {path, command, value, project} = req.body;
  if (currentChild?.[`${project}:${value}`]) {
    let killRes = await killChild(currentChild?.[`${project}:${value}`], 'SIGINT');
    if (!killRes) {
      killRes = await killChild(currentChild?.[`${project}:${value}`], 'SIGINT');
    }
    logs[project][value] = undefined;
    currentChild[`${project}:${value}`] = undefined;
    res.send({msg: '', code: 0, success: killRes, data: killRes});
  } else {
    res.send({msg: '此项目可能未运行或出错', code: 2, success: false, data: `${project}:${value}`});
  }
});

app.post('/api/project/getRunningList', (req, res) => {
  const result = {};
  Object.keys(currentChild).map(_ => {
    let names = _.split(":");
    if (!result[names[0]]) {
      result[names[0]] = [];
    }
    result[names[0]].push(names[1]);
  });
  res.send({success: true, data: result, code: 0, msg: ''})
})

app.post('/api/project/addProjectFolder', async (req, res) => {
  let config = getConfig(true);
  if (!config) {
    config = {}
  }
  if (!config.projectPaths) {
    config.projectPaths = [];
  }
  if (!config.projectList) {
    config.projectList = [];
  }
  const _path = await pkg({type: "directory"});
  if (_path) {
    config.projectPaths.push(..._path);
    setConfig(config);
    res.send({success: true, data: _path, code: 0, msg: ''});
  } else {
    res.status(500).send({success: false, data: null, code: 1, msg: '执行错误'});
  }
})

app.post('/api/project/openInVscode', (req, res) => {
  const {path} = req.body;
  const isWin = process.platform === 'win32';
  const cmd = isWin ? 'cmd' : 'sh';
  const args = isWin ? ['/c', `code ${path}`] : ['-c', `code ${path}`];
  try {
    spawn(cmd, args);
    res.send({
      success: true, msg: '', data: null, code: 0
    })
  } catch (error) {
    res.status(500).send({
      success: false, msg: '', error, data: null, code: 0
    })
  }
})
