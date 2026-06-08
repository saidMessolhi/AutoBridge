import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'portal_users';
const NOTIFICATIONS_COLLECTION = 'notifications';

// Fallback initial data in case Firestore is completely empty at the very beginning
const defaultOrders = [
  { id: '1', client: 'محمد فوزي', car: 'Geely Monjaro 2024', stage: 'SHIPPED', date: '08/05/2024', phone1: '0550123456', passportNumber: '123456789' },
  { id: '2', client: 'ياسين كريم', car: 'BYD Seal Premium', stage: 'PURCHASED', date: '07/05/2024', phone1: '0660987654', passportNumber: '987654321' },
];

const defaultUsers = [
  { id: 'u-1', username: 'admin@autobridge.dz', password: 'PASSWORD123', role: 'المدير العام', name: 'أحمد بن علي', email: 'admin@autobridge.dz', status: 'نشط', lastActive: 'الآن', joinDate: '2024-05-01' },
  { id: 'u-2', username: 'china@autobridge.dz', password: 'PASSWORD123', role: 'مسؤول الصين', name: 'Zhi Chen', email: 'china@autobridge.dz', status: 'نشط', lastActive: 'قبل دقيقتين', joinDate: '2024-05-01' },
  { id: 'u-3', username: 'logistics@autobridge.dz', password: 'PASSWORD123', role: 'مسؤول اللوجستيك', name: 'سيد علي بوزيد', email: 'logistics@autobridge.dz', status: 'نشط', lastActive: 'قبل ساعة', joinDate: '2024-05-01' },
  { id: 'u-4', username: 'customs@autobridge.dz', password: 'PASSWORD123', role: 'المخلص الجمركي', name: 'عمر قدور', email: 'customs@autobridge.dz', status: 'نشط', lastActive: 'قبل ساعتين', joinDate: '2024-05-01' },
  { id: 'u-5', username: 'finance@autobridge.dz', password: 'PASSWORD123', role: 'المحاسب', name: 'ياسين بلقاسم', email: 'finance@autobridge.dz', status: 'نشط', lastActive: 'قبل يوم', joinDate: '2024-05-01' },
  { id: 'u-6', username: 'reception@autobridge.dz', password: 'PASSWORD123', role: 'عون استقبال / مسؤول ملفات', name: 'سارة بن جابر', email: 'reception@autobridge.dz', status: 'نشط', lastActive: 'قبل 4 ساعات', joinDate: '2024-05-01' },
  { id: 'u-7', username: 'client@gmail.com', password: 'PASSWORD123', role: 'زبون استيراد', name: 'محمد فوزي', email: 'client@gmail.com', orderId: '1', status: 'نشط', lastActive: 'قبل يومين', joinDate: '2024-05-01' },
  { id: 'u-8', username: 'yassine@gmail.com', password: 'PASSWORD123', role: 'زبون استيراد', name: 'ياسين كريم', email: 'yassine@gmail.com', orderId: '2', status: 'نشط', lastActive: 'قبل 3 أيام', joinDate: '2024-05-05' }
];

function getRolesConcernedWithStage(stage: string): string[] {
  const roles = ['المدير العام']; // General Manager gets all stages for oversight

  switch (stage) {
    case 'NEW_REQUEST':
    case 'UNDER_REVIEW':
      roles.push('عون استقبال / مسؤول ملفات');
      break;
    case 'SEARCHING_CAR':
    case 'CLIENT_APPROVED':
    case 'PURCHASED':
      roles.push('مسؤول الصين');
      break;
    case 'DEPOSIT_PAID':
    case 'FINAL_PAYMENT':
      roles.push('المحاسب');
      break;
    case 'INLAND_TRANSPORT':
    case 'SHIPPED':
    case 'IN_TRANSIT':
      roles.push('مسؤول اللوجستيك');
      break;
    case 'ARRIVED_PORT':
      roles.push('المخلص الجمركي', 'مسؤول اللوجستيك');
      break;
    case 'CUSTOMS_CLEARANCE':
      roles.push('المخلص الجمركي');
      break;
    case 'DELIVERED':
      roles.push('عون استقبال / مسؤول ملفات', 'المحاسب');
      break;
  }
  return roles;
}

