// karma.conf.js
module.exports = function (config) {
  config.set({
    // Ruta base del proyecto
    basePath: '',

    // Frameworks que usará Karma para ejecutar las pruebas
    frameworks: ['jasmine', '@angular-devkit/build-angular'],

    // Plugins necesarios para ejecutar Jasmine y generar reportes de cobertura
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('karma-jasmine-html-reporter'),
      require('karma-spec-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],

    // Configuración del cliente Karma
    client: {
      clearContext: false
    },

    // Reporte de cobertura para SonarQube
    coverageReporter: {
      // Carpeta donde se genera el reporte de cobertura
      dir: require('path').join(__dirname, './coverage/bowling-points'),
      subdir: '.',

      // Reportes a generar
      reporters: [
        { type: 'html' }, // Reporte visual HTML
        { type: 'lcovonly', file: 'lcov.info' }, // Reporte LCOV para Sonar
        { type: 'text-summary' } // Resumen en consola
      ]
    },

    // Reportes mostrados en consola y navegador
    reporters: ['progress', 'kjhtml'],

    // Puerto del servidor de Karma
    port: 9876,

    // Colores en la salida de consola
    colors: true,

    // Nivel de log
    logLevel: config.LOG_INFO,

    // No observar cambios en archivos automáticamente (ideal para CI)
    autoWatch: false,

    // Ejecutar pruebas solo una vez
    singleRun: true,

    // Reiniciar Karma al cambiar archivos (lo dejamos en false)
    restartOnFileChange: false,

    // Falla si no hay ningún test (buena práctica)
    failOnEmptyTestSuite: true,

    // Navegador para correr las pruebas (ideal para CI como GitHub Actions)
    browsers: ['ChromeHeadlessNoSandbox'],

    // Configuración del navegador personalizado
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
