import { HttpResponse } from '@/web-controllers/ports'

export const created = (data: any): HttpResponse => ({
  statusCode: 201,
  body: data
})

export const ok = (data: any): HttpResponse => ({
  statusCode: 200,
  body: data
})

export const badRequest = (data: any): HttpResponse => ({
  statusCode: 400,
  body: {
    name: data.name,
    message: data.message,
  }
})

export const forbidden = (data: any): HttpResponse => ({
  statusCode: 403,
  body: {
    name: data.name,
    message: data.message,
  }
})

export const serverError = (data: any): HttpResponse => ({
  statusCode: 500,
  body: {
    name: 'ServerError',
    message: data.toString(),
  }
})