import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage utility that provides a synchronous-looking API compatible with MMKV
 * but uses AsyncStorage under the hood for Expo compatibility.
 *
 * Uses an in-memory cache for synchronous reads.
 * All writes are async but we don't wait for them (fire-and-forget).
 */
class Storage {
  private cache: Map<string, string> = new Map();
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Start loading cached values immediately
    this.initPromise = this.loadAll();
  }

  private async loadAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (keys.length > 0) {
        const pairs = await AsyncStorage.multiGet(keys);
        pairs.forEach(([key, value]) => {
          if (value !== null) {
            this.cache.set(key, value);
          }
        });
      }
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to load storage:', error);
      this.initialized = true;
    }
  }

  /**
   * Wait for storage to be initialized (call this early in app lifecycle)
   */
  async waitForInit(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Get a string value (synchronous from cache)
   */
  getString(key: string): string | undefined {
    return this.cache.get(key) ?? undefined;
  }

  /**
   * Get a boolean value
   */
  getBoolean(key: string): boolean | undefined {
    const value = this.cache.get(key);
    if (value === undefined) return undefined;
    return value === 'true';
  }

  /**
   * Get a number value
   */
  getNumber(key: string): number | undefined {
    const value = this.cache.get(key);
    if (value === undefined) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }

  /**
   * Set a value (updates cache immediately, persists async)
   */
  set(key: string, value: string | boolean | number): void {
    const stringValue = String(value);
    this.cache.set(key, stringValue);
    // Fire-and-forget async persistence
    AsyncStorage.setItem(key, stringValue).catch((error) => {
      console.warn(`Failed to persist ${key}:`, error);
    });
  }

  /**
   * Delete a value
   */
  delete(key: string): void {
    this.cache.delete(key);
    AsyncStorage.removeItem(key).catch((error) => {
      console.warn(`Failed to delete ${key}:`, error);
    });
  }

  /**
   * Check if a key exists
   */
  contains(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get all keys
   */
  getAllKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Clear all storage
   */
  clearAll(): void {
    this.cache.clear();
    AsyncStorage.clear().catch((error) => {
      console.warn('Failed to clear storage:', error);
    });
  }
}

// Export a singleton instance
export const storage = new Storage();

// Also export the class for testing or multiple instances
export { Storage };
