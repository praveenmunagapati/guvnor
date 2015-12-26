var View = require('ampersand-view')
var CollectionView = require('ampersand-collection-view')
var LogListView = require('./entry')

module.exports = View.extend({
  template: require('./index.hbs'),
  initialize: function () {
    View.prototype.initialize.call(this)

    this.listenTo(this.model.logs, 'add', this.scrollLogs.bind(this))
  },
  subviews: {
    logs: {
      container: '[data-hook=logs]',
      prepareView: function (el) {
        return new CollectionView({
          el: el,
          collection: this.model.logs,
          view: LogListView
        })
      }
    }
  },
  events: {
    'click button.logs-time': 'toggleTimes',
    'click button.logs-pin': 'pinLogs',
    'click button.logs-clear': 'clearLogs'
  },
  toggleTimes: function (event) {
    this.model.shouldShowTimes = !this.model.shouldShowTimes
  },
  pinLogs: function (event) {
    this.model.areLogsPinned = !this.model.areLogsPinned
  },
  clearLogs: function (event) {
    this.model.logs.forEach(function (log) {
      log.visible = false
    })
  },
  scrollLogs: function () {
    setTimeout(function () {
      if (!this.model.areLogsPinned) {
        var list = this.query('[data-hook=logs]')

        if (!list) {
          return
        }

        list.scrollTop = list.scrollHeight
      }
    }.bind(this), 100)
  },
  bindings: {
    'model.areLogsPinned': {
      type: 'booleanClass',
      name: 'active',
      selector: '.logs-pin'
    },
    'model.shouldShowTimes': [{
      type: 'booleanClass',
      name: 'showTimes',
      selector: 'ul.logs'
    }, {
      type: 'booleanClass',
      name: 'active',
      selector: '.logs-time'
    }]
  }
})