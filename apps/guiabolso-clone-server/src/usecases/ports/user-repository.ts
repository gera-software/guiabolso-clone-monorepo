import { UserData } from "@/usecases/ports"

export interface UserRepository {
    add(user: UserData): Promise<UserData>
    findUserByEmail(email: string): Promise<UserData | null>
    findUserById(id: string): Promise<UserData | null>
    // findAllUsers(): Promise<UserData[]>
    exists(user: UserData): Promise<boolean>

    verifyEmail(id: string): Promise<void>
    updatePassword(id: string, password: string): Promise<void>
}