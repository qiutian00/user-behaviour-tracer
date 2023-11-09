<h3 align="center">User Behaviour Tracking</h3>
<h4 align="center">2.7 KB</h4>


---

<p align="center">Configurable and Lightweight JS Library for user behaviour tracking from the browser, using mouse movements, clicks, scroll, and time on page.
    <br> 
</p>

## 📝 Table of Contents
- [📝 Table of Contents](#-table-of-contents)
- [🧐 About ](#-about-)
- [🏁 Installation ](#-installation-)
- [🔧 Configuration ](#-configuration-)
- [📚 Methods ](#-methods-)
- [🚀 Tracking ](#-tracking-)
- [🎈 Results  ](#-results--)
  - [Example of Result](#example-of-result)
- [🎉 Acknowledgements](#-acknowledgements)

## 🧐 About <a name = "about"></a>
This Javascript Library allows to track user's behaviour by recording mouse activities:
- Movements
- Clicks
  - Exact element in CSS format
  - Timestamp
- Scroll
- Time on page


## 🏁 Installation <a name = "install"></a>
There are two ways to include user-behaviour.js  to your browser:

1. jsDelivr CDN

```html
<script src="https://cdn.jsdelivr.net/npm/user-behaviour-tracer/dist/index.min.js"></script>
```
2. Local file
```html
<script src="/path/to/user-behaviour-tracer.js"></script>
```

## 🔧 Configuration <a name = "config"></a>
The library requires a configuration object. Pass the object to the library with:

```javascript
userBehaviour.config({.....});
```
If no configuration was passes the libray will use the default configuration:
```javascript
{
    userInfo: true,
    clicks: true,
    mouseMovement: true,
    mouseMovementInterval: 1,
    mouseScroll: true,
    timeCount: true,
    clearAfterProcess: true,
    processTime: 15,
    processData: function(results){
        console.log(results);
    },
}
```
| Config Key            | Description                                                                                        | Type               | Default |
| --------------------- | -------------------------------------------------------------------------------------------------- | ------------------ | ------- |
| userInfo              | record browser/device details                                                                      | bool               | true    |
| clicks                | track mouse clicks                                                                                 | bool               | true    |
| mouseMovement         | track mouse movement                                                                               | bool               | true    |
| mouseMovementInterval | time between tracking mouse movements                                                              | int (seconds)      | 1       |
| mouseScroll           | track mouse scroll                                                                                 | bool               | true    |
| timeCount             | track time                                                                                         | bool               | true    |
| clearAfterProcess     | clear results object after processing the data                                                     | bool               | true    |
| processTime           | time between processing the data automatically <br>(false will enable manual only data processing) | int/bool (seconds) | 15      |
| processData           | function that processes the results object                                                         | function           | ...     |

## 📚 Methods <a name="methods"></a>

This is  a list of all available methods that can be called:

| Method         | Description                              | Example                             |
| -------------- | ---------------------------------------- | ----------------------------------- |
| showConfig     | returns current config                   | userBehaviour.showConfig()          |
| config         | sets the configuration                   | userBehaviour.config(config_object) |
| start          | starts tracking                          | userBehaviour.start()               |
| stop           | stops tracking                           | userBehaviour.stop()                |
| showResult     | returns current result                   | userBehaviour.showResult()          |
| processResults | calls the process function set in config | userBehaviour.processResults()      |

## 🚀 Tracking <a name = "tracking"></a>

Start tracking with: 
```javascript
userBehaviour.start();
```

Stop tracking with: 
```javascript
userBehaviour.stop();
```

## 🎈 Results  <a name="results"></a>
To view the results at anytime after the tracking has started:
```javascript
userBehaviour.showResult();
```

The result will be passed to a function set regularly with an interval set in the [configuration](#config) section.

The data could also be sent via a POST request using any HTTP request libraries e.g axios, ajax, ...
```javascript
processData: function(results){
        axios.post('https://example.com', results);
}
```

If processTime was set to false, data will not be processed automatically. Therefore, you might require to process the data manually with:
```javascript
userBehaviour.processResults();
```
This method will still require processData to be set in the configuration.

### Example of Result
```javascript
{
  "userInfo": {
    "appCodeName": "Mozilla",
    "appName": "Netscape",
    "vendor": "Google Inc.",
    "platform": "MacIntel",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36"
  },
  "time": {
    "startTime": 1572725042761,
    "currentTime": 1572725069204
  },
  "clicks": {
    "clickCount": 3,
    "clickDetails": [
      [
        554,
        542,
        "html>body>div#login>div.ui.container.animated.fadeInDown>div.ui.center.aligned.colored.trends.segment>form.ui.form>div.fields>div.ten.wide.field>input",
        1572725045313
      ]
    ]
  },
  "mouseMovements": [
    [
      1031,
      328,
      1572725043646
    ]
  ],
  "mouseScroll": []
}
```

## 🎉 Acknowledgements 
- https://github.com/TA3/web-user-behaviour for inispiration.
