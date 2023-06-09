/**
 * 本文件主要存放所有代码块项目必须使用到的东西
 */

import { mode } from './utils';

/** 代码块所需要的回调变量, 只能被赋值一次, 一旦赋值则代码块终止运行 */
let qf_output: Record<string, any>;

/** 填充 */
let output: Record<string, any>;

/** 对返回值进行初始化 */
export function initOutput<TOutput>(data: TOutput) {
  output = data;
  return output as TOutput;
}

/** 一旦调用该函数, 意味着代码块立刻返回值不再继续执行 */
export function finishOutput(): void {
  qf_output = output;
  console.log(qf_output);
}

/** 根据环境, 获取字段值 */
export function createGetField<TInput>(developmentInput: TInput, productionInput: TInput) {
  return <T extends keyof TInput>(type: T) => {
    const fieldInfo = mode === 'development' ? developmentInput : productionInput;
    return fieldInfo[type] as TInput[T];
  };
}
