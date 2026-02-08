import { ObjectId } from 'mongodb'

export interface Donor {
  _id?: ObjectId
  donorName: string
  fatherName?: string
  createdAt: Date
}

export interface CreateDonorRequest {
  donorName: string
  fatherName?: string
}

export interface DonorResponse {
  id: string
  donorName: string
  fatherName?: string
  createdAt: string
}
