# BowlingPoints

[![CI Analysis](https://github.com/DAVIDCOQUE/BowlingPoints-web/actions/workflows/ci-analysis.yml/badge.svg)](https://github.com/DAVIDCOQUE/BowlingPoints-web/actions/workflows/ci-analysis.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DAVIDCOQUE_BowlingPoints-web&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DAVIDCOQUE_BowlingPoints-web)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DAVIDCOQUE_BowlingPoints-web&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DAVIDCOQUE_BowlingPoints-web)

Aplicación web para calcular puntuaciones de bowling desarrollada con Angular.

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 16.2.10.

## 🚀 Tecnologías

- **Angular** 16.2.10
- **Angular Material** - Componentes UI
- **Bootstrap 5** - Estilos y diseño responsive
- **Bootstrap Icons** - Iconografía
- **Font Awesome** - Iconos adicionales
- **TypeScript** - Lenguaje principal
- **Karma + Jasmine** - Testing unitario
- **ESLint** - Análisis de código
- **SonarCloud** - Calidad y cobertura de código

## 📋 Prerequisitos

- Node.js (versión LTS recomendada)
- npm o yarn
- Angular CLI: `npm install -g @angular/cli`

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/DAVIDCOQUE/BowlingPoints-web.git

# Navegar al directorio
cd BowlingPoints-web

# Instalar dependencias
npm install
```

## 💻 Desarrollo

### Servidor de desarrollo

```bash
ng serve
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si modificas algún archivo fuente.

### Generación de código

```bash
# Generar un componente
ng generate component component-name

# Otros comandos disponibles
ng generate directive|pipe|service|class|guard|interface|enum|module
```

## 🏗️ Build

```bash
# Build de producción
ng build

# Build de desarrollo
ng build --configuration development
```

Los archivos generados se almacenarán en el directorio `dist/bowling-points/`.

### Configuraciones de Build

- **Production**: Optimización completa, source maps deshabilitados, hashing de archivos
- **Development**: Build rápido con source maps para debugging

## 🧪 Testing

### Tests unitarios

```bash
# Ejecutar tests con cobertura
ng test

# Tests en modo headless (CI)
ng test --watch=false --browsers=ChromeHeadless
```

Los tests se ejecutan con [Karma](https://karma-runner.github.io) y Jasmine. La cobertura se genera en `coverage/bowling-points/`.

### Análisis de código

```bash
# Ejecutar linter
ng lint
```

## 📊 Análisis de Calidad

El proyecto está integrado con [SonarCloud](https://sonarcloud.io) para análisis continuo de calidad de código:

- **Cobertura mínima**: Configurada en el pipeline
- **Exclusiones**: Archivos de configuración, environments, módulos y routing
- **Reportes**: Disponibles en el directorio `coverage/`

## 🚀 CI/CD

El proyecto utiliza GitHub Actions para integración continua:

- **CI Analysis** ([.github/workflows/ci-analysis.yml](.github/workflows/ci-analysis.yml)): Ejecuta tests, linting y análisis de SonarCloud
- **Deploy Main** ([.github/workflows/deploy-main.yml](.github/workflows/deploy-main.yml)): Despliegue automático desde la rama main

## 📁 Estructura del Proyecto

```
BowlingPoints-web/
├── src/
│   ├── app/           # Componentes y módulos de la aplicación
│   ├── assets/        # Recursos estáticos
│   ├── environments/  # Configuración por ambiente
│   └── styles.css     # Estilos globales
├── coverage/          # Reportes de cobertura
├── dist/              # Build de producción
└── angular.json       # Configuración de Angular
```

## 🔧 Configuración

- **TypeScript**: [tsconfig.json](tsconfig.json), [tsconfig.app.json](tsconfig.app.json), [tsconfig.spec.json](tsconfig.spec.json)
- **ESLint**: [eslint.config.js](eslint.config.js)
- **Karma**: [karma.conf.js](karma.conf.js)
- **SonarCloud**: [sonar-project.properties](sonar-project.properties)
- **Angular**: [angular.json](angular.json)

## 👨‍💻 Autor

**DAVIDCOQUE**
- GitHub: [@DAVIDCOQUE](https://github.com/DAVIDCOQUE)

## 📚 Recursos Adicionales

Para más información sobre Angular CLI:
- Ejecuta `ng help`
- Consulta la [documentación oficial de Angular CLI](https://angular.io/cli)
