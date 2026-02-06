import { ObjectId } from 'mongodb'

export interface Donor {
  _id?: ObjectId
  donorName: string
  wifeName: string
  createdAt: Date
}

export interface CreateDonorRequest {
  donorName: string
  wifeName: string
}

export interface DonorResponse {
  id: string
  donorName: string
  wifeName: string
  createdAt: string
}
