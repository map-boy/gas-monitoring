import { Timestamp } from "firebase/firestore";

export type UserRole = 'admin' | 'manager' | 'worker';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  timestamp: Timestamp;
  workerId: string;
}

export interface Order {
  id: string;
  supplierName: string;
  productId: string;
  productName: string;
  quantity: number;
  totalCost: number;
  status: 'pending' | 'received';
  orderDate: Timestamp;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  purchaseHistory: string[];
}

export interface CylinderMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'sent_out' | 'returned';
  quantity: number;
  timestamp: Timestamp;
}

export interface Rental {
  id: string;
  customerName: string;
  productName: string;
  dueDate: Timestamp;
  returned: boolean;
  area: string;
}
