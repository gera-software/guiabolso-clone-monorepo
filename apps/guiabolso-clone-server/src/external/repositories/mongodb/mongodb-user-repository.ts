
import { UserData, UserRepository } from '@/usecases/ports'
import { ObjectId } from 'mongodb'
import { MongoHelper } from './helper'

export type MongodbUser = {
    name: string,
    email: string,
    password: string,
    _id: ObjectId
}

export class MongodbUserRepository implements UserRepository {
    
  async add (user: UserData): Promise<void> {
    const userCollection = MongoHelper.getCollection('users')

    const userClone: UserData = {
        name: user.name,
        email: user.email,
        password: user.password
    }
    await userCollection.insertOne(userClone)
    
  }

  async findUserByEmail (email: string): Promise<UserData | null> {
    const userCollection = MongoHelper.getCollection('users')
    const user = await userCollection.findOne<MongodbUser>({ email: email })
    if(user) {
        return this.withApplicationId(user)
    }

    return null
  }

  async exists (user: UserData): Promise<boolean> {
    const result = await this.findUserByEmail(user.email)
    if (result != null) {
      return true
    }
    return false
  }

  private withApplicationId (dbUser: MongodbUser): UserData {
    return {
        name: dbUser.name,
        email: dbUser.email,
        password: dbUser.password,
        id: dbUser._id.toString(),
    }
  }
}