import * as InstitutionRepository from '../repositories/institutionRepository'
import { Institution } from "../types";


export default async function () {
    const institutions: Institution[] = await InstitutionRepository.fetchAll()

    return institutions
}