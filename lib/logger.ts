import * as fs from "fs";
import * as path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "error.log");
const APP_LOG_FILE = path.join(LOG_DIR, "app.log");

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function timestamp() {
  return new Date().toISOString();
}

function formatLog(
  level: string,
  context: string,
  message: string,
  meta?: Record<string, unknown>,
) {
  const base = `[${timestamp()}] [${level.toUpperCase()}] [${context}] ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    return `${base} | ${JSON.stringify(meta)}\n`;
  }
  return `${base}\n`;
}

function appendToFile(filePath: string, content: string) {
  try {
    ensureLogDir();
    fs.appendFileSync(filePath, content, "utf-8");
  } catch {
    console.error("Failed to write log:", content);
  }
}

export const logger = {
  error(context: string, message: string, meta?: Record<string, unknown>) {
    const line = formatLog("ERROR", context, message, meta);
    appendToFile(LOG_FILE, line);
    console.error(line.trim());
  },

  warn(context: string, message: string, meta?: Record<string, unknown>) {
    const line = formatLog("WARN", context, message, meta);
    appendToFile(APP_LOG_FILE, line);
    console.warn(line.trim());
  },

  info(context: string, message: string, meta?: Record<string, unknown>) {
    const line = formatLog("INFO", context, message, meta);
    appendToFile(APP_LOG_FILE, line);
    console.log(line.trim());
  },
};
