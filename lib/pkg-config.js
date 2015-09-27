var fs = require('fs')

// function baseDir() {
//   switch (os.type()) {
//     case 'Darwin' || 'Linux':
//       return '/usr/local/lib/pkgconfig'
//       break
//     case 'Windows_NT':
//       return '/usr/local/lib/pkgconfig'
//       break
//     default:
//       return new Error('pkg-config coulnd\'t determine your OS type')
//   }
// }

function _parse (file, cb) {
  var vars = {}
  var config = {}
  vars._allVars = ''
  config._allFlag = ''

  fs.readFileSync(file).toString().split('\n').forEach(function (line) {
    var arr = []
    var re = /^(\w+)(\=|\:)/

    var match = re.exec(line)
    if (!match) {
      return
    }

    arr = Array.prototype.slice.apply(match)
    // based on whether we are currently reading vars denoted by `=` or
    // compiler flags denoted by `:`, we branch results in to different object keys.
    // The result will still have unix variable notation and we need to resolve those
    switch (arr[2]) {
      case '=':
        vars[arr[1]] = match.input.substring(match.input.indexOf(arr[2]) + 1)
        break
      case ':':
        config[arr[1].toLowerCase()] = match.input.substring(match.input.indexOf(arr[2]) + 1).replace(/^\s*/, '')
        break
      default:
    }
  })

  // resolve unix variables in the varible section
  Object.keys(vars).forEach(function (el, index) {
    var arr = []
    // matches one (just one variable per variable expected)
    var match = vars[el].match(/^\$\{(.*?)\}/)

    if (!match) {
      return
    }
    arr = Array.prototype.slice.apply(match)
    vars[el] = vars[el].replace(/^\$\{(\w+)\}/, vars[arr[1]])
  })

  // resolve unix varbiables in the compiler flags, based on resolved vars
  // in variable section
  Object.keys(config).forEach(function (el, index) {
    var arr = []
    // match one ...and continue to match
    var match = config[el].match(/\$\{(\w+)\}/g)

    if (!match) {
      return
    }
    // arrify regex return (here w/o resulting string)
    arr = Array.prototype.slice.apply(match)
    // turn array into to target strings to get string from vars
    arr.forEach(function (elInner, index) {
      var inner = elInner.match(/\$\{(\w+)\}/)

      arr[index] = arr[index].replace(/\$\{(\w+)\}/g, inner[1])

      // accesessing variable with computed var name
      // TODO: test case other way around due to g flag, possible?
      config[el] = config[el].replace(/\$\{(\w+)\}/, vars[arr[index]])
    })
  })

  // factorize all necessary data. Thi should be consumed
  // internally only for API simplicity
  return {
    vars: vars,
    config: config
  }
}

exports.variables = function (args) {
  return _parse(args).vars
}

exports.libs = function (args) {
  return _parse(args).config.libs
}
exports.cflags = function (args) {
  return _parse(args).config.cflags
}
