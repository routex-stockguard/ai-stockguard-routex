
import React, { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [qty, setQty] = useState('');
  const [min, setMin] = useState('5');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setMessage('ยังไม่ได้ตั้งค่า Supabase URL และ API Key');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setMessage(error.message);
      setSession(data?.session ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadProducts();
    else setProducts([]);
  }, [session]);

  async function loadProducts() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage('โหลดสินค้าไม่สำเร็จ: ' + error.message);
      return;
    }

    setProducts(data || []);
    setMessage('');
  }

  async function handleAuth(e, action) {
    e.preventDefault();
    if (!supabase) return;

    setBusy(true);
    setMessage('');

    const result = action === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (action === 'signup' && !result.data.session) {
      setMessage('สมัครสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี');
    } else {
      setMessage(action === 'signup' ? 'สมัครสมาชิกสำเร็จ' : 'เข้าสู่ระบบสำเร็จ');
    }

    setBusy(false);
  }

  async function addProduct(e) {
    e.preventDefault();

    if (!supabase || !name.trim() || !code.trim() || qty === '') return;

    setBusy(true);
    setMessage('');

    const { error } = await supabase.from('products').insert({
      name: name.trim(),
      sku: code.trim(),
      quantity: Number(qty),
      min_stock: Number(min)
    });

    if (error) {
      setMessage('เพิ่มสินค้าไม่สำเร็จ: ' + error.message);
    } else {
      setName('');
      setCode('');
      setQty('');
      setMin('5');
      setMessage('เพิ่มสินค้าสำเร็จ');
      await loadProducts();
    }

    setBusy(false);
  }

  async function logout() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setMessage(error.message);
  }

  const lowStock = products.filter(
    p => p.quantity <= p.min_stock
  ).length;

  if (loading) {
    return <main className="app"><p>กำลังโหลดระบบ...</p></main>;
  }

  if (!supabase) {
    return (
      <main className="app">
        <h1>AI StockGuard</h1>
        <p>ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase</p>
        <p>กรุณาตั้งค่า Environment Variables ก่อนใช้งาน</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="app">
        <header className="topbar">
          <div className="brand-mark">R</div>
          <div>
            <h1>AI StockGuard</h1>
            <p>RouteX | LSM11167</p>
          </div>
        </header>

        <section className="welcome">
          <p>SMART INVENTORY MANAGEMENT</p>
          <h2>เข้าสู่ระบบจัดการคลังสินค้า</h2>
          <p>กรุณาใช้อีเมลและรหัสผ่านเพื่อเข้าใช้งาน</p>
        </section>

        <section className="panel">
          <form className="product-form">
            <input
              type="email"
              placeholder="อีเมล"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength="6"
              required
            />
            <button
              disabled={busy}
              onClick={e => handleAuth(e, 'login')}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={e => handleAuth(e, 'signup')}
            >
              สมัครสมาชิก
            </button>
          </form>
          {message && <p>{message}</p>}
        </section>

        <footer>AI StockGuard © 2026 | RouteX LSM11167</footer>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand-mark">R</div>
        <div>
          <h1>AI StockGuard</h1>
          <p>RouteX | LSM11167</p>
        </div>
      </header>

      <section className="welcome">
        <p>SMART INVENTORY MANAGEMENT</p>
        <h2>ระบบจัดการคลังสินค้าอัจฉริยะ</h2>
        <p>ตรวจสอบสินค้าและติดตามสถานะสต็อกของคุณ</p>
        <button onClick={logout}>ออกจากระบบ</button>
      </section>

      <section className="stats">
        <article className="stat">
          <span>สินค้าทั้งหมด</span>
          <strong>{products.length}</strong>
        </article>
        <article className="stat">
          <span>จำนวนสินค้าคงเหลือ</span>
          <strong>{products.reduce((s, p) => s + p.quantity, 0)}</strong>
        </article>
        <article className="stat warning">
          <span>สินค้าใกล้หมด</span>
          <strong>{lowStock}</strong>
        </article>
      </section>

      <section className="panel">
        <h2>เพิ่มสินค้าใหม่</h2>
        <form onSubmit={addProduct} className="product-form">
          <input
            placeholder="ชื่อสินค้า"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            placeholder="รหัสสินค้า (SKU)"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="จำนวนคงเหลือ"
            value={qty}
            onChange={e => setQty(e.target.value)}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="จำนวนขั้นต่ำ"
            value={min}
            onChange={e => setMin(e.target.value)}
            required
          />
          <button type="submit" disabled={busy}>
            {busy ? 'กำลังบันทึก...' : '+ เพิ่มสินค้า'}
          </button>
        </form>
        {message && <p>{message}</p>}
      </section>

      <section className="panel">
        <h2>รายการสินค้าในคลัง</h2>
        <button onClick={loadProducts}>รีเฟรชข้อมูล</button>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อสินค้า</th>
                <th>คงเหลือ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <span className={
                      p.quantity <= p.min_stock ? 'status low' : 'status ok'
                    }>
                      {p.quantity <= p.min_stock ? 'ใกล้หมด' : 'ปกติ'}
                    </span>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="4">ยังไม่มีสินค้าในคลัง</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel insight">
        <h2>AI Stock Insight</h2>
        <p>
          {lowStock
            ? `พบสินค้าใกล้หมด ${lowStock} รายการ ควรตรวจสอบและวางแผนเติมสินค้า`
            : 'ระดับสินค้าทั้งหมดอยู่เหนือเกณฑ์ขั้นต่ำในขณะนี้'}
        </p>
        <small>
          การวิเคราะห์เบื้องต้นจากระดับสต็อก ยังไม่ใช่โมเดล AI ที่ผ่านการฝึก
        </small>
      </section>

      <footer>AI StockGuard © 2026 | RouteX LSM11167</footer>
    </main>
  );
}
