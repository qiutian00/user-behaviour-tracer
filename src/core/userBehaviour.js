import { bindHistoryEvent } from '../utils/event.ts'

class userBehaviour {
    constructor(defaults) {
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
                click: (e) => {
                    this.results.clicks.clickCount++;
                    let path = [];
                    let node = "";
                    e.composedPath().forEach((el, i) => {
                        if ((i !== e.composedPath().length - 1) && (i !== e.composedPath().length - 2)) {
                            node = el.localName;
                            (el.className !== "") ? el.classList.forEach((clE) => {
                                node += "." + clE
                            }): 0;
                            (el.id !== "") ? node += "#" + el.id: 0;
                            path.push(node);
                        }
                    })
                    path = path.reverse().join(">");
                    this.results.clicks.clickDetails.push([
                        {
                            x: e.clientX, 
                            y: e.clientY, 
                            path: path, 
                            node: event.target.outerHTML,
                            time: this.getTimeStamp()
                        }
                    ]);
                },
                mouseMovement: (e) => {
                    this.mem.mousePosition = [{
                        x: e.clientX, 
                        y:e.clientY, 
                        time: this.getTimeStamp()
                    }];
                },
                pushState: (e) => {
                    const path = e && e.arguments.length > 2 && e.arguments[2];
                    const url = /^http/.test(path) ? path : (location.protocol + '//' + location.host + path);
                    console.log('pushState old:'+location.href,'new:'+url);

                    this.results.mousePageChanges.push([{
                        type: 'pushState',
                        oldURL: location.href,
                        newURL: url,
                        time: this.getTimeStamp()
                    }]);
                },
                replaceState: (e) => {
                    const path = e && e.arguments.length > 2 && e.arguments[2];
                    const url = /^http/.test(path) ? path : (location.protocol + '//' + location.host + path);
                    console.log('replaceState old:'+location.href,'new:'+url);

                    this.results.mousePageChanges.push([{
                        type: 'replaceState',
                        oldURL: location.href,
                        newURL: url,
                        time: this.getTimeStamp()
                    }]);
                },
                hashchange: (e) => {
                    this.results.mousePageChanges.push([{
                        type: 'hashchange',
                        oldURL: e.oldURL,
                        newURL: e.newURL,
                        time: this.getTimeStamp()
                    }]);
                }
            }
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
                userAgent: navigator.userAgent || ''
            },
            time: {
                startTime: 0,
                currentTime: 0,
            },
            clicks: {
                clickCount: 0,
                clickDetails: []
            },
            mouseMovements: [],
            mouseScroll: [],
            mousePageChanges: [],
            keyLogger: []
        }
    };

    

    getTimeStamp() {
        return new Date().toLocaleString();
    };

    config(ob) {
        this.user_config = {};
        Object.keys(this.defaults).forEach((i) => {
            i in ob ? this.user_config[i] = ob[i] : this.user_config[i] = this.defaults[i];
        })
    };

    start() {

        if (Object.keys(this.user_config).length !== Object.keys(this.defaults).length) {
            console.log("no config provided. using default..");
            this.user_config = this.defaults;
        }
        // TIME SET
        if (this.user_config.timeCount !== undefined && this.user_config.timeCount) {
            this.results.time.startTime = this.getTimeStamp();
        }
        // MOUSE MOVEMENTS
        if (this.user_config.mouseMovement) {
            this.mem.eventListeners.mouseMovement = window.addEventListener("mousemove", this.mem.eventsFunctions.mouseMovement);
            this.mem.mouseInterval = setInterval(() => {
                if (this.mem.mousePosition && this.mem.mousePosition.length) { //if data has been captured
                    if (!this.results.mouseMovements.length || ((this.mem.mousePosition[0] !==  this.results.mouseMovements[this.results.mouseMovements.length - 1][0]) && (this.mem.mousePosition[1] !== this.results.mouseMovements[this.results.mouseMovements.length - 1][1]))) {
                        this.results.mouseMovements.push(this.mem.mousePosition)
                    }
                }
            }, this.defaults.mouseMovementInterval * 1000);
        }
        //CLICKS
        if (this.user_config.clicks) {
            this.mem.eventListeners.click = window.addEventListener("click", this.mem.eventsFunctions.click);
        }
        //添加pushState replaceState event
        if(this.user_config.mousePageChange) {
            window.history['pushState'] = bindHistoryEvent('pushState')
            window.history['replaceState'] = bindHistoryEvent('replaceState')

            // 添加监听事件
            window.addEventListener('pushState', this.mem.eventsFunctions.pushState);
            window.addEventListener('replaceState', this.mem.eventsFunctions.replaceState);

            window.addEventListener("hashchange", this.mem.eventsFunctions.hashchange);
        }
        // keyLogger
        if(this.user_config.keyLogger) {
            document.addEventListener('paste', function(){
                let pastedText = undefined;
                // Get Pasted Text
                if (window.clipboardData && window.clipboardData.getData) {
                    pastedText = window.clipboardData.getData('Text');
                } else if (event.clipboardData && event.clipboardData.getData) {
                    pastedText = event.clipboardData.getData('text/plain');
                }

                if(!!pastedText){
                    this.results.keyLogger.push({
                        time: this.getTimeStamp(),
                        data: pastedText,
                        type: 'paste'
                    });
                }
            });
            document.addEventListener('keyup', function(){
                let charCode    = event.keyCode || event.which,
                    charString  = String.fromCharCode(charCode);

                this.results.keyLogger.push({
                    time: this.getTimeStamp(),
                    data: charString,
                    type: 'keypress'
                });
            });
        }

        
        //SCROLL
        if (this.user_config.mouseScroll) {
            this.mem.eventListeners.scroll = window.addEventListener("scroll", this.mem.eventsFunctions.scroll);
        }
        //PROCESS INTERVAL
        if (this.user_config.processTime !== false) {
            this.mem.processInterval = setInterval(() => {
                this.user_config.processData(this.result());
            }, this.user_config.processTime * 1000)
        }
    };

    processResults() {
        this.user_config.processData(this.result());
        if (this.user_config.clearAfterProcess) {
            this.resetResults();
        }
    }

    stop() {
        if (user_config.processTime !== false) {
            clearInterval(this.mem.processInterval);
        }
        clearInterval(this.mem.mouseInterval);
        window.removeEventListener("scroll", this.mem.eventsFunctions.scroll);
        window.removeEventListener("click", this.mem.eventsFunctions.click);
        window.removeEventListener("mousemove", this.mem.eventsFunctions.mouseMovement);
    }

    result() {
        if (this.user_config.userInfo === false && this.userBehaviour.showResult().userInfo !== undefined) {
            delete userBehaviour.showResult().userInfo;
        }
        if (this.user_config.timeCount !== undefined && this.user_config.timeCount) {
            this.results.time.currentTime = this.getTimeStamp();
        }
        return this.results
    };

    showConfig() {
        if (Object.keys(this.user_config).length !== Object.keys(this.defaults).length) {
            return this.defaults;
        } else {
            return this.user_config;
        }
    };

};

const defaults = {
    userInfo: true,
    clicks: true,
    mouseMovement: true,
    mouseMovementInterval: 1,
    mouseScroll: true,
    mousePageChange: true,
    keyLogger: false,
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

export default globalInstance
