module.exports = function(grunt) {

	grunt.initConfig({
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
					'sticky-sidebar.min.js': 'sticky-sidebar.js'
				},
			},
		},
		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint', 'uglify']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['jshint', 'uglify']);
};