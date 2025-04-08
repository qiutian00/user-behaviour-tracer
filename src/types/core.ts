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
  processData?: false | ((data: UserBehaviourResult) => any);
  clearAfterProcess?: boolean;
  userInfo?: boolean;
}

export interface MousePosition {
  x: number;
  y: number;
  time: string;
}

export interface ClickDetail {
  x: number;
  y: number;
  path: string;
  node: string;
  time: string;
}

export interface PageChangeDetail {
  type: 'pushState' | 'replaceState' | 'hashchange';
  oldURL: string;
  newURL: string;
  time: string;
}

export interface KeyLogDetail {
  time: string;
  data: string;
  type: 'keypress' | 'paste';
}

export interface ContextChangeDetail {
  time: string;
  url: string;
  type: string; // 'visible' | 'hidden'
}

export interface UserBehaviourResult {
  userInfo?: {
    appCodeName: string;
    appName: string;
    vendor: string;
    platform: string;
    userAgent: string;
  };
  time?: {
    startTime: string;
    currentTime: string;
  };
  clicks?: {
    clickCount: number;
    clickDetails: Array<Array<ClickDetail>>;
  };
  mouseMovements?: Array<Array<MousePosition>>;
  mouseScroll?: Array<Array<MousePosition>>;
  mousePageChanges?: Array<Array<PageChangeDetail>>;
  keyLogger?: Array<KeyLogDetail>;
  contextChange?: Array<ContextChangeDetail>;
}