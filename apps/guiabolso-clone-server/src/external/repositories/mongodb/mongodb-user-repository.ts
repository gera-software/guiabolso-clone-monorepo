
import { UserData, UserRepository } from '@/usecases/ports'
import { MongoHelper } from './helper'

export class MongodbUserRepository implements UserRepository {
  async add (user: UserData): Promise<void> {
    const userCollection = MongoHelper.getCollection('users')
    const exists = await this.exists(user)
    if (!exists) {
      const userClone: UserData = {
        name: user.name,
        email: user.email,
        password: user.password
      }
      const result = await userCollection.insertOne(userClone)
    }
  }

  async findUserByEmail (email: string): Promise<UserData | null> {
    const userCollection = MongoHelper.getCollection('users')
    const result = await userCollection.findOne<UserData>({ email: email })
    return result
  }

  async findAllUsers (): Promise<UserData[]> {
    const userCollection = MongoHelper.getCollection('users')
    return await userCollection.find<UserData>({}).toArray()
  }

  async exists (user: UserData): Promise<boolean> {
    const result = await this.findUserByEmail(user.email)
    if (result != null) {
      return true
    }
    return false
  }
}