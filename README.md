## qingflow-code-block-template

轻流代码块的前端工程化模板项目, 提供本地调试、一键构建、类型增强等, 适用于中大型代码块业务. 如果你是个专业开发, 而又需要用到轻流代码块功能, 那么这个项目将助力你获得更好的开发体验与维护能力. 下文简称本项目为`QCBT`. 轻流是个无代码产品, 面向业务人员开发系统. 那么只要是开发系统, 都会面临一些定制化的需求. 轻流有各种各样的功能来满足尽可能多的需求, 但是总归有些需求过于自定义, 而现有标准功能很难满足. 于是推出了代码块功能, 作为兜底方案, 允许业务人员编写代码逻辑以支持更加自定义的需求. 而轻流的代码块交互, 对于职业开发来说效率是不够的, 本项目的初衷就是为了解决开发体验不足和维护困难的问题.

## 原生代码块是如何使用的?

首先, 编写代码块一般要经过下面3个步骤.
 1. 从表单中获取字段的值
 2. 编辑代码逻辑
 3. 返回值
 4. 设置字段读取代码块的返回值

我们来看一个实操案例. 

![image-20230609151632031](https://eve-sama.oss-cn-shanghai.aliyuncs.com/blog/202306091516103.png)

在这份轻流表单中, 我们需要计算`数字1`和`数字2`的总和. 

 > 这么简单的功能完全不必用代码块这种重型武器, 本文只是为了方便演示.

### 编写代码块逻辑
首先需要在`代码块`中获取到`数字1`和`数字2`的字段值.

![image-20230609154059894](https://eve-sama.oss-cn-shanghai.aliyuncs.com/blog/202306091540913.png)

之后需要对内置返回对象赋值. 完整代码如下
```js
// qf_field.xxx 是轻流对字段的id进行的加密, 在运行时会被替换为表单字段的值
const num1 = qf_field.{数字1$$1523CE68A$$};
const num2 = qf_field.{数字2$$1523CE68B$$};
const sum = num1 + num2;
// qf_output 无需声明, 是内置对象, 一旦赋值, 代码块结束计算
qf_output = { sum };
```

### 测试运行

输入模拟值, 查看返回值是否符合预期

![image-20230609154754738](https://eve-sama.oss-cn-shanghai.aliyuncs.com/blog/202306091547792.png)

### 设置别名

需要使用 `JSON path`来解析返回值.

![image-20230609154855415](https://eve-sama.oss-cn-shanghai.aliyuncs.com/blog/202306091548444.png)

### 对表单字段设置值

代码块只是独立的计算逻辑, 还需要设置返回值赋值给哪些字段

![](https://eve-sama.oss-cn-shanghai.aliyuncs.com/blog/202306091551574.png)

![image-20230609155304558](https://eve-sama.oss-cn-shanghai.aliyuncs.com/blog/202306091553581.png)

## QCBT是如何使用的?

前面简述了求和场景的原生代码块用法. 会发现存在以下几个痛点.
 - 编写体验差. 在线调试和本地IDE有着质的区别, 如代码提示、补全等.
 - 测试困难. 每次都需要在测试界面输入值进行测试.
 - 维护困难. JS无法保证类型, 且代码全部写在一个文件里, 长期会臃肿.

接下来, 将基于求和的场景, 用QCBT来演示下如何快速完成需求.

### 下载QCBT

```bash
git clone git@github.com:Eve-Sama/qingflow-code-block-template.git
```

### 新增项目

在`packages`文件夹中已包含一个`common`项目, 这个项目包含了很多非常重要的东西, 后文会解释. 此时我们需要做的就是先新增一个针对求和的业务文件夹. 

```
packages
│
└─── calculate-sum // 业务文件夹名字
│   │
│   └─── src
│       │   index.ts // 业务的入口
│       │   init.ts // 初始化开发与生产的字段
│       │   interface.ts // 类型定义
└─────── tsconfig.json // 从 common 包里拷贝一个即可
```

### 书写类型定义

在`interface.ts`当中定义我们需要的输入和输出的类型. 所谓输入, 就是从表单中需要拿到的字段. 输出则是结束代码块运算后需要给轻流返回的数据结构.

```ts
export interface Input {
  num1: number;
  num2: number;
}

export interface Output {
  sum: number;
}
```

### 初始化字段

在`init.ts`中我们主要定义字段的测试值和生产值.

```ts
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
```

### 编写业务逻辑

在`index.ts`中, 我们开始书写业务逻辑. 只有`initOutput`和`finishOutput`是必须调用的, 其他的都和普通代码开发没有区别.

```ts
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
```

### 本地测试

在`package.json`中加入以下代码 `--project`的值就是你项目文件夹的名字.

```json
"scripts": {
  "start:cs": "gulp start --project=calculate-sum",
  "build:cs": "gulp build --project=calculate-sum",
},
```

在编写完业务代码后, 我们可以进行本地测试.

```bash
npm run start:cs
```

之后在`8080`端口可以看到这样的效果

![image-20230609170921467](https://eve-sama.oss-cn-shanghai.aliyuncs.com/blog/202306091709497.png)

### 构建代码

```bash
npm run build:cs
```

在看到如下提示后, 可以在`dist`中看到`calculate-sum-bundle.js`的文件, 将该代码拷贝到代码块当中即可.

![image-20230609174245929](https://eve-sama.oss-cn-shanghai.aliyuncs.com/blog/202306091742967.png)

## common 包里有什么?

`common`包里只有2个子包. 这些子包提供了各种语法糖来衔接代码块开发和程序开发之间的不同.

### required

所有代码块项目必须使用到的一些语法糖.

 - initOutput: 初始化返回值, 并返回实例对象, 后续的修改都通过该对象
 - finishOutput: 结束计算, 立刻返回
 - createGetField: 根据开发和生产的环境不同, 来决定取哪个值

### utils

主要提供些可能用得到的通常变量与方法.

 - mode: 判断是在开发环境还是运行时
 - sleep: 同步堵塞函数, 比如等待3秒后执行, sleep(3000)

## FAQ

### 是否支持跨域配置?

支持的. 搜索`proxy.mjs`可以查看代理配置. 这里默认配置了轻流的openAPI的代理.

```mjs
proxy('/api.qingflow.com', {
  target: 'https://api.qingflow.com',
  changeOrigin: true,
  rewrite: path => path.replace('/api.qingflow.com', ''),
  logs: (ctx, target) => {
    // 如果代理异常, 可以通过 console 看看实际转发的地址是否正确
    // console.log(`${ctx.req.oldPath} => ${new URL(ctx.req.url, target)}`)
  },
}),
```

比如你想获取数据表的记录. 建议使用下面的写法
```ts
const urlPrefix = mode === 'development' ? '/api.qingflow.com' : 'https://api.qingflow.com';
const url = `${urlPrefix}/app/c5e02ab7/apply/filter`;
```

### 目录结构有什么要注意的吗?

每个项目必须存在`src/index.ts`这个文件, 这也是打包的入口. 其他的可以任意设计, 比如在`src`下面添加`bussiness`、`request`文件夹之类的, 都是可以的.


## 特别感谢

QCBT是在长期的代码块业务中迭代出来的, 已服务于轻流内部多个代码块场景. 特别感谢 [aimerthyr](https://github.com/aimerthyr) 同学对于QCBT的构建、工程化等方面的卓越贡献!
