import { bindHistoryEvent } from '../utils/event';
import {
  UserConfig,
  UserBehaviourResult,
  MousePosition,
  ClickDetail,
  PageChangeDetail,
  KeyLogDetail,
  ContextChangeDetail
} from '../types/core.js'

// 为History事件添加自定义事件接口
interface CustomHistoryEvent extends Event {
  arguments?: any[];
}

class UserBehaviour {
  private defaults: UserConfig;
  private user_config: UserConfig;
  private mem: {
    processInterval: ReturnType<typeof setInterval> | null;
    mouseInterval: ReturnType<typeof setInterval> | null;
    mousePosition: MousePosition[];
    eventListeners: Record<string, EventListenerOrEventListenerObject>;
    eventsFunctions: {
      scroll: (e: Event) => void;
      click: (e: MouseEvent) => void;
      mouseMovement: (e: MouseEvent) => void;
      pushState: (e: CustomHistoryEvent) => void;
      replaceState: (e: CustomHistoryEvent) => void;
      hashchange: (e: HashChangeEvent) => void;
      paste: (e: ClipboardEvent) => void;
      keyup: (e: KeyboardEvent) => void;
      visibilitychange: (e: Event) => void;
    };
  };
  private results: UserBehaviourResult;

  constructor(defaults: UserConfig) {
    this.defaults = {
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
      processData: function(results){
          console.log(results);
      },
    }
    this.defaults = {
      ...this.defaults,
      ...defaults
     };
    this.user_config = this.defaults;
    this.config(this.defaults);
    this.mem = {
      processInterval: null,
      mouseInterval: null,
      mousePosition: [],
      eventListeners: {},
      eventsFunctions: {
        scroll: (e: Event) => {
          if (!this.results.mouseScroll) this.results.mouseScroll = [];
          this.results.mouseScroll.push([{
            x: window.scrollX,
            y: window.scrollY, 
            time: this.getTimeStamp()
          }]);
        },
        click: (e: MouseEvent) => {
          if (!this.results.clicks) return;
          this.results.clicks.clickCount++;
          const path: string[] = [];
          let node = "";
          e.composedPath().forEach((el: EventTarget, i: number) => {
            if (i < e.composedPath().length - 2) {
              const element = el as Element;
              if (!element.localName) return;
              
              node = element.localName;
              
              if (element.className && element.classList) {
                element.classList.forEach((clE: string) => {
                  node += "." + clE;
                });
              }
              
              if (element.id) {
                node += "#" + element.id;
              }
              
              path.push(node);
            }
          });
          
          this.results.clicks.clickDetails.push([
            {
              x: e.clientX,
              y: e.clientY,
              path: path.reverse().join(">"),
              node: (e.target as Element).outerHTML,
              time: this.getTimeStamp(),
            },
          ]);
        },
        mouseMovement: (e: MouseEvent) => {
          this.mem.mousePosition = [
            {
              x: e.clientX,
              y: e.clientY,
              time: this.getTimeStamp(),
            },
          ];
        },
        pushState: (e: CustomHistoryEvent) => {
          const args = e.arguments || [];
          const path = args.length > 2 ? args[2] : '';
          const url = /^http/.test(path as string)
            ? path
            : location.protocol + '//' + location.host + path;

          if (!this.results.mousePageChanges) this.results.mousePageChanges = [];
          this.results.mousePageChanges.push([
            {
              type: 'pushState',
              oldURL: location.href,
              newURL: url as string,
              time: this.getTimeStamp(),
            },
          ]);
        },
        replaceState: (e: CustomHistoryEvent) => {
          const args = e.arguments || [];
          const path = args.length > 2 ? args[2] : '';
          const url = /^http/.test(path as string)
            ? path
            : location.protocol + '//' + location.host + path;

          if (!this.results.mousePageChanges) this.results.mousePageChanges = [];
          this.results.mousePageChanges.push([
            {
              type: 'replaceState',
              oldURL: location.href,
              newURL: url as string,
              time: this.getTimeStamp(),
            },
          ]);
        },
        hashchange: (e: HashChangeEvent) => {
          if (!this.results.mousePageChanges) this.results.mousePageChanges = [];
          this.results.mousePageChanges.push([
            {
              type: 'hashchange',
              oldURL: e.oldURL,
              newURL: e.newURL,
              time: this.getTimeStamp(),
            },
          ]);
        },
        paste: (e: ClipboardEvent) => {
          if (!this.results.keyLogger) this.results.keyLogger = [];
          let pastedText = undefined;
          // Get Pasted Text
          if (e.clipboardData && e.clipboardData.getData) {
            pastedText = e.clipboardData.getData('text/plain');
          }

          if (pastedText) {
            this.results.keyLogger.push({
              time: this.getTimeStamp(),
              data: pastedText,
              type: 'paste',
            });
          }
        },
        keyup: (e: KeyboardEvent) => {
          if (!this.results.keyLogger) this.results.keyLogger = [];
          const charCode = e.keyCode || e.which;
          const charString = String.fromCharCode(charCode);

          this.results.keyLogger.push({
            time: this.getTimeStamp(),
            data: charString,
            type: 'keypress',
          });
        },
        visibilitychange: (e: Event) => {
          if (!this.results.contextChange) this.results.contextChange = [];
          this.results.contextChange.push({
            time: this.getTimeStamp(),
            url: window.location.href,
            type: document.visibilityState,
          });
        },
      },
    };

    this.results = {};

    this.resetResults();
  }

