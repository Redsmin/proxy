module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-bump");
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

    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: [],
        commit: false,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json'], // '-a' for all files
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'upstream'
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

  // Default task.
  grunt.registerTask('default', 'lint test');
};
