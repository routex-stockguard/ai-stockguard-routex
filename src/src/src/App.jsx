import React, { useState } from 'react';

export default function App() {
  const [products, setProducts] = useState([
    { id: 1, name: 'สินค้า A', code: 'SKU001', qty: 25, min: 10 },
    { id: 2, name: 'สินค้า B', code: 'SKU002', qty: 8, min: 10 },
    { id: 3, name: 'สินค้า C', code: 'SKU003', qty: 50, min: 15 }
  ]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [qty, setQty] = useState('');

  const lowStock = products.filter(p => p.qty <= p.min).length;

  function addProduct(e) {
    e.preventDefault();
    if (!name.trim() || !code.trim() || qty === '') return;
    setProducts([...products, {
      id: Date.now(), name: name.trim(), code: code.trim(),
      qty: Number(qty), min: 10
    }]);
    setName('');
    setCode('');
    setQty('');
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand-mark">R</div>
        <div><h1>AI StockGuard</h1><p>RouteX | LSM11167</p></div>
      </header>
      <section className="welcome">
        <p>SMART INVENTORY MANAGEMENT</p>
        <h2>ระบบจัดการคลังสินค้าอัจฉริยะ</h2>
        <p>ตรวจสอบสินค้าและติดตามสถานะสต็อกของคุณ</p>
      </section>
      <section className="stats">
        <article className="stat"><span>สินค้าทั้งหมด</span><strong>{products.length}</strong></article>
        <article className="stat"><span>จำนวนสินค้าคงเหลือ</span><strong>{products.reduce((s,p)=>s+p.qty,0)}</strong></article>
        <article className="stat warning"><span>สินค้าใกล้หมด</span><strong>{lowStock}</strong></article>
      </section>
      <section className="panel">
        <h2>เพิ่มสินค้าใหม่</h2>
        <form onSubmit={addProduct} className="product-form">
          <input placeholder="ชื่อสินค้า" value={name} onChange={e=>setName(e.target.value)} required />
          <input placeholder="รหัสสินค้า" value={code} onChange={e=>setCode(e.target.value)} required />
          <input type="number" min="0" placeholder="จำนวนคงเหลือ" value={qty} onChange={e=>setQty(e.target.value)} required />
          <button type="submit">+ เพิ่มสินค้า</button>
        </form>
      </section>
      <section className="panel">
        <h2>รายการสินค้าในคลัง</h2>
        <div className="table-wrap"><table>
          <thead><tr><th>รหัส</th><th>ชื่อสินค้า</th><th>คงเหลือ</th><th>สถานะ</th></tr></thead>
          <tbody>{products.map(p=><tr key={p.id}>
            <td>{p.code}</td><td>{p.name}</td><td>{p.qty}</td>
            <td><span className={p.qty<=p.min?'status low':'status ok'}>{p.qty<=p.min?'ใกล้หมด':'ปกติ'}</span></td>
          </tr>)}</tbody>
        </table></div>
      </section>
      <section className="panel insight">
        <h2>AI Stock Insight</h2>
        <p>{lowStock ? 'พบสินค้าที่มีจำนวนต่ำกว่าหรือเท่ากับระดับขั้นต่ำ ควรตรวจสอบและวางแผนเติมสินค้า' : 'ระดับสินค้าทั้งหมดอยู่เหนือเกณฑ์ขั้นต่ำในขณะนี้'}</p>
        <small>การวิเคราะห์เบื้องต้นจากระดับสต็อก ไม่ใช่โมเดล AI ที่ผ่านการฝึก</small>
      </section>
      <footer>AI StockGuard © 2026 | RouteX LSM11167</footer>
    </main>
  );
}
