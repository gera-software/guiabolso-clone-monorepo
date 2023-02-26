import { UseCase } from "@/usecases/ports";

export class ErrorThrowingUseCaseStub implements UseCase {
    async perform (request: any): Promise<void> {
      throw Error('ErrorThrowingUseCaseStub')
    }
  }