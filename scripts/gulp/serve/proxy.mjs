import minimist from 'minimist';
import proxy from 'koa-proxies';

export default {
  port: 8080,
  nodeResolve: true,
  watch: true,
  appIndex: 'index.html',
  plugins: [
    {
      transform(context) {
        const { project } = minimist(process.argv.slice(2));
        if (context.response.is('html')) {
          return { body: context.body.replace(/\$project\$/g, project) };
        }
      },
    },
  ],
  middleware: [
    proxy('/api.qingflow.com', {
      target: 'https://api.qingflow.com',
      changeOrigin: true,
      rewrite: path => path.replace('/api.qingflow.com', ''),
      logs: (ctx, target) => {
        // 如果代理异常, 可以通过 console 看看实际转发的地址是否正确
        // console.log(`${ctx.req.oldPath} => ${new URL(ctx.req.url, target)}`)
      },
    }),
  ],
};
