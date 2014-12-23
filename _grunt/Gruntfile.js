/*jslint node: true */
"use strict";

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
      source: 'src', // <%= folders.source %>
      build: 'dist', // <%= folders.build %>
      centurion: '_grunt/node_modules/centurion-framework/lib/sass/', // Centurion Framework - <%= folders.centurion %>
      'stg-server-path': '/var/www/site', // <%= folders.stg-server-path %>
      'prod-server-path': '/var/www/site', // <%= folders.prod-server-path %>
    },
    
    // Task configuration.
    connect: {
      local: {
        options: {
          livereload: false,
          hostname: 'localhost',
          port: 9001,
          base: '<%= folders.build %>'
        }
      }
    },
    
    open: {
      server: {
        url: 'http://localhost:9001'
      }
    },
    
    'sass': {
      expanded: {
        options: {
          style: 'expanded',
          sourcemap: 'none',
          loadPath: '<%= folders.centurion %>',
          banner: '<%= banner %>',
        },
        files: [{
          expand: true,
          cwd: '<%= folders.source %>/sass',
          src: ['*.scss'],
          dest: '<%= folders.build %>/css',
          ext: '.css'
        }]
      },
      minify: {
        options: {
          style: 'compressed',
          sourcemap: 'none',
          loadPath: '<%= folders.centurion %>',
          banner: '<%= banner %>',
        },
        files: [{
          expand: true,
          cwd: '<%= folders.source %>/sass',
          src: ['*.scss'],
          dest: '<%= folders.build %>/css',
          ext: '.min.css'
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
    
    imagemin: {
      recursive: {
        files: [{
          expand: true,
          cwd: '<%= jshint.gruntfile.src %>/',
          src: ['**/*.{png,jpg,gif,ico}'],
          dest: '<%= jshint.gruntfile.build %>/'
        }]
      }
    },
        
    processhtml: {
      dist: {
        options: {
          process: true,
          data: {
            site_title: 'Grunt Project Setup',
            page_title: 'Page Title',
            meta_description: '_______',
            meta_keywords: '_______',
            message: 'insert a message here'
          },
          customBlockTypes: ['<%= folders.source %>/js/change-text.js'],
          recursive: true
        },
        files: [{
          expand: true,     
          cwd: '<%= folders.source %>/',   
          src: ['*.html'],
          dest: '<%= folders.build %>/',  
          ext: '.html'
        }]
      },
    },
    
    watch: {
      options: {
        cliArgs: ['--gruntfile', require('path').join(cwd, 'Gruntfile.js')],
        livereload: true,
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile'],
      },
      html: {
        files: ['<%= folders.source %>/**/*.html'],
        tasks: ['html'],
      },
      javascript: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'concat', 'uglify'],
      },
      sass: {
        files: ['<%= folders.source %>/sass/*.scss'],
        tasks: ['sass:expanded'],
      },
      images: {
      	files: ['<%= jshint.gruntfile.src %>/**/*.{png,jpg,gif,ico}'],
      	tasks: ['imagemin']
      },
    },
    
    'gh-pages': {
      options: {
        base: '<%= jshint.gruntfile.build %>'
      },
      src: '**/*'
    },
    
    rsync: {
      options: {
        args: ["--verbose"],
        exclude: [".git*","*.scss","node_modules"],
        recursive: true
      },
      staging: {
        options: {
          src: "<%= jshint.gruntfile.build %>/",
          dest: "<%= folders.prod-server-path %>",
          host: "user@staging-host",
          //delete: true // Careful this option could cause data loss, read the docs!
        }
      },
      production: {
        options: {
          src: "<%= jshint.gruntfile.build %>/",
          dest: "<%= folders.prod-server-path %>",
          host: "user@live-host",
          //delete: true // Careful this option could cause data loss, read the docs!
        }
      }
    },
    
  });

  require('load-grunt-tasks')(grunt);
  grunt.file.setBase('../');
  
  // Default Task
  grunt.registerTask('default', ['html', 'build', 'serve', 'open', 'watch']);
  
  // Build code
  grunt.registerTask('build', ['imagemin', 'sass', 'jshint', 'concat', 'uglify']);
  
  // Generate HTML
  grunt.registerTask('html', ['processhtml:dist']);
  
  // Create local server (displays "build" folder)
  grunt.registerTask('serve', ['connect']);
  
  // Deploy to Server
  grunt.registerTask('stg-deploy', ['rsync:staging']);
  grunt.registerTask('prod-deploy', ['rsync:production']);
  
  // Github Pages
  grunt.registerTask('gh-pages', ['gh-pages']);

};
