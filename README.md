# agent‑rules‑kit

Bootstrap de reglas **Cursor** (`.mdc`) y documentación espejo (`.md`) para proyectos guiados por agentes IA.

## Uso rápido

```bash
npx agent-rules-kit               # asistente interactivo
npx agent-rules-kit --preset laravel
npx agent-rules-kit update        # diff seguro
```

¿Qué hace?

    Copia reglas base y, si corresponde, overlays de versión (Laravel 12, Next 14…).

    Pregunta si querés instalar librerías de tests que falten.

    Pregunta si instalamos hook pre‑commit (husky) que corre la suite de tests.

    Pregunta si creamos docs espejo en docs/.

    Mantiene backups y muestra diff antes de pisar nada.

Estructura generada

.cursor/rules/
├── global/
├── laravel/
└── nextjs/
docs/

### Version overlays

agent‑rules‑kit auto‑detects framework versions and copies any overlay files that
live in `templates/stacks/<stack>/v<major>/`. If your project runs Laravel 12
you will get every file from `/base/` **plus** `/v12/`, allowing the templates
to document new conventions (e.g. service‑provider registration changes). The
same mechanism is ready for Next.js 14 and future releases.

Contribuir

Las reglas en templates/kit/ obligan a actualizar README, CLI, tests y CHANGELOG al añadir plantillas nuevas.
