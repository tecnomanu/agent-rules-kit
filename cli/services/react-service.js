/**
 * React Service para Agent Rules Kit
 * Maneja operaciones específicas del stack React
 */
import chalk from 'chalk';
import path from 'path';
import { BaseService } from './base-service.js';

/**
 * Servicio específico para el stack React
 */
export class ReactService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.fileService = options.fileService;
        this.configService = options.configService;
        this.templatesDir = options.templatesDir;
    }

    /**
     * Copia reglas de arquitectura específicas para React
     * @param {string} architecture - Nombre de la arquitectura (atomic, feature-sliced, etc.)
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} options - Opciones adicionales
     */
    copyArchitectureRules(architecture, targetRules, options = {}) {
        if (!architecture) return;

        const templatesDir = options.templatesDir || this.templatesDir;
        const archDir = path.join(templatesDir, 'stacks/react/architectures', architecture);

        this.debugLog(`Buscando reglas de arquitectura React: ${architecture}`);

        if (!this.fileService.directoryExists(archDir)) {
            this.debugLog(`Directorio de arquitectura React no encontrado: ${archDir}`);
            return;
        }

        const files = this.fileService.getFilesInDirectory(archDir);
        this.debugLog(`Encontrados ${files.length} archivos de arquitectura para React ${architecture}`);

        // Crear directorio de stack si no existe
        const stackFolder = path.join(targetRules, 'react');
        this.fileService.ensureDirectoryExists(stackFolder);

        // Obtener configuración del kit para metadatos de reglas
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        files.forEach(f => {
            const srcFile = path.join(archDir, f);
            // Usar prefijo para indicar la arquitectura
            const fileName = `architecture-${architecture}-${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            // Metadata personalizada para cada archivo
            const meta = {
                stack: 'react',
                architecture: architecture,
                projectPath: options.projectPath || '.',
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
            this.debugLog(`Procesado archivo de arquitectura React: ${f}`);
        });

        console.log(`${chalk.green('✅')} Aplicadas reglas de arquitectura ${chalk.magenta(architecture)} para React`);
    }

    /**
     * Copia reglas de testing para React
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} options - Opciones adicionales
     */
    copyTestingRules(targetRules, options = {}) {
        const templatesDir = options.templatesDir || this.templatesDir;
        const testingDir = path.join(templatesDir, 'stacks/react/testing');

        this.debugLog(`Buscando reglas de testing para React`);

        if (!this.fileService.directoryExists(testingDir)) {
            this.debugLog(`Directorio de testing React no encontrado: ${testingDir}`);
            return;
        }

        const files = this.fileService.getFilesInDirectory(testingDir);
        this.debugLog(`Encontrados ${files.length} archivos de testing para React`);

        // Crear directorio de stack si no existe
        const stackFolder = path.join(targetRules, 'react');
        this.fileService.ensureDirectoryExists(stackFolder);

        // Obtener configuración del kit para metadatos de reglas
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        files.forEach(f => {
            const srcFile = path.join(testingDir, f);
            // Usar prefijo para indicar que es una regla de testing
            const fileName = `testing-${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            // Metadata personalizada para cada archivo
            const meta = {
                stack: 'react',
                testing: true,
                projectPath: options.projectPath || '.',
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
            this.debugLog(`Procesado archivo de testing React: ${f}`);
        });

        console.log(`${chalk.green('✅')} Aplicadas reglas de testing para React`);
    }

    /**
     * Copia reglas de gestión de estado para React
     * @param {string} stateManager - Nombre del gestor de estado (redux, mobx, etc.)
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} options - Opciones adicionales
     */
    copyStateManagementRules(stateManager, targetRules, options = {}) {
        if (!stateManager) return;

        const templatesDir = options.templatesDir || this.templatesDir;
        const stateDir = path.join(templatesDir, 'stacks/react/state-management', stateManager);

        this.debugLog(`Buscando reglas de gestión de estado React: ${stateManager}`);

        if (!this.fileService.directoryExists(stateDir)) {
            this.debugLog(`Directorio de gestión de estado React no encontrado: ${stateDir}`);
            return;
        }

        const files = this.fileService.getFilesInDirectory(stateDir);
        this.debugLog(`Encontrados ${files.length} archivos de gestión de estado para React ${stateManager}`);

        // Crear directorio de stack si no existe
        const stackFolder = path.join(targetRules, 'react');
        this.fileService.ensureDirectoryExists(stackFolder);

        // Obtener configuración del kit para metadatos de reglas
        const kitConfig = this.configService.loadKitConfig(templatesDir);

        files.forEach(f => {
            const srcFile = path.join(stateDir, f);
            // Usar prefijo para indicar el gestor de estado
            const fileName = `state-${stateManager}-${f}`.replace(/\.md$/, '.mdc');
            const destFile = path.join(stackFolder, fileName);

            // Metadata personalizada para cada archivo
            const meta = {
                stack: 'react',
                stateManagement: stateManager,
                projectPath: options.projectPath || '.',
                detectedVersion: options.detectedVersion,
                versionRange: options.versionRange,
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, meta, kitConfig);
            this.debugLog(`Procesado archivo de gestión de estado React: ${f}`);
        });

        console.log(`${chalk.green('✅')} Aplicadas reglas de gestión de estado ${chalk.yellow(stateManager)} para React`);
    }

    /**
     * Copia reglas base de React
     * @param {string} targetRules - Directorio destino de reglas
     * @param {Object} versionMeta - Metadatos de versión
     * @param {Object} options - Opciones adicionales
     */
    copyBaseRules(targetRules, versionMeta = {}, options = {}) {
        const templatesDir = options.templatesDir || this.templatesDir;
        const baseDir = path.join(templatesDir, 'stacks/react/base');
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
        this.debugLog(`Procesando ${baseFiles.length} archivos base para react`);

        // Crear directorio de stack si no existe
        const stackFolder = path.join(targetRules, 'react');
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
                stack: 'react',
                projectPath: options.projectPath || '.',
                debug: options.debug || this.debug
            };

            this.fileService.wrapMdToMdc(srcFile, destFile, fileMeta, kitConfig);
        });

        console.log(`${chalk.green('✅')} Copiadas reglas base para ${chalk.cyan('react')}`);
        return true;
    }
} 