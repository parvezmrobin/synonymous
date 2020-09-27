import { AnonymousCredential, RemoteMongoClient, Stitch } from "mongodb-stitch-browser-sdk";

export default class Database {
  static async get() {
    try {
      const client = Stitch.initializeAppClient('synonymous-bzosg');
      const db = client.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas').db('synonymous');
      await client.auth.loginWithCredential(new AnonymousCredential());
      return db;
    } catch (e) {
      console.error(e);
    }
  }

  static clear() {
    Stitch.clearApps();
  }
}
