import process from 'process';
import { RollupOptions, rollup, OutputOptions } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import fs from 'fs';

/** 获取打包路径 */
function _getBundleURL(): string {
  return `dist/${process.env.project}-bundle.js`;
}

/** 生成最终代码块打包的文件 */
async function _build() {
  // #region 使用 rollup 进行打包
  const config: RollupOptions = {
    input: `packages/${process.env.project}/src/index.ts`,
    output: {
      file: _getBundleURL(),
      format: 'cjs',
    },
    plugins: [
      commonjs(),
      typescript({
        tsconfig: `packages/${process.env.project}/tsconfig.json`,
      }),
    ],
    external: ['axios-esm', 'lodash-es'],
  }
  fs.rmSync(_getBundleURL(), { recursive: true, force: true });
  const { output: outputOption, ...inputOption } = config;
  const bundle = await rollup(inputOption);
  const output = outputOption as OutputOptions;
  await bundle.generate(output);
  await bundle.write(output);
  // #endregion
  // #region 对打包后的 bundle 进行处理
  replaceCode();
  deleteCode();
  // #endregion
 }

/**
 * 转换函数
 * 1. 替换es模块的包名
 * 2. 去掉字段的引号
 */
 function replaceCode(): void {
  const file = fs.readFileSync(_getBundleURL(), 'utf-8');
  let content = file;
  const transformList: Map<RegExp, string> = new Map([
    [/'(qf_field.*)'/g, '$1'],
    [/axios-esm/g, 'axios'],
    [/lodash-es/g, 'lodash'],
    // 将本地调试内容置空
    [/(?<=(developmentInput = ))([\s\S]*?);/g, '{}']
  ]);
  transformList.forEach((value, reg) => {
    content = content.replace(reg, value)
  })
  fs.writeFileSync(_getBundleURL() , content);
}

/**
 * 代码块因为后端实现的原因, 存在一些硬性规则, 这里会删掉一些生产环境不该出现的代码.
 * 1. console: 当 qf_output 赋值时再 console 会报错, 因此移除 console
 * 2. qf_output: 为后端定义变量, 不允许重复声明
 * 3. use strict: 严格模式的声明也是不被允许的
 */
function deleteCode(): void {
  const file = fs.readFileSync(_getBundleURL(), 'utf-8');
  const lines = file.split('\n');
  const needList: string[] = [];
  // 去掉严格模式
  const needRemoveList = [`console.`, `let qf_output;`, `'use strict';`];
  lines.forEach(v => {
    if (needRemoveList.every(remove => v.indexOf(remove) === -1)) {
      needList.push(`${v}\n`);
    }
  });
  const res = needList.join('');
  fs.writeFileSync(_getBundleURL(), res);
}

_build();
