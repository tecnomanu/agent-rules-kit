/**
 * Base Service para Agent Rules Kit
 * Proporciona funcionalidades compartidas para todos los servicios
 */
import chalk from 'chalk';
import fs from 'fs-extra';

/**
 * Servicio base que proporciona utilidades compartidas
 */
export class BaseService {
    constructor(options = {}) {
        this.debug = options.debug || false;
    }

    /**
     * Debug log helper - Centralizado para todos los servicios
     * @param {...any} args - Argumentos para loguear
     */
    debugLog(...args) {
        if (this.debug) {
            console.log(chalk.gray('[DEBUG]'), ...args);
        }
    }

    /**
     * Comprueba si un directorio existe
     * @param {string} dir - Ruta del directorio a comprobar
     * @returns {boolean} - true si existe, false si no
     */
    directoryExists(dir) {
        return fs.existsSync(dir);
    }

    /**
     * Asegura que un directorio existe, creándolo si es necesario
     * @param {string} dir - Ruta del directorio a crear
     */
    ensureDirectoryExists(dir) {
        fs.ensureDirSync(dir);
    }

    /**
     * Obtiene los archivos de un directorio
     * @param {string} dir - Ruta del directorio
     * @returns {Array<string>} - Lista de archivos
     */
    getFilesInDirectory(dir) {
        if (!this.directoryExists(dir)) {
            this.debugLog(`Directorio no encontrado: ${dir}`);
            return [];
        }

        return fs.readdirSync(dir);
    }

    /**
     * Lee un archivo
     * @param {string} file - Ruta del archivo a leer
     * @returns {string} - Contenido del archivo
     */
    readFile(file) {
        return fs.readFileSync(file, 'utf8');
    }

    /**
     * Escribe un archivo
     * @param {string} file - Ruta del archivo a escribir
     * @param {string} content - Contenido a escribir
     */
    writeFile(file, content) {
        fs.outputFileSync(file, content);
        this.debugLog(`Archivo creado: ${chalk.green(file)}`);
    }

    /**
     * Copia un archivo
     * @param {string} src - Archivo fuente
     * @param {string} dest - Destino
     */
    copyFile(src, dest) {
        fs.copyFileSync(src, dest);
        this.debugLog(`Archivo copiado: ${chalk.green(dest)}`);
    }
} 