export const dbSync = {
  /**
   * Subscribes to orders collection in Firestore in real-time.
   * If Firestore is empty, it populates it with default seeds.
   */
  subscribeToOrders(callback: (orders: any[]) => void) {
    if (!db) {
      // LocalStorage fallback
      const local = localStorage.getItem('import_orders');
      const data = local ? JSON.parse(local) : defaultOrders;
      callback(data);
      return () => {};
    }

    const colRef = collection(db, ORDERS_COLLECTION);
    return onSnapshot(colRef, async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial orders into Firestore so it's not blank
        for (const order of defaultOrders) {
          await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
        }
        return;
      }

      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Keep localStorage in sync
      localStorage.setItem('import_orders', JSON.stringify(orders));
      callback(orders);
    }, (error) => {
      console.error("Firestore onSnapshot error for orders:", error);
      // Fallback to local
      const local = localStorage.getItem('import_orders');
      callback(local ? JSON.parse(local) : defaultOrders);
    });
  },

  /**
   * Subscribes to portal_users collection in Firestore in real-time.
   */
  subscribeToPortalUsers(callback: (users: any[]) => void) {
    if (!db) {
      const local = localStorage.getItem('portal_users');
      const data = local ? JSON.parse(local) : defaultUsers;
      callback(data);
      return () => {};
    }

    const colRef = collection(db, USERS_COLLECTION);
    return onSnapshot(colRef, async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial users into Firestore
        for (const user of defaultUsers) {
          await setDoc(doc(db, USERS_COLLECTION, user.id), user);
        }
        return;
      }

      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      localStorage.setItem('portal_users', JSON.stringify(users));
      callback(users);
    }, (error) => {
      console.error("Firestore onSnapshot error for portal_users:", error);
      const local = localStorage.getItem('portal_users');
      callback(local ? JSON.parse(local) : defaultUsers);
    });
  },

  /**
   * Saves or creates a single order in Firestore and falls back to local storage
   */
  async saveOrder(order: any): Promise<void> {
    const local = localStorage.getItem('import_orders');
    const orders = local ? JSON.parse(local) : [];
    const index = orders.findIndex((o: any) => o.id === order.id);
    let isNew = index === -1;
    let oldStage = index > -1 ? orders[index].stage : null;

    if (index > -1) {
      orders[index] = order;
    } else {
      orders.unshift(order);
    }
    localStorage.setItem('import_orders', JSON.stringify(orders));

    if (db) {
      try {
        await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
      } catch (e) {
        console.error("Error writing order to Firestore:", e);
      }
    }

    // Direct notification triggers
    if (isNew) {
      this.addNotification(
        order.id,
        "تم إنشاء طلب استيراد جديد",
        `مرحباً بك، تم فتح ملف استيراد لسيارة ${order.car || ''} بنجاح.`,
        'INFO',
        {
          stage: 'NEW_REQUEST',
          stageConcernedRoles: ['المدير العام', 'عون استقبال / مسؤول ملفات']
        }
      );
    } else if (order.stage && order.stage !== oldStage) {
      this.triggerStageNotification(order.id, order.car, order.stage);
    }
  },

  /**
   * Updates fields of a single order
   */
  async updateOrder(orderId: string, updates: any): Promise<void> {
    const local = localStorage.getItem('import_orders');
    let carName = "سيارتك";
    let oldStage = null;

    if (local) {
      const orders = JSON.parse(local);
      const index = orders.findIndex((o: any) => o.id === orderId);
      if (index > -1) {
        oldStage = orders[index].stage;
        carName = orders[index].car || "السيارة";
        orders[index] = { ...orders[index], ...updates };
        localStorage.setItem('import_orders', JSON.stringify(orders));
      }
    }

    if (db) {
      try {
        await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updates);
      } catch (e) {
        console.error("Error updating order in Firestore:", e);
      }
    }

    if (updates.stage && updates.stage !== oldStage) {
      this.triggerStageNotification(orderId, carName, updates.stage);
    }
  },

  /**
   * Triggers a styled status modification notification
   */
  async triggerStageNotification(orderId: string, carName: string, stage: string) {
    const stagesMapAr: Record<string, string> = {
      'NEW_REQUEST': 'تم إرسال طلب جديد للمراجعة والتدقيق.',
      'UNDER_REVIEW': 'طلبك الآن قيد الدراسة والمراجعة التفصيلية.',
      'SEARCHING_CAR': 'بدأ لتوّه البحث عن سيارتك المطابقة للمواصفات.',
      'CLIENT_APPROVED': 'تم العثور على سيارة تلائم طلبك وتم اعتمادها.',
      'DEPOSIT_PAID': 'تم تأكيد استلام دفعة العربون (30%) بنجاح.',
      'PURCHASED': 'مبروك! تم شراء سيارتك رسمياً من المزاد بالصين.',
      'INLAND_TRANSPORT': 'السيارة الآن قيد النقل البري الداخلي باتجاه ميناء الشحن.',
      'SHIPPED': 'تم تحميل سيارتك وشحنها بنجاح في الحاوية المخصصة بالبحر.',
      'IN_TRANSIT': 'حاوية الشحن تتقدم الآن في البحر باتجاه موانئ الجزائر.',
      'ARRIVED_PORT': 'وصلت السفينة الحاملة لسيارتك بميناء مستغانم الجزائري.',
      'CUSTOMS_CLEARANCE': 'بدأت الإجراءات والترتيبات الجمركية لسيارتك للتخليص.',
      'FINAL_PAYMENT': 'فاتورة التصفية النهائية والمصاريف جاهزة بانتظار استكمال الدفع والتسليم.',
      'DELIVERED': 'تم تسليمك مفتاح سيارتك وملفها الجمركي والرقابي بنجاح تام! هنيئاً لك.',
    };

    const text = stagesMapAr[stage] || `تم تحديث حالة استيراد سيارتك إلى ${stage}.`;
    const concernedRoles = getRolesConcernedWithStage(stage);

    await this.addNotification(
      orderId,
      `تحديث في عملية الاستيراد (${carName})`,
      text,
      stage === 'DELIVERED' || stage === 'DEPOSIT_PAID' ? 'SUCCESS' : 'INFO',
      {
        stage,
        stageConcernedRoles: concernedRoles
      }
    );
  },

  /**
   * Saves or creates a portal user account
   */
  async savePortalUser(user: any): Promise<void> {
    const local = localStorage.getItem('portal_users');
    const users = local ? JSON.parse(local) : [];
    const index = users.findIndex((u: any) => u.id === user.id);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem('portal_users', JSON.stringify(users));

    if (db) {
      try {
        await setDoc(doc(db, USERS_COLLECTION, user.id), user);
      } catch (e) {
        console.error("Error saving portal user to Firestore:", e);
      }
    }
  },

  /**
   * Subscribes to real-time notifications in Firestore or fall backs safely
   */
  subscribeToNotifications(userContextOrId: any, callback: (notifications: any[]) => void) {
    // Resolve user context
    let currentUser: { role?: string; email?: string; orderId?: string | null } | null = null;
    let originalOrderId: string | null = null;

    if (userContextOrId && typeof userContextOrId === 'object') {
      currentUser = {
        role: userContextOrId.role,
        email: userContextOrId.email,
        orderId: userContextOrId.orderId
      };
      originalOrderId = userContextOrId.orderId || null;
    } else if (typeof userContextOrId === 'string' && userContextOrId) {
      currentUser = {
        role: 'زبون استيراد',
        orderId: userContextOrId
      };
      originalOrderId = userContextOrId;
    }

    const defaultVal = [
      { id: 'not-01', orderId: originalOrderId || '1', title: 'مرحباً بك في أوتو بريدج', message: 'تم فتح حسابك وتنشيط وصولك لعالم استيراد السيارات الفاخرة من الصين.', type: 'INFO', read: false, date: new Date().toLocaleDateString('ar-DZ') },
      { id: 'not-02', orderId: originalOrderId || '1', title: 'وثائق الاستيراد جاهزة للطباعة', message: 'يمكنك الآن طباعة العقود ورفع جواز السفر الملون من مركز الوثائق الموحد.', type: 'SUCCESS', read: false, date: new Date().toLocaleDateString('ar-DZ') }
    ];

    const filterFunc = (notifs: any[]) => {
      if (!currentUser) return [];

      const { role, email, orderId } = currentUser;

      return notifs.filter((n: any) => {
        // 1. For Import Clients (زبائن الاستيراد)
        if (role === 'زبون استيراد') {
          if (n.isStaffOnly || n.staffOnly) return false;
          
          const orderMatch = orderId && n.orderId === orderId;
          const emailMatch = email && (n.targetEmails?.includes(email) || n.clientEmail === email);
          return !!(orderMatch || emailMatch);
        }

        // 2. For Employees & Administration (الموظفون والإدارة العامة)
        // General Manager has full supervisor visibility
        if (role === 'المدير العام') return true;

        // Check if targeted to specific roles
        if (n.targetRoles && n.targetRoles.length > 0) {
          return n.targetRoles.includes(role);
        }

        // Check if targeted to specific emails
        if (n.targetEmails && n.targetEmails.length > 0) {
          return email && n.targetEmails.includes(email);
        }

        // Check if order-related stage matches roles who are concerned with it
        if (n.orderId) {
          if (n.stageConcernedRoles && n.stageConcernedRoles.includes(role)) {
            return true;
          }
          if (n.stage) {
            const concerned = getRolesConcernedWithStage(n.stage);
            return concerned.includes(role || '');
          }
          // Default: If order matches but has no specific role restriction, show to GMs or receptionist
          return role === 'المدير العام' || role === 'عون استقبال / مسؤول ملفات';
        }

        // Fallback for general staff announcements
        if (n.isStaffOnly || n.staffOnly) {
          return true;
        }

        return false;
      });
    };

    if (!db) {
      const local = localStorage.getItem('notifications');
      const data = local ? JSON.parse(local) : defaultVal;
      callback(filterFunc(data));
      return () => {};
    }

    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    return onSnapshot(colRef, (snapshot) => {
      if (snapshot.empty) {
        // Seed initial notifications silently
        for (const notif of defaultVal) {
          setDoc(doc(db, NOTIFICATIONS_COLLECTION, notif.id), notif).catch(e => console.error(e));
        }
        callback(filterFunc(defaultVal));
        return;
      }

      let notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      notifs.sort((a, b) => b.id.localeCompare(a.id));
      localStorage.setItem('notifications', JSON.stringify(notifs));

      callback(filterFunc(notifs));
    }, (error) => {
      console.error("Firestore onSnapshot error for notifications:", error);
      const local = localStorage.getItem('notifications');
      const data = local ? JSON.parse(local) : defaultVal;
      callback(filterFunc(data));
    });
  },

  /**
   * Adds a notification synchronously
   */
  async addNotification(orderId: string | null, title: string, message: string, type: string = 'INFO', extra: any = null) {
    const notifId = `not-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newNotif = {
      id: notifId,
      orderId,
      title,
      message,
      type,
      read: false,
      date: new Date().toLocaleDateString('ar-DZ'),
      ...(extra || {})
    };

    const localObj = localStorage.getItem('notifications');
    const existingNotifs = localObj ? JSON.parse(localObj) : [];
    existingNotifs.unshift(newNotif);
    localStorage.setItem('notifications', JSON.stringify(existingNotifs));

    if (db) {
      try {
        await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notifId), newNotif);
      } catch (e) {
        console.error("Error creating notification in Firestore:", e);
      }
    }
  },

  /**
   * Marks a notification as read
   */
  async markNotificationAsRead(id: string) {
    const localObj = localStorage.getItem('notifications');
    if (localObj) {
      const notifs = JSON.parse(localObj);
      const index = notifs.findIndex((un: any) => un.id === id);
      if (index > -1) {
        notifs[index].read = true;
        localStorage.setItem('notifications', JSON.stringify(notifs));
      }
    }

    if (db) {
      try {
        await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, id), { read: true });
      } catch (e) {
        console.error("Error updating notification in Firestore:", e);
      }
    }
  },

  /**
   * Marks all notifications of a user/client as read
   */
  async markAllNotificationsAsRead(userContextOrId: any) {
    // Resolve user context
    let currentUser: { role?: string; email?: string; orderId?: string | null } | null = null;
    let originalOrderId: string | null = null;

    if (userContextOrId && typeof userContextOrId === 'object') {
      currentUser = {
        role: userContextOrId.role,
        email: userContextOrId.email,
        orderId: userContextOrId.orderId
      };
      originalOrderId = userContextOrId.orderId || null;
    } else if (typeof userContextOrId === 'string' && userContextOrId) {
      currentUser = {
        role: 'زبون استيراد',
        orderId: userContextOrId
      };
      originalOrderId = userContextOrId;
    }

    const localObj = localStorage.getItem('notifications');
    const notifs = localObj ? JSON.parse(localObj) : [];

    const isMatch = (n: any) => {
      if (!currentUser) return !originalOrderId || n.orderId === originalOrderId;

      const { role, email, orderId } = currentUser;
      
      // Clients
      if (role === 'زبون استيراد') {
        if (n.isStaffOnly || n.staffOnly) return false;
        const orderMatch = orderId && n.orderId === orderId;
        const emailMatch = email && (n.targetEmails?.includes(email) || n.clientEmail === email);
        return !!(orderMatch || emailMatch);
      }

      // Staff (General Manager sees and marks everything, others only mark what concerns them)
      if (role === 'المدير العام') return true;

      if (n.targetRoles && n.targetRoles.length > 0) {
        return n.targetRoles.includes(role);
      }
      if (n.targetEmails && n.targetEmails.length > 0) {
        return !!(email && n.targetEmails.includes(email));
      }
      if (n.orderId) {
        if (n.stageConcernedRoles && n.stageConcernedRoles.includes(role)) return true;
        if (n.stage) {
          const concerned = getRolesConcernedWithStage(n.stage);
          return concerned.includes(role || '');
        }
        return role === 'المدير العام' || role === 'عون استقبال / مسؤول ملفات';
      }
      return !!(n.isStaffOnly || n.staffOnly);
    };

    const updated = notifs.map((n: any) => {
      if (isMatch(n)) {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem('notifications', JSON.stringify(updated));

    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, NOTIFICATIONS_COLLECTION));
        querySnapshot.forEach(async (document) => {
          const data = document.data();
          if (isMatch({ id: document.id, ...data })) {
            await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, document.id), { read: true });
          }
        });
      } catch (e) {
        console.error("Error marking all notifications read in Firestore:", e);
      }
    }
  },

  /**
   * Retrieves the current USD to DZD conversion exchange rate
   */
  getExchangeRate(): number {
    const rate = localStorage.getItem('usd_to_dzd_rate');
    return rate ? Number(rate) : 220; // Default parallel rate is 220
  },

  /**
   * Updates the current USD to DZD conversion exchange rate
   */
  async setExchangeRate(newRate: number): Promise<void> {
    localStorage.setItem('usd_to_dzd_rate', String(newRate));
    
    // Also store/update it in Firestore if db is ready, under a 'settings' collection
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'exchange'), { rate: newRate });
      } catch (e) {
        console.error("Error saving rate to Firestore Settings collection:", e);
      }
    }
  },

  /**
   * Real-time subscription to the exchange rate. 
   * Fallbacks to localStorage if offline or db not ready.
   */
  subscribeToExchangeRate(callback: (rate: number) => void) {
    const currentLocal = localStorage.getItem('usd_to_dzd_rate');
    const defaultVal = currentLocal ? Number(currentLocal) : 220;
    
    if (!db) {
      callback(defaultVal);
      return () => {};
    }

    return onSnapshot(doc(db, 'settings', 'exchange'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && typeof data.rate === 'number') {
          localStorage.setItem('usd_to_dzd_rate', String(data.rate));
          callback(data.rate);
          return;
        }
      }
      // If setting doesn't exist yet, seed it
      setDoc(doc(db, 'settings', 'exchange'), { rate: defaultVal })
        .then(() => callback(defaultVal))
        .catch(e => {
          console.error("Error seeding exchange rate setting in Firestore:", e);
          callback(defaultVal);
        });
    }, (error) => {
      console.error("Firestore onSnapshot error for settings:", error);
      callback(defaultVal);
    });
  },

  /**
   * Deletes an order
   */
  async deleteOrder(orderId: string): Promise<void> {
    const local = localStorage.getItem('import_orders');
    if (local) {
      const orders = JSON.parse(local).filter((o: any) => o.id !== orderId);
      localStorage.setItem('import_orders', JSON.stringify(orders));
    }

    if (db) {
      try {
        await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
      } catch (e) {
        console.error("Error deleting order from Firestore:", e);
      }
    }
  },

  /**
   * Manually seeds database collections instantly
   */
  async seedDatabase(): Promise<boolean> {
    if (!db) return false;
    try {
      for (const order of defaultOrders) {
        await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
      }
      for (const user of defaultUsers) {
        await setDoc(doc(db, USERS_COLLECTION, user.id), user);
      }
      return true;
    } catch (error) {
      console.error("Manual seed error:", error);
      return false;
    }
  }
};
