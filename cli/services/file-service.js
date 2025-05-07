/**
 * File Service para Agent Rules Kit
 * Gestiona todas las operaciones relacionadas con archivos
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { BaseService } from './base-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Servicio para manejar operaciones de archivos y procesamiento de reglas
 */
export class FileService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.templatesDir = options.templatesDir || path.join(__dirname, '../../../templates');
    }

    /**
     * Agrega front matter a contenido markdown
     * @param {string} body - Contenido Markdown
     * @param {Object} meta - Metadata para front matter
     * @returns {string} - Markdown con front matter
     */
    addFrontMatter(body, meta) {
        return `---\n${Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n${body}`;
    }

    /**
     * Procesa variables de plantilla en contenido markdown
     * @param {string} content - Contenido Markdown
     * @param {Object} meta - Metadata para reemplazos
     * @returns {string} - Contenido Markdown procesado
     */
    processTemplateVariables(content, meta = {}) {
        let processedContent = content;

        // Normalizar projectPath para reemplazo de variables
        const projectPath = (!meta.projectPath || meta.projectPath === '.')
            ? './'
            : meta.projectPath;

        // Array de variables de plantilla y sus valores correspondientes
        const templateVariables = [
            { value: meta?.detectedVersion, replace: 'detectedVersion' },
            { value: meta?.versionRange, replace: 'versionRange' },
            { value: projectPath, replace: 'projectPath' },
            { value: meta?.stack, replace: 'stack' }
        ];

        // Iterar sobre el array y reemplazar los placeholders con sus valores
        templateVariables.forEach(({ value, replace }) => {
            if (value) {
                const regex = new RegExp(`\\{${replace}\\}`, 'g');
                processedContent = processedContent.replace(regex, value);
                this.debugLog(`Reemplazado {${replace}} con ${value}`);
            }
        });

        return processedContent;
    }

    /**
     * Convierte markdown a markdown con front matter
     * @param {string} src - Ruta archivo fuente
     * @param {string} destFile - Ruta archivo destino
     * @param {Object} meta - Metadata para front matter
     * @param {Object} config - Configuración del kit
     */
    wrapMdToMdc(src, destFile, meta = {}, config = {}) {
        const md = this.readFile(src);

        // Obtener el nombre del archivo sin ruta
        const fileName = path.basename(src);

        // Obtener la estructura de directorios para identificar si es una regla global o específica de stack
        const srcRelPath = src.replace(/\\/g, '/');
        const isGlobal = srcRelPath.includes('/global/');
        const stack = meta.stack || (srcRelPath.includes('/stacks/') ? srcRelPath.split('/stacks/')[1].split('/')[0] : null);

        this.debugLog(`Procesando archivo ${isGlobal ? 'global' : 'específico de stack'}: ${fileName}`);

        // Inicializar frontmatter con meta existente
        const frontMatter = { ...meta };

        // Eliminar propiedad debug de frontMatter si existe
        delete frontMatter.debug;

        // Normalizar projectPath para reemplazos glob
        const projectPathPrefix = (frontMatter.projectPath === '.' || frontMatter.projectPath === '')
            ? ''
            : frontMatter.projectPath + '/';

        // Asegurar que projectPath está correctamente establecido para reemplazo de plantillas
        if (!frontMatter.projectPath || frontMatter.projectPath === '.') {
            frontMatter.projectPath = './';
        }

        // Verificar reglas globales "always" independientemente de ubicación
        if (config.global?.always && config.global.always.includes(fileName)) {
            frontMatter.alwaysApply = true;
            this.debugLog(`Aplicado 'alwaysApply: true' a regla de la lista global.always: ${fileName}`);
        }

        // Añadir información de globs
        if (isGlobal) {
            // Para reglas globales
            frontMatter.globs = "**/*"; // Por defecto a todos los archivos

            // Verificar si este archivo está en la lista "always"
            if (config.global?.always && config.global.always.includes(fileName)) {
                frontMatter.alwaysApply = true;
                this.debugLog(`Aplicado 'alwaysApply: true' a regla global: ${fileName}`);
            } else {
                frontMatter.alwaysApply = false;
                this.debugLog(`Aplicado 'alwaysApply: false' a regla global: ${fileName}`);
            }
        } else if (stack && config[stack]) {
            this.debugLog(`Procesando regla específica para ${stack}: ${fileName}`);

            // Para reglas específicas de stack
            if (config[stack].globs) {
                // Reemplazar <root> con ruta de proyecto actual
                const processedGlobs = config[stack].globs.map(glob =>
                    glob.replace(/<root>\//g, projectPathPrefix)
                );
                frontMatter.globs = processedGlobs.join(',');
                this.debugLog(`Aplicado globs por defecto para ${stack}: ${frontMatter.globs}`);
            }

            // Verificar reglas de patrón para ver si este archivo tiene globs específicos
            if (config[stack].pattern_rules) {
                for (const [pattern, rules] of Object.entries(config[stack].pattern_rules)) {
                    // Convertir a array si no lo es ya
                    const rulesList = Array.isArray(rules) ? rules : [rules];

                    // Comprobar si esta regla está en la lista
                    for (const rule of rulesList) {
                        const ruleParts = rule.split('/');
                        const ruleFileName = ruleParts[ruleParts.length - 1];

                        if (ruleFileName === fileName) {
                            // Reemplazar <root> con ruta de proyecto actual en el patrón
                            const processedPattern = pattern.replace(/<root>\//g, projectPathPrefix);
                            frontMatter.globs = processedPattern;
                            this.debugLog(`Aplicado globs específicos de patrón: ${processedPattern} para regla: ${fileName}`);
                            break;
                        }
                    }
                }
            }

            // Verificar reglas específicas de arquitectura
            const archMatch = srcRelPath.match(/\/architectures\/([^/]+)\//);
            if (archMatch && archMatch[1] && config[stack].architectures?.[archMatch[1]]) {
                const arch = archMatch[1];
                this.debugLog(`Procesando regla específica de arquitectura para ${stack}/${arch}: ${fileName}`);

                // Añadir globs específicos de arquitectura
                if (config[stack].architectures[arch].globs) {
                    // Reemplazar <root> con ruta de proyecto actual
                    const processedGlobs = config[stack].architectures[arch].globs.map(glob =>
                        glob.replace(/<root>\//g, projectPathPrefix)
                    );
                    frontMatter.globs = processedGlobs.join(',');
                    this.debugLog(`Aplicado globs de arquitectura para ${arch}: ${frontMatter.globs}`);
                }

                // Verificar reglas de patrón específicas de arquitectura
                if (config[stack].architectures[arch].pattern_rules) {
                    for (const [pattern, rules] of Object.entries(config[stack].architectures[arch].pattern_rules)) {
                        const rulesList = Array.isArray(rules) ? rules : [rules];
                        for (const rule of rulesList) {
                            const ruleParts = rule.split('/');
                            const ruleFileName = ruleParts[ruleParts.length - 1];

                            if (ruleFileName === fileName) {
                                // Reemplazar <root> con ruta de proyecto actual en el patrón
                                const processedPattern = pattern.replace(/<root>\//g, projectPathPrefix);
                                frontMatter.globs = processedPattern;
                                this.debugLog(`Aplicado globs específicos de patrón de arquitectura: ${processedPattern} para regla: ${fileName}`);
                                break;
                            }
                        }
                    }
                }
            }
        }

        // Procesar todos los placeholders de plantilla en contenido markdown
        const processedMd = this.processTemplateVariables(md, frontMatter);

        this.writeFile(destFile, this.addFrontMatter(processedMd, frontMatter));
        this.debugLog(`Creado: ${destFile} con frontmatter [globs: ${frontMatter.globs}, alwaysApply: ${frontMatter.alwaysApply || false}]`);
    }

    /**
     * Copia grupo de reglas - usado principalmente para duplicar documentación
     * @param {string} tmplDir - Directorio de plantillas
     * @param {string} destDir - Directorio de destino
     * @param {Object} meta - Metadata para front matter
     * @param {Object} config - Configuración del kit
     */
    copyRuleGroup(tmplDir, destDir, meta = {}, config = {}) {
        if (!this.directoryExists(tmplDir)) {
            this.debugLog(`Directorio de plantillas no existe: ${tmplDir}`);
            return;
        }

        const files = this.getFilesInDirectory(tmplDir);
        this.debugLog(`Copiando ${files.length} archivos de ${tmplDir} a ${destDir}`);

        files.forEach(f => {
            const srcFile = path.join(tmplDir, f);
            const destFile = path.join(destDir, f);

            // Para duplicación de documentación, queremos preservar la extensión de archivo original
            if (destDir.includes('docs/')) {
                // Leer el archivo fuente, procesar variables y escribir al destino
                const content = this.readFile(srcFile);
                const processedContent = this.processTemplateVariables(content, meta);
                this.writeFile(destFile, processedContent);
                this.debugLog(`Creado documento espejo: ${destFile}`);
            } else {
                // Esto no debería usarse normalmente para reglas pero se mantiene por compatibilidad
                const mdcFile = path.join(destDir, f.replace(/\.md$/, '.mdc'));
                this.wrapMdToMdc(srcFile, mdcFile, meta, config);
            }
        });

        this.debugLog(`Copiados ${files.length} archivos a ${destDir}`);
    }
} 