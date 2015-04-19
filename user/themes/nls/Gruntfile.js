module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
        uglify: {
            dist: {
                options: {
                    mangle: false,
                    beautify: false,
                    compress: {
                        drop_console: true,
                        conditionals: false,
                        dead_code: false,
                        unused: false
                    },
                    sourceMap: false
                },
                files: {
                    'build/js/nls.min.js': [
                        'src/javascripts/*'
                    ]
                }
            }
        },
        compass: {
            options: {
                sassPath: 'src/stylesheets',
                cssPath: 'build/css',
                imagesPath: 'images',
                sourcemap: false,
                relativeAssets: false,
                require: ['susy', 'breakpoint']
            },
            dist: {
                options: {
                    environment: 'production',
                    httpPath: 'https://static.gemmyo.com/skin/frontend/gemmyo/default/',
                    httpImagesPath: 'https://static.gemmyo.com/skin/frontend/gemmyo/default/images/',
                    outputStyle: 'compressed',
                    force: true
                }
            }
        },
        watch: {
            sass: {
                files: 'src/stylesheets/{,*/}{,*/}*.scss',
                tasks: ['compass'],
                options: {
                    livereload: true,
                },
            },
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);
};