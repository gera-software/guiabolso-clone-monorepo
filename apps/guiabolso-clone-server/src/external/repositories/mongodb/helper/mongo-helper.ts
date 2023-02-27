import { MongoClient, Collection } from 'mongodb'

export const MongoHelper = {
  client: null as unknown as MongoClient,

  async connect (uri: string): Promise<void> {
    this.client = await MongoClient.connect(uri)
  },

  async disconnect (): Promise<void> {
    // setTimeout(() => {
    //     this.client.close()
    // }, 1500)
    await this.client.close()
  },

  getCollection (name: string): Collection {
    return this.client.db().collection(name)
  },

  async clearCollection (name: string): Promise<void> {
    this.client.db().collection(name).deleteMany({})
  }
}