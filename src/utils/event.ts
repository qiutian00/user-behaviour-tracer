/**
 * 为 History API 添加事件支持
 * 
 * 原生 History API 的 pushState 和 replaceState 方法不会触发事件，这个函数
 * 创建了一个包装器，使这些方法在调用时能够触发自定义事件。
 * 
 * @param type - History API 方法名 ('pushState' 或 'replaceState')
 * @returns 增强的 History 方法，执行原始操作并触发自定义事件
 */
export const bindHistoryEvent = <T extends keyof History>(type: T): (() => any) => {
  const originalMethod = history[type];
  
  return function (this: History, ...args: any[]) {
    // 执行原始 History 方法
    const result = originalMethod.apply(this, args);
    
    // 创建自定义事件
    const event = new Event(type);
    
    // 将参数附加到事件对象
    (event as any).arguments = args;
    
    // 触发事件
    window.dispatchEvent(event);
    
    // 返回原始方法的结果
    return result;
  };
};
