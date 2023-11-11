

import userBehaviour from './userBehaviour.js'
import {
  UserConfig
} from '../types/core.js'

declare global {
  interface Window {
    // 在这里添加 window 对象上的属性声明
    userBehaviour: any;
  }
}

const defaults: UserConfig = {
  userInfo: true,
  clicks: true,
  mouseMovement: true,
  mouseMovementInterval: 1,
  mouseScroll: true,
  mousePageChange: true,
  keyLogger: false,
  contextChange: false,
  timeCount: true,
  clearAfterProcess: true,
  processTime: 15,
  processData: function (results) {
      // console.log("processData:", results);
  }
};

const instance =  new userBehaviour(defaults as UserConfig)


const globalInstance =  {
  showConfig: instance.showConfig.bind(instance),
  config: instance.config.bind(instance),
  start: instance.start.bind(instance),
  stop: instance.stop.bind(instance),
  showResult: instance.result.bind(instance),
  processResults: instance.processResults.bind(instance),
};

// userBehaviour export to window
if(window) {
  window.userBehaviour = globalInstance;
  // start add listener to catch userBehaviour
  globalInstance.start();
}

// console.log('userBehaviour exec', userBehaviour)


export { UserConfig };
export default userBehaviour
