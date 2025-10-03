import { MongoClient, Db } from 'mongodb';

class DatabaseManager {
  private static instance: DatabaseManager;
  private client: MongoClient | null = null;
  private databases: Map<string, Db> = new Map();

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect(uri: string): Promise<void> {
    if (!this.client) {
      this.client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      await this.client.connect();
      console.log('Connected to MongoDB');
    }
  }

  getDatabase(databaseName: string): Db {
    if (!this.client) {
      throw new Error('Database client not connected');
    }

    if (!this.databases.has(databaseName)) {
      this.databases.set(databaseName, this.client.db(databaseName));
    }

    return this.databases.get(databaseName)!;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.databases.clear();
      console.log('Disconnected from MongoDB');
    }
  }

  isConnected(): boolean {
    return this.client !== null;
  }
}

export const dbManager = DatabaseManager.getInstance();
