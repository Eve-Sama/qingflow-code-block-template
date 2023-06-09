/** 运行时的模式, 主要用于判断读取数据时应该读后端数据还是读本地数据 */
export const mode: 'development' | 'production' = typeof window === 'object' ? 'development' : 'production';

/**
 * 代码块不允许使用定时器, 手写一个
 * @param time 等待的毫秒数
 * @returns void
 */
export function sleep(time: number): Promise<void> {
  return new Promise(r => {
    let keep = true;
    const currentTime = new Date().getTime();
    while (keep) {
      const newTime = new Date().getTime();
      if (currentTime + time < newTime) {
        keep = false;
      }
    }
    r();
  });
}