#!/usr/bin/env node

/**
 * Punto de entrada principal para Agent Rules Kit
 * Nueva arquitectura de servicios v1.0.0
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';

import { BaseService } from './services/base-service.js';
import { CliService } from './services/cli-service.js';
import { ConfigService } from './services/config-service.js';
import { FileService } from './services/file-service.js';
import { LaravelService } from './services/laravel-service.js';
import { NextjsService } from './services/nextjs-service.js';
import { ReactService } from './services/react-service.js';

// Configuración de rutas
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '../templates');

// Parseamos argumentos de línea de comandos
const args = process.argv.slice(2);
const debugMode = args.includes('--debug');

// Inicializamos servicios
const baseService = new BaseService({ debug: debugMode });
const fileService = new FileService({ debug: debugMode, templatesDir });
const configService = new ConfigService({ debug: debugMode, templatesDir });
const cliService = new CliService({ debug: debugMode });

// Servicios específicos para cada stack
const laravelService = new LaravelService({
    debug: debugMode,
    fileService,
    configService,
    templatesDir
});

const nextjsService = new NextjsService({
    debug: debugMode,
    fileService,
    configService,
    templatesDir
});

const reactService = new ReactService({
    debug: debugMode,
    fileService,
    configService,
    templatesDir
});

// Definición de opciones disponibles
const availableStacks = [
    { name: 'Laravel', value: 'laravel' },
    { name: 'Next.js', value: 'nextjs' },
    { name: 'React', value: 'react' }
];

const availableArchitectures = {
    laravel: [
        { name: 'Estándar', value: 'standard' },
        { name: 'Domain-Driven Design (DDD)', value: 'ddd' },
        { name: 'Hexagonal', value: 'hexagonal' }
    ],
    nextjs: [
        { name: 'App Router', value: 'app' },
        { name: 'Pages Router', value: 'pages' },
        { name: 'Híbrido (ambos)', value: 'hybrid' }
    ],
    react: [
        { name: 'Atomic Design', value: 'atomic' },
        { name: 'Feature Sliced', value: 'feature-sliced' },
        { name: 'Estándar', value: 'standard' }
    ]
};

const availableVersions = {
    laravel: [
        { name: 'Laravel 10-11', value: 'v10-11' },
        { name: 'Laravel 8-9', value: 'v8-9' },
        { name: 'Laravel 7 o anterior', value: 'v7-older' }
    ],
    nextjs: [
        { name: 'Next.js 14', value: 'v14' },
        { name: 'Next.js 13', value: 'v13' },
        { name: 'Next.js 12 o anterior', value: 'v12-older' }
    ]
};

const availableStateManagement = [
    { name: 'Redux', value: 'redux' },
    { name: 'Redux Toolkit', value: 'redux-toolkit' },
    { name: 'Context API', value: 'context' },
    { name: 'React Query', value: 'react-query' },
    { name: 'Zustand', value: 'zustand' }
];

/**
 * Función principal
 */
async function main() {
    cliService.showBanner('🚀 Agent Rules Kit v1.0.0', true);

    // Preguntar por el stack a utilizar
    const stack = await cliService.askStack(availableStacks);

    // Preguntar por el directorio de destino de las reglas
    const { rulesDir } = await inquirer.prompt([
        {
            type: 'input',
            name: 'rulesDir',
            message: `${cliService.emoji.file} ¿Dónde quieres guardar las reglas?`,
            default: './agent-rules'
        }
    ]);

    // Preguntar por la ruta del proyecto
    const projectPath = await cliService.askProjectPath();

    // Asegurar que el directorio de reglas existe
    baseService.ensureDirectoryExists(rulesDir);

    // Preguntas específicas según el stack seleccionado
    let additionalOptions = {};

    if (stack === 'laravel') {
        const version = await cliService.askVersion(availableVersions.laravel);
        const architecture = await cliService.askArchitecture(availableArchitectures.laravel, stack);
        additionalOptions = { version, architecture };
    }
    else if (stack === 'nextjs') {
        const version = await cliService.askVersion(availableVersions.nextjs);
        const architecture = await cliService.askArchitecture(availableArchitectures.nextjs, stack);
        additionalOptions = { version, architecture };
    }
    else if (stack === 'react') {
        const architecture = await cliService.askArchitecture(availableArchitectures.react, stack);
        const stateManagement = await cliService.askStateManagement(availableStateManagement);
        additionalOptions = { architecture, stateManagement };
    }

    // Preparamos los metadatos comunes
    const meta = {
        stack,
        projectPath,
        debug: debugMode,
        ...additionalOptions
    };

    // Procesamos el stack seleccionado
    cliService.processing(`Procesando reglas para ${stack}...`);

    switch (stack) {
        case 'laravel':
            await laravelService.copyBaseRules(rulesDir, meta);
            if (additionalOptions.version) {
                await laravelService.copyVersionOverlay(rulesDir, additionalOptions.version, meta);
            }
            if (additionalOptions.architecture) {
                await laravelService.copyArchitectureRules(additionalOptions.architecture, rulesDir, meta);
            }
            break;

        case 'nextjs':
            await nextjsService.copyBaseRules(rulesDir, meta);
            if (additionalOptions.version) {
                await nextjsService.copyVersionOverlay(rulesDir, additionalOptions.version, meta);
            }
            if (additionalOptions.architecture) {
                await nextjsService.copyArchitectureRules(additionalOptions.architecture, rulesDir, meta);
            }
            break;

        case 'react':
            await reactService.copyBaseRules(rulesDir, meta);
            if (additionalOptions.architecture) {
                await reactService.copyArchitectureRules(additionalOptions.architecture, rulesDir, meta);
            }
            if (additionalOptions.stateManagement) {
                await reactService.copyStateManagementRules(additionalOptions.stateManagement, rulesDir, meta);
            }
            break;

        default:
            cliService.error(`Stack no soportado: ${stack}`);
            process.exit(1);
    }

    cliService.success(`Reglas para ${stack} generadas con éxito`);

    console.log(chalk.cyan('\n📖 Documentación:'));
    console.log(chalk.blue('  - Docs: ') + chalk.white(`${rulesDir}/docs`));
    console.log(chalk.blue('  - Reglas Cursor: ') + chalk.white(`${rulesDir}/rules`));

    console.log(chalk.green('\n✅ Todo listo! ') + chalk.white('Importa las reglas en Cursor con el comando "Import Rules"'));
}

// Ejecutar la aplicación
main().catch(error => {
    cliService.error(`Error inesperado: ${error.message}`);
    if (debugMode) {
        console.error(error);
    }
    process.exit(1);
});