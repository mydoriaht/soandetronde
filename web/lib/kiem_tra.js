// kiem_tra.js — Kiểm tra ĐỘC LẬP một bộ đề (bản JavaScript của kiem_tra.py, chạy được trên trang web).
// Tự tính lại đáp án bằng toán, không tin cờ "dung" của bộ sinh đề.
// Đầu vào: DeToan11.duLieuKiemTra(boDe). Đầu ra: { loi: [...], phienBan: [...] }.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KiemTra = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const PI = Math.PI;
  const pv = (f) => (f.num * PI) / f.den; // giá trị số của num·π/den

  function tinhChanLe(fn) {
    const f = { cos: Math.cos, sin: Math.sin, tan: Math.tan, cot: (x) => 1 / Math.tan(x) }[fn];
    const xs = [0.3, 0.7, 1.1];
    if (xs.every((x) => Math.abs(f(-x) - f(x)) < 1e-12)) return 'chẵn';
    if (xs.every((x) => Math.abs(f(-x) + f(x)) < 1e-12)) return 'lẻ';
    return 'không';
  }

  // Ứng viên chu kì: a·π/b với 1 ≤ a, b ≤ 12
  const UNG_VIEN = [];
  for (let a = 1; a <= 12; a++) for (let b = 1; b <= 12; b++) UNG_VIEN.push((a / b) * PI);
  function chuKiNhoNhat(g) {
    const xs = [0.13, 0.41, 0.77, 1.01];
    const ok = UNG_VIEN.filter((T) => xs.every((x) => Math.abs(g(x + T) - g(x)) < 1e-9));
    return ok.length ? Math.min(...ok) : null;
  }

  function phuongAnDung(c, p) {
    const dt = p.data;
    switch (c.goc) {
      case 1: return tinhChanLe(dt.fn) === dt.tinh;
      case 2: {
        const k = c.thamSo.k;
        return Math.abs(pv(dt.T) - chuKiNhoNhat((x) => Math.cos(k * x))) < 1e-9;
      }
      case 3: return dt.dang === 'k180'; // cot có chu kì 180°; các dạng còn lại trộn đơn vị hoặc sai chu kì
      case 4: {
        const s = c.thamSo.dau;
        const cval = { '1/2': 0.5, '√2/2': Math.SQRT2 / 2, '√3/2': Math.sqrt(3) / 2 }[c.thamSo.cTen] * s;
        const x = pv(dt.x);
        return Math.abs(Math.sin(x) - cval) < 1e-12 && x >= -PI / 2 - 1e-12 && x <= PI / 2 + 1e-12;
      }
      default: throw new Error('Câu gốc lạ: ' + c.goc);
    }
  }

  function yDung(y, i) {
    const dt = y.data;
    if (i === 0) return dt.n === dt.m; // tập giá trị của m cos x là [−m; m]
    if (i === 1) return Math.abs(pv(dt.T) - chuKiNhoNhat((x) => Math.tan(dt.k * x))) < 1e-9;
    if (i === 2) return dt.fn === 'tan'; // tan không xác định tại π/2 + kπ; cot không xác định tại kπ
    return Math.abs(pv(dt.T) - chuKiNhoNhat((x) => Math.sin(dt.k * x))) < 1e-9;
  }

  // Làm tròn q/p đến hàng phần chục, "5 thì lên" — tính bằng số nguyên
  function dapAnCau6(p, q) {
    const x10 = Math.floor((20 * q + p) / (2 * p)); // = round_half_up(10q/p)
    return `${Math.floor(x10 / 10)},${x10 % 10}`;
  }

  function kiemTra(d) {
    const loi = [];
    const tinh = new Map();
    for (const pb of d.phienBan) {
      const ten = `ĐỀ ${pb.de} pb${pb.stt}`;
      let khoa = '';
      for (const i of d.thuTu[pb.de].tn) {
        const c = pb.tn[i];
        const dung = c.pa.map((p) => phuongAnDung(c, p));
        const so = dung.filter(Boolean).length;
        if (so !== 1) loi.push(`${ten} câu gốc ${c.goc}: có ${so} phương án đúng`);
        c.pa.forEach((p, j) => { if (p.dung !== dung[j]) loi.push(`${ten} câu gốc ${c.goc}: cờ đúng/sai lệch ở "${p.txt}"`); });
        khoa += dung.includes(true) ? 'ABCD'[dung.indexOf(true)] : '?';
      }
      const ds = pb.c5.y.map((y, i) => yDung(y, i));
      pb.c5.y.forEach((y, i) => { if (y.dung !== ds[i]) loi.push(`${ten} câu 5 ý ${'abcd'[i]}: cờ lệch`); });
      const khoaDS = d.thuTu[pb.de].ds.map((i) => (ds[i] ? 'Đ' : 'S')).join('');
      const c6 = dapAnCau6(pb.c6.thamSo.p, pb.c6.thamSo.q);
      if (c6 !== pb.c6.dapAn) loi.push(`${ten}: câu 6 lệch ${c6} ≠ ${pb.c6.dapAn}`);
      tinh.set(`${pb.de}-${pb.stt}`, { de: pb.de, stt: pb.stt, tn: khoa, ds: khoaDS, c6 });
    }

    // Đáp án in trong file đáp án (theo từng tờ) phải khớp tính toán độc lập
    for (const t of d.to) {
      const k = tinh.get(`${t.de}-${t.stt}`);
      if (!k || k.tn !== t.khoaTN || k.ds !== t.khoaDS || k.c6 !== t.cau6) loi.push(`Số phiếu ${t.soPhieu}: đáp án in ra khác đáp án tính lại`);
    }

    // Ràng buộc chống hỏi bài
    const sp = d.to.map((t) => t.soPhieu);
    if (new Set(sp).size !== sp.length) loi.push('Số phiếu bị trùng');
    for (let i = 0; i + 1 < d.to.length; i++) if (d.to[i].de === d.to[i + 1].de) loi.push(`Tờ ${i + 1} và ${i + 2} liền nhau nhưng cùng nhãn`);
    for (let i = 0; i + 2 < d.to.length; i++) {
      if (d.to[i].de === d.to[i + 2].de && d.to[i].stt === d.to[i + 2].stt) loi.push(`Tờ ${i + 1} và ${i + 3} cách một chỗ nhưng cùng phiên bản`);
    }
    for (const de of [1, 2]) {
      const ks = [...tinh.values()].filter((k) => k.de === de);
      for (let i = 0; i < ks.length; i++) {
        for (let j = i + 1; j < ks.length; j++) {
          const a = ks[i], b = ks[j];
          const khac = [...a.tn].filter((ch, x) => ch !== b.tn[x]).length;
          if (khac < 3) loi.push(`ĐỀ ${de}: pb${a.stt} và pb${b.stt} chỉ khác ${khac} câu ở phần I`);
          if (a.ds === b.ds) loi.push(`ĐỀ ${de}: pb${a.stt} và pb${b.stt} trùng mẫu Đ/S`);
          if (a.c6 === b.c6) loi.push(`ĐỀ ${de}: pb${a.stt} và pb${b.stt} trùng đáp án câu 6`);
        }
      }
    }
    return { loi, phienBan: [...tinh.values()] };
  }

  return { kiemTra };
});
