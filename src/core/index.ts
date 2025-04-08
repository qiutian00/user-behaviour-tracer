import UserBehaviour from './userBehaviour.js'
import {
  UserConfig,
  UserBehaviourResult
} from '../types/core.js'

declare global {
  interface Window {
    userBehaviour: {
      showConfig: () => UserConfig;
      config: (config: UserConfig) => void;
      start: () => void;
      stop: () => void;
      showResult: () => UserBehaviourResult;
      processResults: () => void;
    };
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
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log("用户行为跟踪数据:", results);
    }
  }
};

const instance = new UserBehaviour(defaults);

const globalInstance = {
  showConfig: instance.showConfig.bind(instance),
  config: instance.config.bind(instance),
  start: instance.start.bind(instance),
  stop: instance.stop.bind(instance),
  showResult: instance.result.bind(instance),
  processResults: instance.processResults.bind(instance),
};

if (typeof window !== 'undefined') {
  window.userBehaviour = globalInstance;
  globalInstance.start();
}

export { UserConfig, UserBehaviourResult };
export default UserBehaviour;
