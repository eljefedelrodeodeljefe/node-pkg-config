var test = require('tape')
var tapSpec = require('tap-spec')

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout)

test((t) => {
  t.plan(2)
  var pkg = require('../index')
  t.ok(pkg.config())
  t.ok(pkg.pkgConfig())
})
