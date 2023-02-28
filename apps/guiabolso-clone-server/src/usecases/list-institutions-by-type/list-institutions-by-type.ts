import { Institution } from "@/entities";
import { InvalidTypeError } from "@/entities/errors";
import { left, right } from "@/shared";
import { InstitutionRepository, UseCase } from "@/usecases/ports";

export class ListInstitutionsByType implements UseCase {
    private readonly institutionRepo: InstitutionRepository

    constructor(institutionRepo: InstitutionRepository) {
        this.institutionRepo = institutionRepo
    }

    async perform(type: string): Promise<any> {
        if(!Institution.isInstitutionType(type)) {
            return left(new InvalidTypeError())
        }
        
        const list = await this.institutionRepo.fetchByType(type)
        return right(list)
    }

}

