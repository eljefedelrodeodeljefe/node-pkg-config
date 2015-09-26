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
* Not much magic. It just `./configure`s, `make`
*
*/
var filename = 'deps/pkg-config-0.28.tar.gz'
var pathTo = 'node_modules/pkg_config/pkg-config-0.28'
// extracting the directory
fs.createReadStream(filename).pipe(gunzip()).pipe(tar.extract('./node_modules/pkg_config')).on('finish', () => {
  console.log('\nDone extracting pkg-config\n');
  ee.emit('done:extract')
})

ee.on('done:extract', function () {
  var configureOpts = [
    '--prefix=' + path.join(__dirname, 'node_modules/pkg_config/build'),
    '--disable-debug',
    '--disable-host-tool',
    '--with-internal-glib'
  ]

  var configure = spawn('./configure', configureOpts, {cwd: pathTo, stdio: 'inherit'})


  configure.on('close', function (code) {
    console.log('\nDone running `configure`\n');
    ee.emit('done:configure')
  })
})

ee.on('done:configure', function () {
  var makeOpts = ['-j' + os.cpus().length] // run make in parrallel with max. cpus
  var make = spawn('make', makeOpts, {cwd: pathTo, stdio: 'inherit'})

  make.on('close', function (code) {
    console.log('\nDone running `make`\n');
    ee.emit('done:make')
  })
})

ee.on('done:make', function () {
  var makeInstall = spawn('make', ['install'], {cwd: pathTo, stdio: 'inherit'}) // install to build dir
})
