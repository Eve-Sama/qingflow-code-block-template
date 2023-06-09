import { getField } from './init';
import { Output } from './interface';
import { finishOutput, initOutput } from '@common/required';

// 初始化输出的变量, 之后只需要修改该对象的子属性即可
const output = initOutput<Output>({
  sum: 0,
});

const num1 = getField('num1');
const num2 = getField('num2');
const sum = num1 + num2;

output.sum = sum;

// 一旦调用该函数, 代码块结束运算
finishOutput();