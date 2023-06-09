import { task, TaskFunction } from 'gulp';
import concurrently from 'concurrently';
import minimist from 'minimist';
import { existsSync, rmdirSync } from 'fs';

/** 开启本地 server 任务 */
function _serve(): TaskFunction {
  const { project } = minimist(process.argv.slice(2));
  return (done: Function) => {
    // 启动本地前删除public目录
    const ouputDir = 'public';
    if (existsSync(ouputDir)) {
      rmdirSync(ouputDir, { recursive: true })
    }
    const child_process = concurrently([`tsc-watch --project packages/${project} --onSuccess 'tsc-alias -w -p packages/${project}/tsconfig.json'`, `web-dev-server --config scripts/gulp/serve/proxy.mjs --project=${project}`], {});
    child_process.result
      .then(() => done())
      .catch(() => done(new Error(`Process failed`)));
  };
}

task('start', _serve());
