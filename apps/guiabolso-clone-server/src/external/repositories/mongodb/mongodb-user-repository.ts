
import { UserData, UserRepository } from '@/usecases/ports'
import { ObjectId } from 'mongodb'
import { MongoHelper } from '@/external/repositories/mongodb/helper'

export type MongodbUser = {
    name: string,
    email: string,
    password: string,
    isVerified: boolean,
    _id?: ObjectId
}

export class MongodbUserRepository implements UserRepository {
    
  async add (user: UserData): Promise<UserData> {
    const userCollection = MongoHelper.getCollection('users')

    const userClone: MongodbUser = {
        name: user.name,
        email: user.email,
        password: user.password,
        isVerified: user.isVerified,
    }

    const { insertedId } = await userCollection.insertOne(userClone)

    return this.findUserById(insertedId.toString())
    
  }

  async findUserByEmail (email: string): Promise<UserData | null> {
    const userCollection = MongoHelper.getCollection('users')
    const user = await userCollection.findOne<MongodbUser>({ email: email })
    if(user) {
        return this.withApplicationId(user)
    }

    return null
  }

  async findUserById (id: string): Promise<UserData | null> {
    const userCollection = MongoHelper.getCollection('users')
    const user = await userCollection.findOne<MongodbUser>({ _id: new ObjectId(id) })
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

  async verifyEmail (id: string): Promise<void> {
    const userCollection = MongoHelper.getCollection('users')
    await userCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isVerified: true
        }
      })

  }

  private withApplicationId (dbUser: MongodbUser): UserData {
    return {
        name: dbUser.name,
        email: dbUser.email,
        password: dbUser.password,
        isVerified: dbUser.isVerified,
        id: dbUser._id.toString(),
    }
  }
}