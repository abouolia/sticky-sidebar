module.exports = function(grunt) {

	grunt.initConfig({
		concat: {
			options: {
				separator: ';',
			},
			dist: {
				src: ['bower_components/raf.js/raf.js', 'sticky-sidebar.js'],
				dest: 'dist/sticky-sidebar.pkgd.js',
			},
		},
		jshint: {
			files: ['Gruntfile.js', './sticky-sidebar.js'],
			options: {
				globals: {
					jQuery: true
				},
				reporterOutput: ""
			}
		},
		uglify: {
			target: {
				files: {
					'sticky-sidebar.js': ['dist/sticky-sidebar.min.js'],
					'dist/sticky-sidebar.pkgd.min.js': ['dist/sticky-sidebar.pkgd.js'],
				},
			},
		},
		copy: {
			main: {
				expand: true,
				cwd: 'dist/',
				src: 'sticky-sidebar.pkgd.js',
				dest: 'docs/js'
			},
		},
		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['concat', 'jshint', 'uglify', 'copy']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['concat', 'jshint', 'uglify']);
};
