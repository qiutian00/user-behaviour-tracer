export interface DefaultConfigOptions {
  userInfo: boolean,
  clicks: boolean,
  mouseMovement: boolean,
  mouseMovementInterval: number,
  mouseScroll: boolean,
  mousePageChange: boolean,
  keyLogger: boolean,
  contextChange: boolean,
  timeCount: boolean,
  clearAfterProcess: boolean,
  processTime: number,
  processData: false | ((data: any) => any),
}