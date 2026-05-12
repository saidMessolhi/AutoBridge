/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  CLIENT = 'CLIENT',
  RECEPTION = 'RECEPTION',
  CHINA_OFFICER = 'CHINA_OFFICER',
  ACCOUNTANT = 'ACCOUNTANT',
  LOGISTICS = 'LOGISTICS',
  CUSTOMS = 'CUSTOMS',
  ADMIN = 'ADMIN'
}

export enum ImportStage {
  NEW_REQUEST = 'NEW_REQUEST',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SEARCHING_CAR = 'SEARCHING_CAR',
  CLIENT_APPROVED = 'CLIENT_APPROVED',
  DEPOSIT_PAID = 'DEPOSIT_PAID',
  PURCHASED = 'PURCHASED',
  INLAND_TRANSPORT = 'INLAND_TRANSPORT',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED_PORT = 'ARRIVED_PORT',
  CUSTOMS_CLEARANCE = 'CUSTOMS_CLEARANCE',
  FINAL_PAYMENT = 'FINAL_PAYMENT',
  DELIVERED = 'DELIVERED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}

export interface ImportOrder {
  id: string;
  tenantId: string;
  clientId: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    budget: number;
    color?: string;
    specs?: string;
    vin?: string;
  };
  currentStage: ImportStage;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'FINAL' | 'CUSTOMS' | 'SHIPPING';
  status: 'PENDING' | 'PAID' | 'VERIFIED';
  method: string;
  receiptUrl?: string;
  createdAt: Date;
}

export interface TrackingEvent {
  id: string;
  stage: ImportStage;
  status: string;
  description: string;
  location?: string;
  timestamp: Date;
}