  resetResults() {
    this.results = {
      userInfo: {
        appCodeName: navigator.appCodeName || '',
        appName: navigator.appName || '',
        vendor: navigator.vendor || '',
        platform: navigator.platform || '',
        userAgent: navigator.userAgent || '',
      },
      time: {
        startTime: '',
        currentTime: '',
      },
      clicks: {
        clickCount: 0,
        clickDetails: [],
      },
      mouseMovements: [],
      mouseScroll: [],
      mousePageChanges: [],
      keyLogger: [],
      contextChange: [],
    };
  }

  getTimeStamp(): string {
    return new Date().toISOString();
  }

  config(ob: UserConfig) {
    this.user_config = {
      ...this.defaults,
      ...ob
    };
  }

  start() {
    // TIME SET
    if (this.user_config.timeCount !== undefined && this.user_config.timeCount) {
      if (this.results.time) {
        this.results.time.startTime = this.getTimeStamp();
      }
    }
    
    // MOUSE MOVEMENTS
    if (this.user_config.mouseMovement) {
      // 移除可能存在的监听器，防止重复绑定
      this.removeEventListener('mousemove');
      
      // 添加新的监听器
      const mouseHandler = ((e: Event) => this.mem.eventsFunctions.mouseMovement(e as MouseEvent)) as EventListener;
      window.addEventListener('mousemove', mouseHandler);
      this.mem.eventListeners.mousemove = mouseHandler;
      
      // 清除可能存在的旧定时器
      if (this.mem.mouseInterval) {
        clearInterval(this.mem.mouseInterval);
      }
      
      this.mem.mouseInterval = setInterval(() => {
        if (this.mem.mousePosition && this.mem.mousePosition.length) {
          if (
            !this.results.mouseMovements?.length ||
            (this.mem.mousePosition[0] !==
              this.results.mouseMovements[this.results.mouseMovements.length - 1][0] &&
              this.mem.mousePosition[1] !==
                this.results.mouseMovements[this.results.mouseMovements.length - 1][1])
          ) {
            if (!this.results.mouseMovements) this.results.mouseMovements = [];
            this.results.mouseMovements.push(this.mem.mousePosition);
          }
        }
      }, this.defaults.mouseMovementInterval * 1000);
    }
    
    // CLICKS
    if (this.user_config.clicks) {
      this.removeEventListener('click');
      const clickHandler = ((e: Event) => this.mem.eventsFunctions.click(e as MouseEvent)) as EventListener;
      window.addEventListener('click', clickHandler);
      this.mem.eventListeners.click = clickHandler;
    }
    
    // History API 事件
    if (this.user_config.mousePageChange) {
      window.history['pushState'] = bindHistoryEvent('pushState');
      window.history['replaceState'] = bindHistoryEvent('replaceState');

      // 移除旧的监听器
      this.removeEventListener('pushState');
      this.removeEventListener('replaceState');
      this.removeEventListener('hashchange');
      
      // 添加新的监听器
      const pushStateHandler = ((e: Event) => this.mem.eventsFunctions.pushState(e as CustomHistoryEvent)) as EventListener;
      const replaceStateHandler = ((e: Event) => this.mem.eventsFunctions.replaceState(e as CustomHistoryEvent)) as EventListener;
      const hashChangeHandler = ((e: Event) => this.mem.eventsFunctions.hashchange(e as HashChangeEvent)) as EventListener;
      
      window.addEventListener('pushState', pushStateHandler);
      window.addEventListener('replaceState', replaceStateHandler);
      window.addEventListener('hashchange', hashChangeHandler);
      
      this.mem.eventListeners.pushState = pushStateHandler;
      this.mem.eventListeners.replaceState = replaceStateHandler;
      this.mem.eventListeners.hashchange = hashChangeHandler;
    }
    
    // keyLogger
    if (this.user_config.keyLogger) {
      this.removeEventListener('paste');
      this.removeEventListener('keyup');
      
      const pasteHandler = ((e: Event) => this.mem.eventsFunctions.paste(e as ClipboardEvent)) as EventListener;
      const keyupHandler = ((e: Event) => this.mem.eventsFunctions.keyup(e as KeyboardEvent)) as EventListener;
      
      document.addEventListener('paste', pasteHandler);
      document.addEventListener('keyup', keyupHandler);
      
      this.mem.eventListeners.paste = pasteHandler;
      this.mem.eventListeners.keyup = keyupHandler;
    }
    
    // contextChange
    if (this.user_config.contextChange) {
      this.removeEventListener('visibilitychange');
      
      document.addEventListener('visibilitychange', this.mem.eventsFunctions.visibilitychange);
      this.mem.eventListeners.visibilitychange = this.mem.eventsFunctions.visibilitychange;
    }
    
    // SCROLL
    if (this.user_config.mouseScroll) {
      this.removeEventListener('scroll');
      
      window.addEventListener('scroll', this.mem.eventsFunctions.scroll);
      this.mem.eventListeners.scroll = this.mem.eventsFunctions.scroll;
    }
    
    // PROCESS INTERVAL
    if (this.user_config.processTime !== false) {
      // 清除可能存在的旧定时器
      if (this.mem.processInterval) {
        clearInterval(this.mem.processInterval);
      }
      
      this.mem.processInterval = setInterval(() => {
        if(this.user_config.processData) {
          this.user_config.processData(this.result());
        }
      }, this.user_config.processTime * 1000);
    }
  }

