module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    pkg: '<json:package.json>',

    lint: {
      all: ['*.js', 'lib/**/*.js', 'test/**/*.js']
    },

    jshint: {
      options: {
        curly: true,
        es5: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        laxcomma: true,
        newcap: false,
        noarg: true,
        sub: true,
        undef: true,
        eqnull: true,
        browser: false
      },
      globals: {
        module: true,
        require:true,
        exports:true,
        console:true,
        __dirname:true,
        process:true
      }
    },

    watch: {
      files: ['<config:lint.all>'],
      tasks: 'lint test'
    },

    test: {
      all: ['test/**/*.js']
    }
  });

  // http://blog.fgribreau.com/2012/06/how-to-get-growl-notifications-from.html
  var growl = require('growl');
  ['warn', 'fatal'].forEach(function(level) {
    grunt.utils.hooker.hook(grunt.fail, level, function(opt) {
      growl(opt.name, {
        title: opt.message,
        image: 'Console'
      });
    });
  });

  // Default task.
  grunt.registerTask('default', 'lint test');
};
