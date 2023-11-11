export interface UserConfig {
  timeCount?: boolean;
  mouseMovement?: boolean;
  mouseMovementInterval: number;
  clicks?: boolean;
  mousePageChange?: boolean;
  keyLogger?: boolean;
  contextChange?: boolean;
  mouseScroll?: boolean;
  processTime: number | false;
  processData?: false | ((data: any) => any);
  clearAfterProcess?: boolean;
  userInfo?: boolean;
}