import { bindHistoryEvent } from '../utils/event.ts'

const userBehaviour = (function () {
    const defaults = {
        userInfo: true,
        clicks: true,
        mouseMovement: true,
        mouseMovementInterval: 1,
        mouseScroll: true,
        mousePageChange: true,
        timeCount: true,
        clearAfterProcess: true,
        processTime: 15,
        processData: function (results) {
            console.log(results);
        }
    };

    const user_config = {};

    const mem = {
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
                results.mouseScroll.push([window.scrollX, window.scrollY, getTimeStamp()]);
            },
            click: (e) => {
                results.clicks.clickCount++;
                const path = [];
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
                results.clicks.clickDetails.push([e.clientX, e.clientY, path, getTimeStamp()]);
            },
            mouseMovement: (e) => {
                mem.mousePosition = [e.clientX, e.clientY, getTimeStamp()];
            },
            pushState: (e) => {
                const path = e && e.arguments.length > 2 && e.arguments[2];
                const url = /^http/.test(path) ? path : (location.protocol + '//' + location.host + path);
                console.log('pushState old:'+location.href,'new:'+url);

                results.mousePageChanges.push([{
                    type: 'pushState',
                    oldUrl: location.href,
                    newUrl: url
                }]);
            },
            replaceState: (e) => {
                const path = e && e.arguments.length > 2 && e.arguments[2];
                const url = /^http/.test(path) ? path : (location.protocol + '//' + location.host + path);
                console.log('replaceState old:'+location.href,'new:'+url);

                results.mousePageChanges.push([{
                    type: 'replaceState',
                    oldUrl: location.href,
                    newUrl: url
                }]);
            }
        }
    };

    let results = {};

    function resetResults() {
        results = {
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
            //keyLogger: [], //todo

        }
    };

    resetResults();

    function getTimeStamp() {
        return Date.now();
    };

    function config(ob) {
        user_config = {};
        Object.keys(defaults).forEach((i) => {
            i in ob ? user_config[i] = ob[i] : user_config[i] = defaults[i];
        })
    };

    function start() {

        if (Object.keys(user_config).length !== Object.keys(defaults).length) {
            console.log("no config provided. using default..");
            user_config = defaults;
        }
        // TIME SET
        if (user_config.timeCount !== undefined && user_config.timeCount) {
            results.time.startTime = getTimeStamp();
        }
        // MOUSE MOVEMENTS
        if (user_config.mouseMovement) {
            mem.eventListeners.mouseMovement = window.addEventListener("mousemove", mem.eventsFunctions.mouseMovement);
            mem.mouseInterval = setInterval(() => {
                if (mem.mousePosition && mem.mousePosition.length) { //if data has been captured
                    if (!results.mouseMovements.length || ((mem.mousePosition[0] !== results.mouseMovements[results.mouseMovements.length - 1][0]) && (mem.mousePosition[1] !== results.mouseMovements[results.mouseMovements.length - 1][1]))) {
                        results.mouseMovements.push(mem.mousePosition)
                    }
                }
            }, defaults.mouseMovementInterval * 1000);
        }
        //CLICKS
        if (user_config.clicks) {
            mem.eventListeners.click = window.addEventListener("click", mem.eventsFunctions.click);
        }
        //添加pushState replaceState event
        if(user_config.mousePageChange) {
            window.history['pushState'] = bindHistoryEvent('pushState')
            window.history['replaceState'] = bindHistoryEvent('replaceState')
        }

        // 添加监听事件
        window.addEventListener('pushState', mem.eventsFunctions.pushState);
        window.addEventListener('replaceState', men.eventsFunctions.replaceState);
        //SCROLL
        if (user_config.mouseScroll) {
            mem.eventListeners.scroll = window.addEventListener("scroll", mem.eventsFunctions.scroll);
        }
        //PROCESS INTERVAL
        if (user_config.processTime !== false) {
            mem.processInterval = setInterval(() => {
                user_config.processData(result());
            }, user_config.processTime * 1000)
        }
    };

    function processResults() {
        user_config.processData(result());
        if (user_config.clearAfterProcess) {
            resetResults();
        }
    }

    function stop() {
        if (user_config.processTime !== false) {
            clearInterval(mem.processInterval);
        }
        clearInterval(mem.mouseInterval);
        window.removeEventListener("scroll", mem.eventsFunctions.scroll);
        window.removeEventListener("click", mem.eventsFunctions.click);
        window.removeEventListener("mousemove", mem.eventsFunctions.mouseMovement);
    }

    function result() {
        if (user_config.userInfo === false && userBehaviour.showResult().userInfo !== undefined) {
            delete userBehaviour.showResult().userInfo;
        }
        if (user_config.timeCount !== undefined && user_config.timeCount) {
            results.time.currentTime = getTimeStamp();
        }
        return results
    };

    function showConfig() {
        if (Object.keys(user_config).length !== Object.keys(defaults).length) {
            return defaults;
        } else {
            return user_config;
        }
    };
    
    return {
        showConfig: showConfig,
        config: config,
        start: start,
        stop: stop,
        showResult: result,
        processResults: processResults,
    };

})();

export default userBehaviour
