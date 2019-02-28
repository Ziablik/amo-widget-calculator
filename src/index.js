define(['jquery'], function ($) {

  /**
   * @returns {Widget}
   * @constructor
   */
  var Widget = function () {
    var self = this
    var wcode, settings, users, wurl, enabled;

    /**
     * Функция для загрузки шаблонов по из папки templates
     * @param template
     * @param params
     * @param callback
     * @returns {*|boolean}
     */
    self.getTemplate = function (template, params, callback) {
      params = (typeof params === 'object') ? params : {}
      template = template || ''

      return self.render({
        href:  '/templates/' + template + '.twig',
        base_path: wurl, //тут обращение к объекту виджет вернет /widgets/#WIDGET_NAME#
        load: callback, //вызов функции обратного вызова
      }, params) //параметры для шаблона
    }

    /**
     * @type {{render: (function(): boolean), init: (function(): boolean), bind_actions: (function(): boolean), settings: (function(): boolean), onSave: (function(): boolean), destroy: PandoraLoaderWidget.callbacks.destroy}}
     */
    this.callbacks = {
      render: function () {
        wcode = settings.widget_code

        // Подгружаем стили
        if (FreePackWidgetEnv === 'dev') {
          wurl = 'https://localhost:8080/free-pack'
        } else {
          wurl = '/upl/' + wcode + '/widget'
        }

        return true
      },
      init: function () {
        return true
      },
      bind_actions: function () {
        return true
      },
      settings: function () {
        return true
      },
      onSave: function () {
        return true
      },
      destroy: function () {
        return true
      }
    }
    return this
  }

  return Widget
})
