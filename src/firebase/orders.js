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
  const q = query(
    collection(db, ORDERS_COLLECTION), 
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    try {
      if (statusFilter) {
        // Client-side filtering to avoid index requirements
        const filteredDocs = snapshot.docs.filter(doc => doc.data().status === statusFilter);
        
        // Create a snapshot-like object with proper forEach method
        const filteredSnapshot = {
          docs: filteredDocs,
          size: filteredDocs.length,
          empty: filteredDocs.length === 0,
          forEach: (fn) => filteredDocs.forEach(fn),
          metadata: snapshot.metadata || {}
        };
        
        callback(filteredSnapshot);
      } else {
        callback(snapshot);
      }
    } catch (error) {
      console.error('Error in subscribeToOrders:', error);
      // Return empty snapshot-like object on error
      callback({
        docs: [],
        size: 0,
        empty: true,
        forEach: (fn) => [],
        metadata: {}
      });
    }
  });
};

// Subscribe to all active orders for barista/TV - simplified to avoid index requirements
export const subscribeToActiveOrders = (callback) => {
  // Simple query without compound where+orderBy to avoid index requirements
  const q = query(
    collection(db, ORDERS_COLLECTION),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    try {
      // Filter in client-side to avoid Firestore index requirements
      const filteredDocs = snapshot.docs.filter(doc => {
        const status = doc.data().status;
        return ['new', 'in_progress', 'ready'].includes(status);
      });
      
      // Create a snapshot-like object with proper forEach method
      const filteredSnapshot = {
        docs: filteredDocs,
        size: filteredDocs.length,
        empty: filteredDocs.length === 0,
        forEach: (fn) => filteredDocs.forEach(fn),
        metadata: snapshot.metadata || {}
      };
      
      callback(filteredSnapshot);
    } catch (error) {
      console.error('Error in subscribeToActiveOrders:', error);
      // Return empty snapshot-like object on error
      callback({
        docs: [],
        size: 0,
        empty: true,
        forEach: (fn) => [],
        metadata: {}
      });
    }
  });
};