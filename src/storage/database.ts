/**
 * IndexedDB database holding the learning progress (via the `idb` wrapper).
 *
 * Schema changes: bump DATABASE_VERSION and add an `if (oldVersion < N)` block to `upgrade`.
 * Never change existing blocks; users may upgrade from any older version.
 */
import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { CardProgress, Direction, ReviewRecord } from "../domain/scheduling";

export const DATABASE_NAME = "bks-learning";
const DATABASE_VERSION = 1;

export interface LearningDatabaseSchema extends DBSchema {
  /** Current FSRS state per card, keyed by `[wordId, direction]`. */
  progress: {
    key: [string, Direction];
    value: CardProgress;
  };
  /** Append-only history of all answers. */
  reviews: {
    key: number;
    value: ReviewRecord;
  };
}

export type LearningDatabase = IDBPDatabase<LearningDatabaseSchema>;

export function openLearningDatabase(name: string = DATABASE_NAME): Promise<LearningDatabase> {
  return openDB<LearningDatabaseSchema>(name, DATABASE_VERSION, {
    upgrade(database, oldVersion) {
      if (oldVersion < 1) {
        database.createObjectStore("progress", { keyPath: ["wordId", "direction"] });
        database.createObjectStore("reviews", { autoIncrement: true });
      }
    },
  });
}

let sharedDatabase: Promise<LearningDatabase> | undefined;

/** The app-wide database connection, opened on first use. */
export function getLearningDatabase(): Promise<LearningDatabase> {
  sharedDatabase ??= openLearningDatabase();
  return sharedDatabase;
}
