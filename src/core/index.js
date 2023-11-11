

import userBehaviour from './userBehaviour'


const defaults = {
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

const instance =  new userBehaviour(defaults)

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

// export {
//   DefaultConfigOptions,
// } from './types/core.ts'
export default userBehaviour
