/**
 * Config Service para Agent Rules Kit
 * Gestiona la configuración y carga de settings
 */
import fs from 'fs-extra';
import path from 'path';
import { BaseService } from './base-service.js';

/**
 * Servicio para manejar la configuración del kit
 */
export class ConfigService extends BaseService {
    constructor(options = {}) {
        super(options);
        this.templatesDir = options.templatesDir;
        this.configCache = null;
    }

    /**
     * Carga configuración del kit desde templates/config.json
     * @param {string} templatesDir - Directorio de plantillas opcional
     * @returns {Object} Configuración cargada o configuración por defecto
     */
    loadKitConfig(templatesDir = this.templatesDir) {
        // Si ya tenemos configuración cacheada, devolverla
        if (this.configCache) {
            return this.configCache;
        }

        try {
            const configPath = path.join(templatesDir, 'config.json');
            this.debugLog(`Cargando configuración desde: ${configPath}`);

            if (!fs.existsSync(configPath)) {
                this.debugLog('Archivo de configuración no encontrado, usando configuración por defecto');
                return this.getDefaultConfig();
            }

            const configText = fs.readFileSync(configPath, 'utf8');
            this.configCache = JSON.parse(configText);
            return this.configCache;
        } catch (err) {
            console.error(`Error cargando configuración del kit: ${err}`);
            return this.getDefaultConfig();
        }
    }

    /**
     * Obtiene la configuración por defecto cuando no se puede cargar el config.json
     * @returns {Object} Configuración por defecto
     */
    getDefaultConfig() {
        this.debugLog('Devolviendo configuración por defecto');
        return {
            global: {
                always: ["README.md", "CONTRIBUTING.md"]
            },
            laravel: {
                globs: ["<root>/app/**/*.php", "<root>/routes/**/*.php", "<root>/config/**/*.php"],
                pattern_rules: {
                    "<root>/app/Http/Controllers/**/*.php": ["controllers/controller-methods.md"],
                    "<root>/app/Models/**/*.php": ["models/eloquent-best-practices.md"],
                    "<root>/routes/**/*.php": ["routes/route-organization.md"]
                }
            },
            nextjs: {
                globs: ["<root>/app/**/*.{js,jsx,ts,tsx}", "<root>/pages/**/*.{js,jsx,ts,tsx}", "<root>/src/**/*.{js,jsx,ts,tsx}"],
                pattern_rules: {
                    "<root>/app/**/*.{js,jsx,ts,tsx}": ["app-dir/route-handlers.md"],
                    "<root>/pages/api/**/*.{js,jsx,ts,tsx}": ["pages/api-routes.md"]
                }
            },
            react: {
                globs: ["<root>/src/**/*.{js,jsx,ts,tsx}"]
            }
        };
    }

    /**
     * Guarda la configuración del kit
     * @param {Object} config - La configuración a guardar
     * @param {string} templatesDir - Directorio de plantillas opcional
     * @returns {boolean} - true si la guardado fue exitoso, false si no
     */
    saveKitConfig(config, templatesDir = this.templatesDir) {
        try {
            const configPath = path.join(templatesDir, 'config.json');
            this.debugLog(`Guardando configuración en: ${configPath}`);

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
            this.configCache = config;
            return true;
        } catch (err) {
            console.error(`Error guardando configuración del kit: ${err}`);
            return false;
        }
    }
} 