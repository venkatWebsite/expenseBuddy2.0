import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { MongoClient } from "mongodb";

// storage interface
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
}

// in-memory fallback (keeps previous behaviour)
class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id } as unknown as User;
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }
}

// MongoDB-backed storage
class MongoStorage implements IStorage {
  private client: MongoClient;
  private ready: Promise<void>;
  private dbName: string;

  constructor(uri: string, dbName?: string) {
    this.client = new MongoClient(uri);
    this.dbName = dbName || this.extractDbNameFromUri(uri) || "expense_tracker";
    this.ready = this.client.connect().then(() => undefined);
  }

  private extractDbNameFromUri(uri: string) {
    try {
      const u = new URL(uri.replace("mongodb+srv://", "https://"));
      return u.pathname && u.pathname !== "/" ? u.pathname.slice(1) : undefined;
    } catch {
      return undefined;
    }
  }

  private collection() {
    return this.client.db(this.dbName).collection("users");
  }

  async getUser(id: string): Promise<User | undefined> {
    await this.ready;
    const doc = await this.collection().findOne({ id });
    return doc as unknown as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.ready;
    const doc = await this.collection().findOne({ username });
    return doc as unknown as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ready;
    const id = randomUUID();
    const user = { ...insertUser, id } as any;
    await this.collection().insertOne(user);
    return user as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    await this.ready;
    try {
      console.log(`[MongoStorage] Attempting to update user ${id} with:`, updates);
      
      const result = await this.collection().findOneAndUpdate(
        { id },
        { $set: updates },
        { returnDocument: "after" }
      );

      if (!result.ok || !result.value) {
        console.error(`[MongoStorage] Update failed for user ${id}: result =`, result);
        return undefined;
      }

      console.log(`[MongoStorage] Successfully updated user ${id}:`, result.value);
      return result.value as unknown as User;
    } catch (err) {
      console.error(`[MongoStorage] Error updating user ${id}:`, err);
      throw err;
    }
  }

  async getUserByProviderId(providerId: string): Promise<User | undefined> {
    await this.ready;
    const doc = await this.collection().findOne({ providerId });
    return doc as unknown as User | undefined;
  }
}

// export storage: use MongoStorage when MONGODB_URI is provided, otherwise MemStorage
let storageImpl: IStorage;
if (process.env.MONGODB_URI) {
  try {
    storageImpl = new MongoStorage(process.env.MONGODB_URI, process.env.MONGODB_DBNAME);
    console.log("Using MongoDB storage");
  } catch (err) {
    console.warn("Failed to initialize MongoDB storage, falling back to in-memory storage", err);
    storageImpl = new MemStorage();
  }
} else {
  console.warn("MONGODB_URI not set — using in-memory storage. Set MONGODB_URI to use MongoDB Atlas.");
  storageImpl = new MemStorage();
}

export const storage = storageImpl;
