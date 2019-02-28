'use strict'
var FreePackWidgetEnv = 'prod'
if (FreePackWidgetEnv === 'dev') {
  define(
    ['https://localhost:8080/free-pack/src/index.js?v=' + Math.random()],
    function (widget) {
      return widget
    })
} else {
  define(['./src/index.js'], function (widget) {
    return widget
  })
}
