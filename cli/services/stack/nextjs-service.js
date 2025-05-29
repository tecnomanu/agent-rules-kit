/**
 * Next.js Service for Agent Rules Kit
 * Manages Next.js specific rules and configurations
 */
import chalk from 'chalk';
import path from 'path';
import { BaseService } from '../base-service.js';

/**
 * Servicio específico para el stack Next.js
 */
export class NextjsService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.fileService = options.fileService;
        this.configService = options.configService;
        this.templatesDir = options.templatesDir;
    }

    /**
     * Copia reglas de arquitectura específicas (app vs pages)
     * @param {string} architecture - Nombre de la arquitectura ('app', 'pages', 'hybrid')
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} options - Opciones adicionales
     */
    copyArchitectureRules(architecture, targetRules, options = {}) {
        if (!architecture) return;

        const templatesDir = options.templatesDir || this.templatesDir;
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        if (architecture === 'app' || architecture === 'hybrid') {
            this.copyAppArchitecture(templatesDir, targetRules, kitConfig, options);
        }

        if (architecture === 'pages' || architecture === 'hybrid') {
            this.copyPagesArchitecture(templatesDir, targetRules, kitConfig, options);
        }
    }

    /**
     * Copia reglas específicas de arquitectura App Router
     * @param {string} templatesDir - Directorio de plantillas
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} kitConfig - Configuración del kit
     * @param {Object} options - Opciones adicionales
     * @private
     */
    copyAppArchitecture(templatesDir, targetRules, kitConfig, options = {}) {
        const appDir = path.join(templatesDir, 'stacks/nextjs/architectures/app');

        if (this.fileService.directoryExists(appDir)) {
            const files = this.fileService.getFilesInDirectory(appDir);
            this.debugLog(`Encontrados ${files.length} archivos de arquitectura app para procesar`);

            // Crear directorio de stack si no existe
            const stackFolder = path.join(targetRules, 'nextjs');
            this.fileService.ensureDirectoryExists(stackFolder);

            files.forEach(f => {
                const srcFile = path.join(appDir, f);
                // Usar prefijo para indicar la arquitectura
                const fileName = `architecture-app-${f}`.replace(/\.md$/, '.mdc');
                const destFile = path.join(stackFolder, fileName);

                // Metadata personalizada para cada archivo
                const fileMeta = {
                    stack: 'nextjs',
                    architecture: 'app',
                    projectPath: options.projectPath || '.',
                    detectedVersion: options.detectedVersion,
                    versionRange: options.versionRange,
                    debug: options.debug || this.debug
                };

                this.fileService.wrapMdToMdc(srcFile, destFile, fileMeta, kitConfig);
                this.debugLog(`Procesado archivo de arquitectura app: ${f}`);
            });

            console.log(`${chalk.green('✅')} Aplicadas reglas de arquitectura ${chalk.magenta('app')} para Next.js`);
        } else {
            this.debugLog(`Directorio de arquitectura app no existe: ${appDir}`);
        }
    }

    /**
     * Copia reglas específicas de arquitectura Pages Router
     * @param {string} templatesDir - Directorio de plantillas
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} kitConfig - Configuración del kit
     * @param {Object} options - Opciones adicionales
     * @private
     */
    copyPagesArchitecture(templatesDir, targetRules, kitConfig, options = {}) {
        const pagesDir = path.join(templatesDir, 'stacks/nextjs/architectures/pages');

        if (this.fileService.directoryExists(pagesDir)) {
            const files = this.fileService.getFilesInDirectory(pagesDir);
            this.debugLog(`Encontrados ${files.length} archivos de arquitectura pages para procesar`);

            // Crear directorio de stack si no existe
            const stackFolder = path.join(targetRules, 'nextjs');
            this.fileService.ensureDirectoryExists(stackFolder);

            files.forEach(f => {
                const srcFile = path.join(pagesDir, f);
                // Usar prefijo para indicar la arquitectura
                const fileName = `architecture-pages-${f}`.replace(/\.md$/, '.mdc');
                const destFile = path.join(stackFolder, fileName);

                // Metadata personalizada para cada archivo
                const fileMeta = {
                    stack: 'nextjs',
                    architecture: 'pages',
                    projectPath: options.projectPath || '.',
                    detectedVersion: options.detectedVersion,
                    versionRange: options.versionRange,
                    debug: options.debug || this.debug
                };

                this.fileService.wrapMdToMdc(srcFile, destFile, fileMeta, kitConfig);
                this.debugLog(`Procesado archivo de arquitectura pages: ${f}`);
            });

            console.log(`${chalk.green('✅')} Aplicadas reglas de arquitectura ${chalk.magenta('pages')} para Next.js`);
        } else {
            this.debugLog(`Directorio de arquitectura pages no existe: ${pagesDir}`);
        }
    }

    /**
     * Copia overlay de versiones específicas
     * @param {string} versionDir - Directorio de versión
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} options - Opciones adicionales
     */
    copyVersionOverlay(versionDir, targetRules, options = {}) {
        if (!versionDir) return;

        const templatesDir = options.templatesDir || this.templatesDir;
        const overlayDir = path.join(templatesDir, 'stacks/nextjs', versionDir);

        if (this.fileService.directoryExists(overlayDir)) {
            this.debugLog(`Aplicando overlay de nextjs desde: ${overlayDir}`);
            const files = this.fileService.getFilesInDirectory(overlayDir);
            this.debugLog(`Encontrados ${files.length} archivos para procesar`);

            // Obtener configuración del kit para metadatos de reglas
            const kitConfig = this.configService.loadKitConfig(templatesDir);

            files.forEach(f => {
                const srcFile = path.join(overlayDir, f);
                // Escribir directamente al directorio de reglas con nombre de archivo prefijado para organización
                const fileName = `${f}`.replace(/\.md$/, '.mdc');
                // Almacenar en subcarpeta específica del stack
                const stackFolder = path.join(targetRules, 'nextjs');
                this.fileService.ensureDirectoryExists(stackFolder);
                const destFile = path.join(stackFolder, fileName);

                // Pasar metadata correcta incluyendo projectPath
                const meta = {
                    projectPath: options.projectPath || '.',
                    stack: 'nextjs',
                    detectedVersion: options.detectedVersion,
                    versionRange: options.versionRange,
                    debug: options.debug || this.debug
                };

                this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
                this.debugLog(`Procesado archivo de overlay: ${f}`);
            });

            console.log(`${chalk.green('✅')} Aplicadas reglas específicas de versión ${chalk.yellow(versionDir)} para ${chalk.cyan('nextjs')}`);
        } else {
            this.debugLog(`Directorio de overlay no existe: ${overlayDir}`);
        }
    }

    /**
     * Copia reglas base de Next.js
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} versionMeta - Metadatos de versión
     * @param {Object} options - Opciones adicionales
     */
    copyBaseRules(targetRules, versionMeta = {}, options = {}) {
        const templatesDir = options.templatesDir || this.templatesDir;
        const baseDir = path.join(templatesDir, 'stacks/nextjs/base');
        this.debugLog(`Buscando reglas base en: ${baseDir}`);

        if (!this.fileService.directoryExists(baseDir)) {
            console.error(chalk.red(`❌ Directorio base no encontrado: ${baseDir}`));
            return false;
        }

        this.debugLog(`Encontrado directorio base con ${this.fileService.getFilesInDirectory(baseDir).length} archivos`);

        // Obtener configuración del kit para metadatos de reglas
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        // Iterar sobre archivos base y añadir path del proyecto e info de versión
        const baseFiles = this.fileService.getFilesInDirectory(baseDir);
        this.debugLog(`Procesando ${baseFiles.length} archivos base para nextjs`);

        // Crear directorio de stack si no existe
        const stackFolder = path.join(targetRules, 'nextjs');
        this.fileService.ensureDirectoryExists(stackFolder);

        baseFiles.forEach(f => {
            const srcFile = path.join(baseDir, f);
            // Almacenar en carpeta de stack con nombre original
            const fileName = `${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            this.debugLog(`Copiando ${f} a ${fileName}`);

            // Metadata personalizada para cada archivo
            const fileMeta = {
                ...versionMeta,
                stack: 'nextjs',
                projectPath: options.projectPath || '.',
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, fileMeta, kitConfig);
        });

        console.log(`${chalk.green('✅')} Copiadas reglas base para ${chalk.cyan('nextjs')}`);
        return true;
    }
} 