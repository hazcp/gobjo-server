import { MongoClient } from 'mongodb';

export class MongoService {
  databaseName: string;
  client: MongoClient | undefined;

  get db() {
    return this.client?.db(this.databaseName);
  }

  async connect() {
    if (!this.client || !this.client.isConnected()) {
      this.databaseName = 'gobjo';
      const dbUrl = 'mongodb://localhost:27017';
      this.client = new MongoClient(dbUrl, { useUnifiedTopology: true });
      await this.client.connect();
    }
  }

  async close() {
    await this.client?.close();
  }
}

const mongoService = new MongoService();
export default mongoService;