  // 辅助方法：移除事件监听器
  private removeEventListener(eventName: string) {
    if (this.mem.eventListeners[eventName]) {
      const target = eventName === 'paste' || eventName === 'keyup' || eventName === 'visibilitychange' 
        ? document 
        : window;
      
      target.removeEventListener(
        eventName, 
        this.mem.eventListeners[eventName] as EventListener
      );
      
      delete this.mem.eventListeners[eventName];
    }
  }

  processResults() {
    if(this.user_config.processData) {
      this.user_config.processData(this.result());
    }
    if (this.user_config.clearAfterProcess) {
      this.resetResults();
    }
  }

  stop() {
    // 清除定时器
    if (this.mem.processInterval) {
      clearInterval(this.mem.processInterval);
      this.mem.processInterval = null;
    }
    
    if (this.mem.mouseInterval) {
      clearInterval(this.mem.mouseInterval);
      this.mem.mouseInterval = null;
    }

    // 移除所有事件监听器
    const listenerKeys = Object.keys(this.mem.eventListeners);
    listenerKeys.forEach((keyName) => {
      const target = keyName === 'paste' || keyName === 'keyup' || keyName === 'visibilitychange' 
        ? document 
        : window;
        
      target.removeEventListener(
        keyName, 
        this.mem.eventListeners[keyName] as EventListener
      );
      
      delete this.mem.eventListeners[keyName];
    });
  }

  result(): UserBehaviourResult {
    if (
      this.user_config.userInfo === false &&
      this.results.userInfo !== undefined
    ) {
      delete this.results.userInfo;
    }
    if (this.user_config.timeCount !== undefined && this.user_config.timeCount && this.results.time) {
      this.results.time.currentTime = this.getTimeStamp();
    }
    return this.results;
  }

  showConfig(): UserConfig {
    return this.user_config;
  }
}

export default UserBehaviour;
