import { AnonymousCredential, RemoteMongoClient, RemoteMongoCollection, Stitch } from "mongodb-stitch-browser-sdk";
import { Pair } from "./schema";

export default class Database {
  static async get(): Promise<RemoteMongoCollection<Pair>> {
    try {
      const client = Stitch.initializeAppClient('synonymous-bzosg');
      const db = client.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas').db('synonymous');
      await client.auth.loginWithCredential(new AnonymousCredential());
      return db.collection<Pair>('pairs');
    } catch (e) {
      console.error(e);
    }
  }

  static clear() {
    Stitch.clearApps();
  }
}
