'use strict';
var FreePackWidgetEnv = 'dev';
if (FreePackWidgetEnv === 'dev') {
  define(
    ['https://localhost:8080/amo-widget-calculator/src/index.js?v=' + Math.random()],
    function (widget) {
      return widget
    })
} else {
  define(['./src/index.js'], function (widget) {
    return widget
  })
}

