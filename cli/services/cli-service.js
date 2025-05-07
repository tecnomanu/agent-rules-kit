/**
 * CLI Service para Agent Rules Kit
 * Maneja la interfaz de línea de comandos y formateo de mensajes
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import { BaseService } from './base-service.js';

/**
 * Servicio para manejar la interfaz de línea de comandos
 */
export class CliService extends BaseService {
    constructor(options = {}) {
        super(options);
        // Inicializar con defaults para emojis y colores
        this.emoji = {
            info: '📌',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            processing: '🔄',
            stack: '📚',
            version: '🏷️',
            architecture: '🏗️',
            config: '⚙️',
            backup: '📦',
            file: '📄'
        };
    }

    /**
     * Muestra un mensaje de banner
     * @param {string} message - Mensaje a mostrar
     * @param {boolean} clear - Si se debe limpiar la consola primero
     */
    showBanner(message, clear = false) {
        if (clear) console.clear();
        console.log(chalk.bold.blue('\n' + '='.repeat(message.length + 10)));
        console.log(chalk.bold.blue('     ' + message + '     '));
        console.log(chalk.bold.blue('='.repeat(message.length + 10) + '\n'));
    }

    /**
     * Muestra un mensaje informativo
     * @param {string} message - Mensaje a mostrar
     */
    info(message) {
        console.log(`${chalk.blue(this.emoji.info)} ${message}`);
    }

    /**
     * Muestra un mensaje de éxito
     * @param {string} message - Mensaje a mostrar
     */
    success(message) {
        console.log(`${chalk.green(this.emoji.success)} ${message}`);
    }

    /**
     * Muestra un mensaje de advertencia
     * @param {string} message - Mensaje a mostrar
     */
    warning(message) {
        console.log(`${chalk.yellow(this.emoji.warning)} ${chalk.yellow(message)}`);
    }

    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje a mostrar
     */
    error(message) {
        console.log(`${chalk.red(this.emoji.error)} ${chalk.red(message)}`);
    }

    /**
     * Muestra un mensaje de procesamiento
     * @param {string} message - Mensaje a mostrar
     */
    processing(message) {
        console.log(`${chalk.blue(this.emoji.processing)} ${message}`);
    }

    /**
     * Pregunta al usuario sobre el stack a utilizar
     * @param {Array<string>} availableStacks - Stacks disponibles
     * @returns {Promise<string>} El stack seleccionado
     */
    async askStack(availableStacks) {
        const { stack } = await inquirer.prompt([
            {
                type: 'list',
                name: 'stack',
                message: `${this.emoji.stack} Selecciona el stack para tus reglas:`,
                choices: availableStacks,
            }
        ]);
        return stack;
    }

    /**
     * Pregunta al usuario sobre la arquitectura a utilizar
     * @param {Array<string>} availableArchitectures - Arquitecturas disponibles
     * @param {string} stack - Stack seleccionado
     * @returns {Promise<string>} La arquitectura seleccionada
     */
    async askArchitecture(availableArchitectures, stack) {
        if (!availableArchitectures || availableArchitectures.length === 0) {
            return null;
        }

        const { architecture } = await inquirer.prompt([
            {
                type: 'list',
                name: 'architecture',
                message: `${this.emoji.architecture} Selecciona la arquitectura para ${stack}:`,
                choices: [...availableArchitectures, { name: 'No especificar arquitectura', value: null }]
            }
        ]);
        return architecture;
    }

    /**
     * Pregunta al usuario sobre el gestor de estado a utilizar (React)
     * @param {Array<string>} availableStateManagement - Gestores de estado disponibles
     * @returns {Promise<string>} El gestor de estado seleccionado
     */
    async askStateManagement(availableStateManagement) {
        if (!availableStateManagement || availableStateManagement.length === 0) {
            return null;
        }

        const { stateManagement } = await inquirer.prompt([
            {
                type: 'list',
                name: 'stateManagement',
                message: `${this.emoji.config} Selecciona el gestor de estado para React:`,
                choices: [...availableStateManagement, { name: 'No especificar gestor de estado', value: null }]
            }
        ]);
        return stateManagement;
    }

    /**
     * Pregunta al usuario sobre la versión a utilizar
     * @param {Array<string>} availableVersions - Versiones disponibles
     * @param {string} detectedVersion - Versión detectada
     * @returns {Promise<string>} La versión seleccionada
     */
    async askVersion(availableVersions, detectedVersion) {
        let message = `${this.emoji.version} Selecciona la versión:`;

        if (detectedVersion) {
            message = `${this.emoji.version} Versión detectada: ${detectedVersion}. ¿Quieres usar otra?`;
        }

        const { version } = await inquirer.prompt([
            {
                type: 'list',
                name: 'version',
                message,
                choices: [
                    ...(detectedVersion ? [{ name: `Usar la versión detectada (${detectedVersion})`, value: detectedVersion }] : []),
                    ...availableVersions.map(v => ({ name: v, value: v })),
                    { name: 'No especificar versión', value: null }
                ]
            }
        ]);
        return version;
    }

    /**
     * Pregunta al usuario por la ruta relativa del proyecto
     * @returns {Promise<string>} La ruta relativa del proyecto
     */
    async askProjectPath() {
        const { projectPath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectPath',
                message: `${this.emoji.file} Ruta relativa a tu proyecto (si no está en la raíz) desde directorio .cursor:`,
                default: '.'
            }
        ]);
        return projectPath;
    }

    /**
     * Pregunta al usuario si desea activar el modo debug
     * @returns {Promise<boolean>} true si el modo debug está activado
     */
    async askDebugMode() {
        const { debug } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'debug',
                message: `${this.emoji.config} ¿Activar modo debug?`,
                default: false
            }
        ]);
        return debug;
    }

    /**
     * Pregunta al usuario si desea continuar cuando existe un directorio
     * @param {string} dirName - Nombre del directorio
     * @returns {Promise<boolean>} true si desea continuar
     */
    async askOverwriteDirectory(dirName) {
        const { continuar } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'continuar',
                message: `${this.emoji.warning} El directorio ${chalk.yellow(dirName)} ya existe. ¿Deseas continuar? Se realizará un backup antes de sobrescribir.`,
                default: false
            }
        ]);
        return continuar;
    }

    /**
     * Informa sobre la creación de un backup
     * @param {string} originalDir - Directorio original
     * @param {string} backupDir - Directorio de backup
     */
    backupCreated(originalDir, backupDir) {
        this.info(`${this.emoji.backup} Backup creado: ${chalk.green(originalDir)} → ${chalk.green(backupDir)}`);
    }
} 