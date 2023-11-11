// BEGIN: ed8c6549bwf9
import { bindHistoryEvent } from '../utils/event';

class UserBehaviour {
  defaults: any;
  mem: any;
  results: any;

  constructor(defaults: any) {
    this.defaults = defaults;

    this.config(this.defaults);

    this.mem = {
      processInterval: null,
      mouseInterval: null,
      mousePosition: [], //x,y,timestamp
      eventListeners: {
        scroll: null,
        click: null,
        mouseMovement: null,
      },
      eventsFunctions: {
        scroll: () => {
          this.results.mouseScroll.push([window.scrollX, window.scrollY, this.getTimeStamp()]);
        },
        click: (e: any) => {
          this.results.clicks.clickCount++;
          const path: any[] = [];
          let node = "";
          e.composedPath().forEach((el: any, i: number) => {
            if ((i !== e.composedPath().length - 1) && (i !== e.composedPath().length - 2)) {
              node = el.localName;
              (el.className !== "") ? el.classList.forEach((clE: any) => {
                node += "." + clE
              }): 0;
              (el.id !== "") ? node += "#" + el.id: 0;
              path.push(node);
            }
          })
          this.results.clicks.clickDetails.push([
            {
              x: e.clientX,
              y: e.clientY,
              path: path.reverse().join(">"),
              node: e.target.outerHTML,
              time: this.getTimeStamp()
            }
          ]);
        },
        mouseMovement: (e: any) => {
          this.mem.mousePosition = [{
            x: e.clientX,
            y: e.clientY,
            time: this.getTimeStamp()
          }];
        },
        pushState: (e: any) => {
          const path = e && e.arguments.length > 2 && e.arguments[2];
          const url = /^http/.test(path) ? path : (location.protocol + '//' + location.host + path);
          console.log('pushState old:' + location.href, 'new:' + url);

          this.results.mousePageChanges.push([{
            type: 'pushState',
            oldURL: location.href,
            newURL: url,
            time: this.getTimeStamp()
          }]);
        },
        replaceState: (e: any) => {
          const path = e && e.arguments.length > 2 && e.arguments[2];
          const url = /^http/.test(path) ? path : (location.protocol + '//' + location.host + path);
          console.log('replaceState old:' + location.href, 'new:' + url);

          this.results.mousePageChanges.push([{
            type: 'replaceState',
            oldURL: location.href,
            newURL: url,
            time: this.getTimeStamp()
          }]);
        },
        hashchange: (e: any) => {
          this.results.mousePageChanges.push([{
            type: 'hashchange',
            oldURL: e.oldURL,
            newURL: e.newURL,
            time: this.getTimeStamp()
          }]);
        },
        paste: (e: any) => {
          let pastedText = undefined;
          // Get Pasted Text
          if (window.clipboardData && window.clipboardData.getData) {
            pastedText = window.clipboardData.getData('Text');
          } else if (event.clipboardData && event.clipboardData.getData) {
            pastedText = event.clipboardData.getData('text/plain');
          }

          if (!!pastedText) {
            this.results.keyLogger.push({
              time: this.getTimeStamp(),
              data: pastedText,
              type: 'paste'
            });
          }
        },
      }
    }
  }

  config(options: any) {
    this.results = {
      mouseScroll: [],
      clicks: {
        clickCount: 0,
        clickDetails: []
      },
      mousePageChanges: [],
      keyLogger: []
    }

    this.mem.processInterval = setInterval(() => {
      this.processData();
    }, options.processInterval || 1000);

    this.mem.mouseInterval = setInterval(() => {
      this.mem.eventsFunctions.mouseMovement();
    }, options.mouseInterval || 100);

    this.mem.eventListeners.scroll = window.addEventListener('scroll', this.mem.eventsFunctions.scroll);
    this.mem.eventListeners.click = window.addEventListener('click', this.mem.eventsFunctions.click);
    this.mem.eventListeners.pushState = bindHistoryEvent('pushState', this.mem.eventsFunctions.pushState);
    this.mem.eventListeners.replaceState = bindHistoryEvent('replaceState', this.mem.eventsFunctions.replaceState);
    this.mem.eventListeners.hashchange = window.addEventListener('hashchange', this.mem.eventsFunctions.hashchange);
    this.mem.eventListeners.paste = window.addEventListener('paste', this.mem.eventsFunctions.paste);
  }

  processData() {
    console.log(this.results);
  }

  getTimeStamp() {
    return new Date().getTime();
  }
}

export default UserBehaviour;
// END: ed8c6549bwf9