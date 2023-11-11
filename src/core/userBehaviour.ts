import { bindHistoryEvent } from '../utils/event';
import {
  UserConfig
} from '../types/core.js'

class UserBehaviour {
  private defaults: UserConfig;
  private user_config: UserConfig;
  private mem: any;
  private results: any;

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
      eventListeners: {
        scroll: null,
        click: null,
        mouseMovement: null,
      },
      eventsFunctions: {
        scroll: () => {
          this.results.mouseScroll.push([{
            x: window.scrollX,
            y:window.scrollY, 
            time:this.getTimeStamp()
          }]);
        },
        click: (e: MouseEvent) => {
          this.results.clicks.clickCount++;
          const path: string[] = [];
          let node = "";
          e.composedPath().forEach((el: EventTarget, i: number) => {
            if ((i !== e.composedPath().length - 1) && (i !== e.composedPath().length - 2)) {
              node = (el as Element).localName;
              (el as Element).className !== ""
                ? (el as Element).classList.forEach((clE: string) => {
                    node += "." + clE;
                  })
                : 0;
              (el as Element).id !== "" ? (node += "#" + (el as Element).id) : 0;
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
        pushState: (e: any) => {
          const path = e && e.arguments.length > 2 && e.arguments[2];
          const url = /^http/.test(path)
            ? path
            : location.protocol + '//' + location.host + path;
          console.log('pushState old:' + location.href, 'new:' + url);

          this.results.mousePageChanges.push([
            {
              type: 'pushState',
              oldURL: location.href,
              newURL: url,
              time: this.getTimeStamp(),
            },
          ]);
        },
        replaceState: (e: any) => {
          const path = e && e.arguments.length > 2 && e.arguments[2];
          const url = /^http/.test(path)
            ? path
            : location.protocol + '//' + location.host + path;
          console.log('replaceState old:' + location.href, 'new:' + url);

          this.results.mousePageChanges.push([
            {
              type: 'replaceState',
              oldURL: location.href,
              newURL: url,
              time: this.getTimeStamp(),
            },
          ]);
        },
        hashchange: (e: HashChangeEvent) => {
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
          let pastedText = undefined;
          // Get Pasted Text
          if (e.clipboardData && e.clipboardData.getData) {
            pastedText = e.clipboardData.getData('text/plain');
          }

          if (!!pastedText) {
            this.results.keyLogger.push({
              time: this.getTimeStamp(),
              data: pastedText,
              type: 'paste',
            });
          }
        },
        keyup: (e: KeyboardEvent) => {
          const charCode = e.keyCode || e.which;
          const charString = String.fromCharCode(charCode);

          this.results.keyLogger.push({
            time: this.getTimeStamp(),
            data: charString,
            type: 'keypress',
          });
        },
        visibilitychange: (e: Event) => {
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
        startTime: 0,
        currentTime: 0,
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

  getTimeStamp() {
    return new Date().toLocaleString();
  }

  config(ob: UserConfig) {
    // this.user_config = {};
    // Object.keys(this.defaults).forEach((i) => {
    //   i in ob ? (this.user_config[i] = ob[i]) : (this.user_config[i] = this.defaults[i]);
    // });
    this.user_config = {
      ...this.defaults,
      ...ob
    };
  }

  start() {
    // TIME SET
    if (this.user_config.timeCount !== undefined && this.user_config.timeCount) {
      this.results.time.startTime = this.getTimeStamp();
    }
    // MOUSE MOVEMENTS
    if (this.user_config.mouseMovement) {
      this.mem.eventListeners.mousemove = window.addEventListener(
        'mousemove',
        this.mem.eventsFunctions.mouseMovement
      );
      this.mem.mouseInterval = setInterval(() => {
        if (this.mem.mousePosition && this.mem.mousePosition.length) {
          if (
            !this.results.mouseMovements.length ||
            (this.mem.mousePosition[0] !==
              this.results.mouseMovements[this.results.mouseMovements.length - 1][0] &&
              this.mem.mousePosition[1] !==
                this.results.mouseMovements[this.results.mouseMovements.length - 1][1])
          ) {
            this.results.mouseMovements.push(this.mem.mousePosition);
          }
        }
      }, this.defaults.mouseMovementInterval * 1000);
    }
    // CLICKS
    if (this.user_config.clicks) {
      this.mem.eventListeners.click = window.addEventListener(
        'click',
        this.mem.eventsFunctions.click
      );
    }
    // 添加pushState replaceState event
    if (this.user_config.mousePageChange) {
      window.history['pushState'] = bindHistoryEvent('pushState');
      window.history['replaceState'] = bindHistoryEvent('replaceState');

      // 添加监听事件
      window.addEventListener('pushState', this.mem.eventsFunctions.pushState);
      window.addEventListener('replaceState', this.mem.eventsFunctions.replaceState);

      window.addEventListener('hashchange', this.mem.eventsFunctions.hashchange);
    }
    // keyLogger
    if (this.user_config.keyLogger) {
      document.addEventListener('paste', this.mem.eventsFunctions.paste);
      document.addEventListener('keyup', this.mem.eventsFunctions.keyup);
    }
    // contextChange
    if (this.user_config.contextChange) {
      document.addEventListener('visibilitychange', this.mem.eventsFunctions.visibilitychange);
    }
    // SCROLL
    if (this.user_config.mouseScroll) {
      this.mem.eventListeners.scroll = window.addEventListener(
        'scroll',
        this.mem.eventsFunctions.scroll
      );
    }
    // PROCESS INTERVAL
    if (this.user_config.processTime !== false) {
      this.mem.processInterval = setInterval(() => {
        if(this.user_config.processData) {
          this.user_config.processData(this.result());
        }
      }, this.user_config.processTime * 1000);
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
    if (this.user_config.processTime !== false) {
      clearInterval(this.mem.processInterval);
    }
    clearInterval(this.mem.mouseInterval);

    // batch remove listener
    const listenerKeys = Object.keys(this.mem.eventsFunctions);
    listenerKeys.forEach((keyName) => {
      window.removeEventListener(keyName, this.mem.eventsFunctions[keyName]);
    });
  }

  result() {
    if (
      this.user_config.userInfo === false &&
      this.results.userInfo !== undefined
    ) {
      delete this.results.userInfo;
    }
    if (this.user_config.timeCount !== undefined && this.user_config.timeCount) {
      this.results.time.currentTime = this.getTimeStamp();
    }
    return this.results;
  }

  showConfig() {
    if (Object.keys(this.user_config).length !== Object.keys(this.defaults).length) {
      return this.defaults;
    } else {
      return this.user_config;
    }
  }
}

export default UserBehaviour;
