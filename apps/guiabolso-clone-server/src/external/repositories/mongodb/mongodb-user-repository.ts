
import { UserData, UserRepository } from '@/usecases/ports'
import { ObjectId } from 'mongodb'
import { MongoHelper } from '@/external/repositories/mongodb/helper'

export type MongodbUser = {
    name: string,
    email: string,
    password: string,
    _id?: ObjectId
}

export class MongodbUserRepository implements UserRepository {
    
  async add (user: UserData): Promise<UserData> {
    const userCollection = MongoHelper.getCollection('users')

    const userClone: MongodbUser = {
        name: user.name,
        email: user.email,
        password: user.password
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

  private withApplicationId (dbUser: MongodbUser): UserData {
    return {
        name: dbUser.name,
        email: dbUser.email,
        password: dbUser.password,
        id: dbUser._id.toString(),
    }
  }
}