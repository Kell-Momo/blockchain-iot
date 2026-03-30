/**
 * logger.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Utilitaire de logs colorés pour la console.
 * Chaque message est préfixé avec le timestamp courant et un niveau de log.
 */

// Codes couleurs ANSI
const COLORS = {
  reset:   '\x1b[0m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  cyan:    '\x1b[36m',
  magenta: '\x1b[35m',
  bold:    '\x1b[1m',
};

/** Retourne l'heure courante au format HH:MM:SS */
function timestamp() {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

const logger = {
  /** Info standard (cyan) */
  info: (msg) =>
    console.log(`${COLORS.cyan}[${timestamp()}] [INFO]${COLORS.reset}  ${msg}`),

  /** Succès (vert) */
  success: (msg) =>
    console.log(`${COLORS.green}[${timestamp()}] [OK]${COLORS.reset}    ${msg}`),

  /** Avertissement (jaune) */
  warn: (msg) =>
    console.log(`${COLORS.yellow}[${timestamp()}] [WARN]${COLORS.reset}  ${msg}`),

  /** Erreur (rouge) */
  error: (msg) =>
    console.error(`${COLORS.red}[${timestamp()}] [ERROR]${COLORS.reset} ${msg}`),

  /** Payload / données brutes (magenta) */
  data: (label, value) => {
    const display = typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : value;
    console.log(`${COLORS.magenta}[${timestamp()}] [DATA]${COLORS.reset}  ${label}:\n${display}`);
  },

  /** Séparateur visuel */
  separator: () =>
    console.log(`${COLORS.bold}${'─'.repeat(60)}${COLORS.reset}`),
};

module.exports = logger;
