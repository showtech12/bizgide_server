const DB_NAME = "bizgidedbz_offline_db";
const DB_VERSION = 1;
const STORE_NAME = "transactionQueue";

let dbPromise = null;

/**
 * Open IndexedDB
 */
const openDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });

        store.createIndex("status", "status", {
          unique: false,
        });

        store.createIndex("client_id", "client_id", {
          unique: false,
        });

        store.createIndex("sequence_no", "sequence_no", {
          unique: false,
        });

        store.createIndex("idempotency_key", "idempotency_key", {
          unique: true,
        });

        store.createIndex("created_at", "created_at", {
          unique: false,
        });
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };

      resolve(db);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
};

/**
 * Get next sequence number for a client
 */
const getNextSequenceNo = async (client_id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");

    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("client_id");

    const request = index.getAll(client_id);

    request.onsuccess = () => {
      const records = request.result;

      if (!records.length) {
        resolve(1);
        return;
      }

      const maxSequence = Math.max(
        ...records.map((item) => Number(item.sequence_no) || 0),
      );

      resolve(maxSequence + 1);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Add transaction to offline queue
 */
const addToTransactionQueue = async (payload, client_id) => {
  const db = await openDB();

  const sequence_no = await getNextSequenceNo(client_id);

  const idempotency_key = crypto.randomUUID();

  const queueData = {
    client_id,
    sequence_no,
    idempotency_key,

    created_at: new Date().toISOString(),

    payload,

    status: "PENDING",
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.add(queueData);

    request.onsuccess = () => {
      resolve({
        id: request.result,
        ...queueData,
      });
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Get all pending transactions
 */
const getPendingTransactions = async (client_id = null) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      let records = request.result.filter((item) => item.status === "PENDING");

      if (client_id !== null) {
        records = records.filter(
          (item) => Number(item.client_id) === Number(client_id),
        );
      }

      // Oldest transaction first
      records.sort((a, b) => Number(a.sequence_no) - Number(b.sequence_no));

      resolve(records);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Get a single queue item
 */
const getQueueItem = async (id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Update queue status
 */
const updateQueueStatus = async (id, status) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(id);

    request.onsuccess = () => {
      const item = request.result;

      if (!item) {
        reject(new Error(`Queue item ${id} not found`));
        return;
      }

      item.status = status;

      const updateRequest = store.put(item);

      updateRequest.onsuccess = () => {
        resolve(item);
      };

      updateRequest.onerror = () => {
        reject(updateRequest.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Delete successfully synchronized item
 */
const deleteQueueItem = async (id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Get queue count
 */
const getQueueCount = async (client_id = null) => {
  const records = await getPendingTransactions(client_id);

  return records.length;
};

export {
  openDB,
  addToTransactionQueue,
  getPendingTransactions,
  getQueueItem,
  updateQueueStatus,
  deleteQueueItem,
  getQueueCount,
};
