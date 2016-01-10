module.exports = function(grunt) {

    grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),


		jshint: {
			files: ['Gruntfile.js', 'src/js/*.js'],
      options: {
        globals: {
          console: true
        }
      }
		},

		concat: {
      options: {
        separator: ';'
      },
			dist: {
				src: ['src/js/*.js'],
				dest: 'dist/js/build.js'
			},
		},

		sass: {
		  dev: {
		    options: {
		      style: 'expanded',
		      sourcemap: 'none',
		    },
		    files: {
		      'style.css': 'src/sass/style.scss'
		    }
		  }
		},

    // Express Server
    express: {
      all: {
        options: {
          port: 9000,
          hostname: 'localhost',
          bases: '.',
          livereload: true
        }
      }
    },

		watch: {
      options: {
        livereload: true
      },
      html: {
        files: ['theme.html'],
      },
			css: {
				files: ['src/sass/*.scss', 'src/sass/*/*.scss'],
				tasks: ['sass']
			},
      js: {
        files: ['src/js/*.js'],
        tasks: ['jshint', 'concat']
      }
		},

	});
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-express');
	grunt.registerTask('default',['watch']);
  grunt.registerTask('server',['express', 'watch']);
};
