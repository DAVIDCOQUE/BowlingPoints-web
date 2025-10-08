// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'), // ✅ cobertura moderna
      require('karma-jasmine-html-reporter'),
      require('karma-spec-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false
    },

    // ✅ Configuración correcta de cobertura
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/bowling-points'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'lcovonly', file: 'lcov.info' }, // <- el que usa SonarCloud
        { type: 'text-summary' }
      ]
    },

    // ✅ Cambia el nombre del reporter
    reporters: ['progress', 'kjhtml', 'coverage'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    restartOnFileChange: false,
    failOnEmptyTestSuite: true,

    // ✅ Chrome headless en GitHub Actions
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-software-rasterizer',
          '--mute-audio',
          '--remote-debugging-port=9222'
        ]
      }
    }
  });
};
