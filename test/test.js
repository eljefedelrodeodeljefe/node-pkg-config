var test = require('tape')
var tapSpec = require('tap-spec')

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout)

test((t) => {
  t.plan(2)
  var pkg = require('../index')
  t.ok(pkg.libs('./test/fixtures/opencv.pc'))
  t.ok(pkg.cflags('./test/fixtures/opencv.pc'))
})
