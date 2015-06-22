var gulp= require('gulp')
var dts = require('dts-generator');

gulp.task('default', function(){
  dts  .generate({
    name: 'uservices-socket.io-server',
    baseDir: '.',
    files: [ './lib/index.ts' ],
    excludes: ['./typings/socket.io/socket.io.d.ts', './typings/es6/es6.d.ts', './typings/node/node.d.ts', ],
    externs: ['./typings/socket.io/socket.io.d.ts', './node_modules/rx/ts/rx.d.ts' ],
    out: './uservices-socket.io-server.d.ts'
  });
})
