/*jslint node: true */
"use strict";

var browserSync = require("browser-sync");

module.exports = function(grunt) {
  
  var cwd = process.cwd();
  
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! ==================================================\n' +
      '* <%= pkg.title || pkg.name %> - v<%= pkg.version %> -' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n'+
      '================================================== */',
    
    folders: {
      source: './source', // <%= folders.source %>
      build: './dist', // <%= folders.build %>
      centurion: './node_modules/centurion-framework/lib/sass', // Centurion Framework - <%= folders.centurion %>
    },
    
    // Task configuration.
    
    jekyll: {
      build : {
        source: './source',
        dest: './dist'
      }
    },

    'sass': {
      options: {
        precision: 4,
        sourceMap: true,
        includePaths: [
          '<%= folders.centurion %>'
        ]
      },
      expanded: {
        options: {
          outputStyle: 'expanded'
        },
        files: [{
          expand: true,
          cwd: '<%= folders.source %>/sass',
          src: ['*.scss'],
          dest: '<%= folders.build %>/css',
          ext: '.css'
        }]
      }
    },
    
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: [
          '<%= folders.source %>/js/libs/**/*.js',
          '<%= folders.source %>/js/<%= pkg.name %>.js'
        ],
        dest: '<%= folders.build %>/js/<%= pkg.name %>.js'
      }
    },
    
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: [
          '<%= folders.source %>/js/libs/**/*.js',
          '<%= folders.source %>/js/<%= pkg.name %>.js'
        ],
        dest: '<%= folders.build %>/js/<%= pkg.name %>.min.js'
      }
    },
    
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        globals: {
          browser: true,
          document: true,
          window: true,
          location: true,
          "$": true,
          "jQuery": true
        }
      },
      gruntfile: {
        src: '_grunt/Gruntfile.js'
      },
      lib_test: {
        src: [
          '<%= folders.source %>/js/<%= pkg.name %>.js',
          '!<%= folders.source %>/js/libs/**/*.js',
        ]
      }
    },

    browserSync: {
      files: {
        src : ['./dist/**/*']
      },
      options: {
        watchTask: true,
        ghostMode: {
          clicks: true,
          scroll: true,
          links: true,
          forms: true
        },
        server: {
          baseDir: './dist'
        }
      }
    },
    
    watch: {
      javascript: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'concat', 'uglify'],
      },
      sass: {
        files: ['<%= folders.source %>/sass/*.scss'],
        tasks: ['sass'],
      },
      jekyll: {
        files: ['<%= folders.source %>/_layouts/*.html', '<%= folders.source %>/**/*.md'],
        tasks: ['jekyll']
      }
    },
        
  });
  

  require('load-grunt-tasks')(grunt);
  
  grunt.registerTask('build', ['jekyll', 'sass', 'concat', 'uglify', 'jshint']);
  
  grunt.registerTask('default', ['build', 'browserSync', 'watch']);

};
