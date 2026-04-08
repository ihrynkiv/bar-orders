import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const ORDERS_COLLECTION = 'orders';

// Add new order
export const addOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Subscribe to orders (real-time)
export const subscribeToOrders = (callback, statusFilter = null) => {
  let q = query(
    collection(db, ORDERS_COLLECTION), 
    orderBy('createdAt', 'asc')
  );
  
  if (statusFilter) {
    q = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'asc')
    );
  }

  return onSnapshot(q, callback);
};

// Subscribe to all active orders for barista/TV
export const subscribeToActiveOrders = (callback) => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('status', 'in', ['new', 'in_progress', 'ready']),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, callback);
};