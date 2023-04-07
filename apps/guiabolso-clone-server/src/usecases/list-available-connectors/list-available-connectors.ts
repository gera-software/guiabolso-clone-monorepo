import { UseCase } from "@/usecases/ports";

export class ListAvailableConnectors implements UseCase {
    constructor() {

    }
    
    async perform(request: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

}