module.exports = (grunt) ->

  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-connect'

  grunt.initConfig
    browserify:
      options:
        transform: ['coffeeify']
        browserifyOptions:
          extensions: ['.coffee', '.json']
          debug: true
      compile:
        files:
          'libs.js': ['src/libs.coffee']
          'main.js': ['src/main.coffee']

          # workers
          'conv.js': ['src/workers/conv.coffee']
          'calc.js': ['src/workers/calc.coffee']

    less:
      compile:
        files:
          'styles.css': ['src/**/*.less']

    jade:
      compile:
        files:
          'index.html': ['src/**/*.jade']

    watch:
      options:
        livereload: true
      configFiles:
        options:
          reload: true
        files: ['Gruntfile.coffee']
        tasks: ['build']
      coffee:
        files: ['src/**/*.coffee', 'src/**/*.json']
        tasks: ['browserify:compile']
      less:
        files: ['src/**/*.less']
        tasks: ['less:compile']
      jade:
        files: ['src/**/*.jade']
        tasks: ['jade:compile']

    connect:
      server:
        options:
          port: 9000
          livereload: true

  grunt.registerTask 'build',   ['browserify:compile', 'less:compile', 'jade:compile']
  grunt.registerTask 'default', ['build', 'connect', 'watch']
