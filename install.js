var tar = require('tar-fs')
var fs = require('fs')
var gunzip = require('gunzip-maybe')

var spawn = require('child_process').spawn
var os = require('os')

var EventEmitter = require('events')
var ee = new EventEmitter()
var path = require('path')

/**
* This is the install script which runs on 'npm pre-install'.
* Not much magic. It just `./configure`s, `make && make install`s inside cpython directory.
* Most of the code here presents the users output and errors into the console and pretty-prints stuff.
*
*/
var filename = 'deps/pkg-config-0.28.tar.gz'
var pathTo = 'node_modules/pkg_config/pkg-config-0.28'
// extracting the directory
fs.createReadStream(filename).pipe(gunzip()).pipe(tar.extract('./node_modules/pkg_config'))

var configureOpts = [
  '--prefix=' + path.join(__dirname, pathTo),
  '--disable-debug',
  '--disable-host-tool',
  '--with-internal-glib'
]

var configure = spawn('./configure', configureOpts, {cwd: pathTo, stdio: 'inherit'})

configure.on('close', function (code) {
  ee.emit('done:configure')
})

ee.on('done:configure', function () {
  var makeOpts = ['-j' + os.cpus().length] // run make in parrallel with max. cpus
  var make = spawn('make', makeOpts, {cwd: pathTo, stdio: 'inherit'})

  make.on('close', function (code) {
    ee.emit('done:make')
  })
})

// ee.on('done:make', function () {
//   var makeInstall = spawn('make', ['install'], {cwd: pathTo, stdio: 'inherit'}) // install to build dir
// })
