import { exec } from "child_process";
let cmd;
const openUrl = (port) => {
  const url = `http://localhost:${port}/index.html`;
  switch (process.platform) {
    case "win32":
      cmd = `start "" "${url}"`;
      break;
    case "darwin":
      cmd = `open "${url}"`;
      break;
    case "linux":
      cmd = `xdg-open "${url}"`;
      break;
    default:
      console.error("未知平台");
      process.exit(1);
  }
  console.log("url:", url);
  // exec(cmd, (err) => {
  //   if (err) console.error("打开浏览器失败:", err);
  //   else console.log("url:", url);
  // });
}
export default openUrl