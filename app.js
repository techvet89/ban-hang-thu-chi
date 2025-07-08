import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

// Tạo Context
const AppContext = createContext(null);

// Modal xác nhận
const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
      <p className="text-lg font-semibold mb-4">{message}</p>
      <div className="flex justify-end space-x-3">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-md">Hủy</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-md">Xác nhận</button>
      </div>
    </div>
  </div>
);

const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const showAppMessage = (msg, duration = 3000) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      setMessage('');
    }, duration);
  };

  const showConfirmation = (msg, action) => {
    setConfirmMessage(msg);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) confirmAction();
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  useEffect(() => {
    try {
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
          setIsAuthReady(true);
        } else {
          const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch {
            await signInAnonymously(firebaseAuth);
          }
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Lỗi Firebase:", error);
      showAppMessage("Lỗi khởi tạo ứng dụng", 5000);
    }
  }, []);

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Đang tải ứng dụng...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ db, auth, userId, showAppMessage, showConfirmation }}>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-inter">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Ngô Văn Đô</h1>
            <nav>
              {['dashboard', 'products', 'orders', 'customers', 'finance', 'reports', 'ai_chat'].map((item) => (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`block w-full py-3 px-4 mb-3 rounded-lg text-left ${currentPage === item ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  {item === 'dashboard' ? 'Bảng điều khiển' :
                   item === 'products' ? 'Sản phẩm' :
                   item === 'orders' ? 'Đơn hàng' :
                   item === 'customers' ? 'Khách hàng' :
                   item === 'finance' ? 'Tài chính' :
                   item === 'reports' ? 'Báo cáo' : 'AI Chat'}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Nội dung chính */}
        <main className="flex-1 p-6 bg-gray-50">
          <header className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {{
                dashboard: 'Bảng điều khiển',
                products: 'Sản phẩm',
                orders: 'Đơn hàng',
                customers: 'Khách hàng',
                finance: 'Tài chính',
                reports: 'Báo cáo',
                ai_chat: 'AI Chat'
              }[currentPage]}
            </h2>
            <span className="text-sm text-gray-600">User ID: {userId}</span>
          </header>

          {showMessage && (
            <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow">
              {message}
            </div>
          )}

          {showConfirmModal && (
            <ConfirmationModal
              message={confirmMessage}
              onConfirm={handleConfirm}
              onCancel={handleCancelConfirm}
            />
          )}

          {currentPage === 'dashboard' && <div>Component Dashboard ở đây</div>}
          {currentPage === 'products' && <div>Component Products ở đây</div>}
          {currentPage === 'orders' && <div>Component Orders ở đây</div>}
          {currentPage === 'customers' && <div>Component Customers ở đây</div>}
          {currentPage === 'finance' && <div>Component Finance ở đây</div>}
          {currentPage === 'reports' && <div>Component Reports ở đây</div>}
          {currentPage === 'ai_chat' && <div>Component AI Chat ở đây</div>}
        </main>
      </div>
    </AppContext.Provider>
  );
};

// 👉 Gắn React App vào DOM
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
