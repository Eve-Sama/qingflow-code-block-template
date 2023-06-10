import { Input } from './interface';
import { createGetField } from '@common/required';

// 运行时从表单拿字段
export const productionInput: Input = {
  num1: 'qf_field.{数字1$$1523CE68A$$}' as unknown as Input['num1'],
  num2: 'qf_field.{数字2$$1523CE68B$$}' as unknown as Input['num2'],
};

// 本地开发时的测试值
export const developmentInput: Input = {
  num1: 1,
  num2: 2,
};

// getField 根据开发和生产的环境不同, 来决定取哪个值
export const getField = createGetField(developmentInput, productionInput);