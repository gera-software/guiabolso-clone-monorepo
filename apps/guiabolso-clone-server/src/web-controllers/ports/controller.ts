import { HttpRequest, HttpResponse } from "@/web-controllers/ports"

export interface Controller {
    handle(request: HttpRequest): Promise<HttpResponse>
}