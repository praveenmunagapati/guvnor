var Autowire = require('wantsit').Autowire

var UserProcess = function() {
  this._posix = Autowire
}

UserProcess.prototype.afterPropertiesSet = function() {
  if(!this._dropPrivileges()) {
    return
  }

  this._run(function() {
    process.send({type: 'remote:ready'})
  }, function(error) {
    if(error) {
      process.send({
        type: 'remote:error',
        args: [error]
      })
    } else {
      process.send({
        type: 'remote:success',
        args: Array.prototype.slice.call(arguments, 1)
      })
    }
  })
}

UserProcess.prototype._dropPrivileges = function() {
  try {
    var user
    var num = parseInt(process.env.BOSS_USER)

    if(isNaN(num)) {
      user = this._posix.getpwnam(process.env.BOSS_USER)
    } else {
      user = this._posix.getpwnam(num)
    }

    if(user.gid != process.getgid()) {
      process.setgid(user.gid)
      process.setgroups([]) // Remove old groups
      process.initgroups(user.uid, user.gid) // Add user groups
    }

    if(user.uid != process.getuid()) {
      process.setuid(user.uid) // Switch to requested user
    }
  } catch(error) {
    this._sendError(error)

    return false
  }

  return true
}

UserProcess.prototype._sendError = function(error) {
  process.send({
    type: 'remote:error',
    message: error.message,
    stack: error.stack
  })
}

UserProcess.prototype._run = function() {
  // subclasses should implement this method
}

module.exports = UserProcess