import ansiColors from 'ansi-colors';
import { spawn } from 'child_process';
import { task, TaskFunction } from 'gulp';
import minimist from 'minimist';

/** 开启打包📦任务 */
function _start(): TaskFunction {
  const { project } = minimist(process.argv.slice(2));
  return (done: Function) => {
    const child_process = spawn('ts-node', ['--project', `packages/${project}`, 'scripts/gulp/build/build.ts'], {
      env: { ...process.env, project },
      stdio: 'inherit',
    });
    child_process.on('close', (code: number) => {
      if (code !== 0) {
        done(new Error(`Process failed with code ${code}`));
      } else {
        done();
        console.log(`${ansiColors.bold.red(project)} ${ansiColors.bold.green(' for QingFlow has been built!')}`);
      }
    });
  };
}

task('build', _start());
