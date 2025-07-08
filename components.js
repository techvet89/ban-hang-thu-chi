import React, { useState, useEffect, useContext } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { AppContext } from './app-context';

export const Dashboard = () => {
  return <div className="text-gray-700 text-lg">Chào mừng đến với hệ thống quản lý bán hàng!</div>;
};

export const Products = () => {
  const { db, userId, showAppMessage, showConfirmation } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, `artifacts/${__app_id}/users/${userId}/products`), (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [db, userId]);

  const addProduct = async () => {
    if (!name || !price) return;
    await addDoc(collection(db, `artifacts/${__app_id}/users/${userId}/products`), {
      name,
      price: parseFloat(price),
      created: new Date().toISOString(),
    });
    showAppMessage('Đã thêm sản phẩm');
    setName('');
    setPrice('');
  };

  const deleteProduct = async (id) => {
    showConfirmation('Bạn chắc chắn muốn xóa sản phẩm này?', async () => {
      await deleteDoc(doc(db, `artifacts/${__app_id}/users/${userId}/products/${id}`));
      showAppMessage('Đã xóa sản phẩm');
    });
  };

  return (
    <div>
      <div className="mb-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên sản phẩm"
          className="border p-2 mr-2 rounded" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Giá"
          className="border p-2 mr-2 rounded" type="number" />
        <button onClick={addProduct} className="bg-blue-500 text-white px-4 py-2 rounded">Thêm</button>
      </div>
      <ul>
        {products.map((p) => (
          <li key={p.id} className="mb-2 flex justify-between items-center">
            <span>{p.name} - {p.price.toLocaleString()}đ</span>
            <button onClick={() => deleteProduct(p.id)} className="text-red-500">Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Tương tự bạn có thể tạo Orders, Customers, Finance, Reports...
// Nếu bạn muốn, mình sẽ tiếp tục thêm các component đó ngay.
