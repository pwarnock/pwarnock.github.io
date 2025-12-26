/**
 * Storage Utilities
 *
 * Helper functions for file system operations with proper error handling
 */

import fs from 'fs';
import path from 'path';

export class StorageError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Ensure directory exists, create if not
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Read JSON file with error handling
 */
export function readJSONFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch (error) {
    throw new StorageError(
      `Failed to read JSON file: ${filePath}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Write JSON file with error handling and atomic operation
 */
export function writeJSONFile<T>(
  filePath: string,
  data: T,
  options: {
    createBackup?: boolean;
    format?: boolean;
  } = {}
): void {
  const { createBackup = true, format = true } = options;

  try {
    // Ensure directory exists
    ensureDirectory(path.dirname(filePath));

    // Create backup if file exists and backup is requested
    if (createBackup && fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup`;
      fs.copyFileSync(filePath, backupPath);
    }

    // Write file
    const content = format ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    throw new StorageError(
      `Failed to write JSON file: ${filePath}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Validate JSON file against schema
 */
export function validateJSONFile<T extends Record<string, any>>(
  filePath: string,
  requiredFields: (keyof T)[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const data = readJSONFile<T>(filePath);

    if (!data) {
      errors.push('File does not exist or is empty');
      return { valid: false, errors };
    }

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${String(field)}`);
      }
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    errors.push(`Failed to validate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { valid: false, errors };
  }
}

/**
 * List files in directory with extension filter
 */
export function listFiles(
  dirPath: string,
  options: {
    extension?: string;
    absolutePath?: boolean;
  } = {}
): string[] {
  const { extension, absolutePath = false } = options;

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);

  const filtered = extension
    ? files.filter(file => file.endsWith(extension))
    : files;

  return absolutePath
    ? filtered.map(file => path.join(dirPath, file))
    : filtered;
}

/**
 * Get file stats
 */
export function getFileStats(filePath: string): {
  exists: boolean;
  size?: number;
  modified?: Date;
} {
  if (!fs.existsSync(filePath)) {
    return { exists: false };
  }

  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      modified: stats.mtime
    };
  } catch (error) {
    return { exists: false };
  }
}

/**
 * Delete file with backup
 */
export function deleteFile(filePath: string, options: { createBackup?: boolean } = {}): void {
  const { createBackup = true } = options;

  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    // Create backup before deleting
    if (createBackup) {
      const backupPath = `${filePath}.deleted-${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
    }

    // Delete file
    fs.unlinkSync(filePath);
  } catch (error) {
    throw new StorageError(
      `Failed to delete file: ${filePath}`,
      error instanceof Error ? error : undefined
    );
  }
}
