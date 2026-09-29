// de_toan11.js — Lõi sinh đề "thay số" KTTX số 1 – Toán 11 (lượng giác).
// Dùng chung cho: tao_de.js (Node), trang Trộn đề và trang Chấm điểm (trình duyệt).
//
//   • Học sinh chỉ thấy 2 nhãn: ĐỀ 1 và ĐỀ 2.
//   • Mỗi nhãn có nhiều "phiên bản ẩn": cùng bố cục, cùng thứ tự câu, chỉ khác số liệu
//     và vị trí đáp án đúng.
//   • Mỗi tờ có một "Số phiếu" ngẫu nhiên — giáo viên dùng số này để tra đáp án.
//   • Đáp án do CODE tính, không do AI đoán.
//   • Cùng hạt giống + số phiếu + số phiên bản ⇒ luôn ra đúng một bộ đề. Vì vậy chỉ cần
//     "mã chấm" (vd 20260929-50-6) là trang chấm điểm dựng lại được toàn bộ đáp án.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DeToan11 = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MAC_DINH = { hatGiong: 20260929, soPhieu: 50, soPhienBanMoiDe: 6 };
  const GIOI_HAN = { soPhieu: [1, 900], soPhienBanMoiDe: [2, 6] };
  const THONG_TIN_MAC_DINH = {
    truong: 'TRƯỜNG THPT NHƠN TRẠCH',
    tenBai: 'BÀI KIỂM TRA THƯỜNG XUYÊN SỐ 1',
    thoiGian: 'Thời gian làm bài: 15 phút',
  };

  // Thứ tự in của từng nhãn (chỉ số theo đề gốc: câu 1–4 phần I, ý a–d câu 5)
  const THU_TU = {
    1: { tn: [0, 1, 2, 3], ds: [0, 1, 2, 3], hamCau1: ['cos', 'sin', 'tan', 'cot'] },
    2: { tn: [2, 0, 3, 1], ds: [2, 0, 3, 1], hamCau1: ['tan', 'cot', 'cos', 'sin'] },
  };

  // ─────────────────────────── TIỆN ÍCH ───────────────────────────
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let rand = mulberry32(MAC_DINH.hatGiong); // đặt lại ở đầu mỗi lần taoBoDe
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const CHU = 'ABCD';

  // Phân số của π: {num, den} nghĩa là num·π/den
  function pf(num, den) {
    const g = gcd(num, den) || 1; num /= g; den /= g;
    if (den < 0) { num = -num; den = -den; }
    return { num, den };
  }
  const pfKey = (f) => `${f.num}/${f.den}`;
  function pfAst(f) {
    if (f.num === 0) return ['0'];
    const dau = f.num < 0 ? '−' : '';
    const a = Math.abs(f.num);
    const tu = a === 1 ? 'π' : `${a}π`;
    if (f.den === 1) return [dau + tu];
    const phan = { frac: [[tu], [String(f.den)]] };
    return dau ? [dau, phan] : [phan];
  }

  function astText(ast) {
    return ast.map((n) => {
      if (typeof n === 'string') return n;
      if (n.frac) return `(${astText(n.frac[0])})/(${astText(n.frac[1])})`;
      if (n.sqrt) return `√${astText(n.sqrt)}`;
      if (n.fn) return `${n.fn} ${astText(n.arg)}`;
      if (n.brace) return `{${astText(n.brace)}}`;
      return '?';
    }).join('');
  }
  const segText = (segs) => segs.map((s) => (s.m ? astText(s.m) : s.t)).join('');
  const fnX = (fn, arg = 'x') => ({ fn, arg: [arg] });
  const kx = (k) => (k === 1 ? 'x' : `${k}x`);

  // ─────────────────────── CÁC MẪU CÂU HỎI ───────────────────────
  // Câu 1 (gốc): chọn phát biểu đúng về tính chẵn lẻ. Mỗi phiên bản đổi hàm nào là "phát biểu đúng".
  const CHAN_LE_DUNG = { cos: 'chẵn', sin: 'lẻ', tan: 'lẻ', cot: 'lẻ' };
  function cau1(thuTuHam, hamDung) {
    return {
      loai: 'tn', goc: 1, bo: 2,
      de: [{ t: 'Chọn phát biểu đúng.' }],
      pa: thuTuHam.map((fn) => {
        const dung = fn === hamDung;
        const tinh = dung ? CHAN_LE_DUNG[fn] : (CHAN_LE_DUNG[fn] === 'chẵn' ? 'lẻ' : 'chẵn');
        return { segs: [{ t: 'Hàm số ' }, { m: ['y = ', fnX(fn)] }, { t: ` là hàm số ${tinh}.` }], dung, data: { fn, tinh } };
      }),
      thamSo: { hamDung },
    };
  }

  // Câu 2 (gốc, đã sửa lời dẫn): chu kì của y = cos kx
  function cau2(k) {
    const dung = pf(2, k);
    const ungVien = [pf(1, k), pf(4, k), pf(k, 1), pf(1, 2 * k), pf(2 * k, 1)];
    const nhieu = [];
    for (const f of ungVien) {
      if (pfKey(f) !== pfKey(dung) && !nhieu.some((g) => pfKey(g) === pfKey(f))) nhieu.push(f);
    }
    const chon = shuffle(nhieu.slice(0, 4)).slice(0, 3);
    const pa = shuffle([{ f: dung, dung: true }, ...chon.map((f) => ({ f, dung: false }))]);
    return {
      loai: 'tn', goc: 2, bo: 4,
      de: [{ t: 'Hàm số ' }, { m: ['y = ', fnX('cos', kx(k))] }, { t: ' tuần hoàn với chu kì là' }],
      pa: pa.map((p) => ({ segs: [{ m: ['T = ', ...pfAst(p.f)] }, { t: '.' }], dung: p.dung, data: { T: p.f } })),
      thamSo: { k },
    };
  }

  // Câu 3 (gốc): cot x = cot a°
  function cau3(a) {
    const dang = [
      { ma: 'k2pi', m: `x = ${a}° + k2π, k ∈ ℤ` },
      { ma: 'k180', m: `x = ${a}° + k180°, k ∈ ℤ` },
      { ma: 'k360', m: `x = ${a}° + k360°, k ∈ ℤ` },
      { ma: 'kpi', m: `x = ${a}° + kπ, k ∈ ℤ` },
    ];
    return {
      loai: 'tn', goc: 3, bo: 2,
      de: [{ t: 'Phương trình ' }, { m: [fnX('cot'), ' = ', fnX('cot', `${a}°`)] }, { t: ' có nghiệm là' }],
      pa: shuffle(dang).map((d) => ({ segs: [{ m: [d.m] }, { t: '.' }], dung: d.ma === 'k180', data: { a, dang: d.ma } })),
      thamSo: { a },
    };
  }

  // Câu 4 (gốc): sin x = c, −π/2 ≤ x ≤ π/2
  const GIA_TRI_SIN = [
    { ten: '1/2', ast: { frac: [['1'], ['2']] }, theta: [1, 6] },
    { ten: '√2/2', ast: { frac: [[{ sqrt: ['2'] }], ['2']] }, theta: [1, 4] },
    { ten: '√3/2', ast: { frac: [[{ sqrt: ['3'] }], ['2']] }, theta: [1, 3] },
  ];
  function cau4(gt, dau) {
    const [p, q] = gt.theta;
    const s = dau; // +1 hoặc −1
    const dung = pf(s * p, q);
    const ungVien = [pf(s * (q - p), q), pf(s * (q - 2 * p), 2 * q), pf(s, 2), pf(-s * p, q)];
    const nhieu = [];
    for (const f of ungVien) {
      if (f.num !== 0 && pfKey(f) !== pfKey(dung) && !nhieu.some((g) => pfKey(g) === pfKey(f))) nhieu.push(f);
    }
    const pa = shuffle([{ f: dung, dung: true }, ...nhieu.slice(0, 3).map((f) => ({ f, dung: false }))]);
    const cAst = s < 0 ? ['−', gt.ast] : [gt.ast];
    return {
      loai: 'tn', goc: 4, bo: 4,
      de: [{ t: 'Phương trình ' }, { m: [fnX('sin'), ' = ', ...cAst] }, { t: ' có nghiệm thoả mãn ' },
        { m: ['−', { frac: [['π'], ['2']] }, ' ≤ x ≤ ', { frac: [['π'], ['2']] }] }, { t: ' là:' }],
      pa: pa.map((x) => ({ segs: [{ m: ['x = ', ...pfAst(x.f)] }, { t: '.' }], dung: x.dung, data: { x: x.f } })),
      thamSo: { c: (s < 0 ? '−' : '') + gt.ten, cTen: gt.ten, dau: s },
    };
  }

  // Câu 5 (gốc): đúng/sai. Số liệu quyết định đúng hay sai.
  function cau5(t, m, kTan, hamC, kSin) {
    // t = [a,b,c,d] true/false mong muốn
    const n = t[0] ? m : 1;
    // Ý sai dùng số KHÔNG phải chu kì (π/2k với tan, π/k với sin), tránh tranh cãi kiểu
    // "2π vẫn là một chu kì của sin 2x" khi chấm theo định nghĩa chu kì dương nhỏ nhất.
    const Tb = t[1] ? pf(1, kTan) : pf(1, 2 * kTan);
    const Td = t[3] ? pf(2, kSin) : pf(1, kSin);
    const y = [
      { segs: [{ t: 'Hàm số ' }, { m: ['y = ', `${m}`, fnX('cos')] }, { t: ' có tập giá trị là ' }, { m: [`[−${n}; ${n}]`] }, { t: '.' }],
        dung: t[0], data: { m, n } },
      { segs: [{ t: 'Hàm số ' }, { m: ['y = ', fnX('tan', kx(kTan))] }, { t: ' là hàm số tuần hoàn có chu kì ' }, { m: ['T = ', ...pfAst(Tb)] }, { t: '.' }],
        dung: t[1], data: { k: kTan, T: Tb } },
      { segs: [{ t: 'Hàm số ' }, { m: ['y = ', fnX(hamC)] }, { t: ' có tập xác định là ' },
        { m: ['D = ℝ∖', { brace: [{ frac: [['π'], ['2']] }, ' + kπ, k ∈ ℤ'] }] }, { t: '.' }],
        dung: hamC === 'tan', data: { fn: hamC } },
      { segs: [{ t: 'Hàm số ' }, { m: ['y = ', fnX('sin', kx(kSin))] }, { t: ' là hàm số tuần hoàn có chu kì ' }, { m: ['T = ', ...pfAst(Td)] }, { t: '.' }],
        dung: t[3], data: { k: kSin, T: Td } },
    ];
    return { loai: 'ds', goc: 5, de: [{ t: 'Các mệnh đề sau đúng hay sai?' }], y, thamSo: { m, kTan, hamC, kSin } };
  }

  // Câu 6 (gốc): tan α biết cot α = p/q, 0 < α < π/2, làm tròn hàng phần chục
  function lamTron1(p, q) {
    // q/p làm tròn 1 chữ số thập phân, kiểu "5 thì lên" — tính bằng số nguyên để không lệch
    const x100 = Math.floor((q * 100) / p); // chữ số thứ 2 sau dấu phẩy
    const x10 = Math.floor(x100 / 10) + (x100 % 10 >= 5 ? 1 : 0);
    return `${Math.floor(x10 / 10)},${x10 % 10}`;
  }
  const CAP_COT = [];
  for (const p of [3, 6, 7, 9]) {
    for (let q = 1; q <= 9; q++) {
      if (q === p || gcd(p, q) !== 1) continue;
      const v = q / p;
      if (v < 0.2 || v > 3) continue;
      CAP_COT.push({ p, q, dapAn: lamTron1(p, q) });
    }
  }
  function cau6({ p, q, dapAn }) {
    return {
      loai: 'tln', goc: 6,
      de: [{ t: 'Hãy tính ' }, { m: [fnX('tan', 'α')] }, { t: ' biết rằng ' }, { m: [fnX('cot', 'α'), ' = ', { frac: [[`${p}`], [`${q}`]] }] },
        { t: ' và ' }, { m: ['0 < α < ', { frac: [['π'], ['2']] }] }, { t: '. (Kết quả được làm tròn đến hàng phần chục)' }],
      dapAn, thamSo: { p, q },
    };
  }

  // ─────────────────────── SINH PHIÊN BẢN ẨN ───────────────────────
  const MAU_DS = [];
  for (let b = 1; b < 15; b++) MAU_DS.push([0, 1, 2, 3].map((i) => !!(b & (1 << i)))); // bỏ "tất cả Đ" và "tất cả S"

  const hamming = (a, b) => [...a].filter((ch, i) => ch !== b[i]).length;

  function khoaTN(pb) {
    return THU_TU[pb.de].tn.map((i) => CHU[pb.tn[i].pa.findIndex((p) => p.dung)]).join('');
  }
  function khoaDS(pb) {
    return THU_TU[pb.de].ds.map((i) => (pb.c5.y[i].dung ? 'Đ' : 'S'));
  }

  function sinhPhienBan(n) {
    const aPool = shuffle([15, 20, 25, 35, 40, 50, 55, 65, 70, 75, 80, 85]);
    const capPool = shuffle(CAP_COT);
    // loại cặp trùng đáp án
    const cap6 = [];
    for (const c of capPool) if (!cap6.some((x) => x.dapAn === c.dapAn)) cap6.push(c);
    if (cap6.length < 2 * n) throw new Error('Không đủ cặp số khác đáp án cho câu 6');

    const tatCa = [];
    for (const de of [1, 2]) {
      const off = (de - 1) * n;
      const sinVals = shuffle(GIA_TRI_SIN.flatMap((g) => [[g, 1], [g, -1]])); // 6 giá trị khác nhau
      const kCau2 = shuffle([1, 2, 3, 4, pick([1, 2, 3, 4]), pick([1, 2, 3, 4])]);
      const mauDS = shuffle(MAU_DS).slice(0, n);
      let tot = null;
      for (let lan = 0; lan < 20000 && !tot; lan++) {
        const nhom = [];
        for (let s = 0; s < n; s++) {
          const [g, dau] = sinVals[s % sinVals.length];
          const pb = {
            de, stt: s,
            tn: [
              cau1(THU_TU[de].hamCau1, pick(['cos', 'sin', 'tan', 'cot'])),
              cau2(kCau2[s % kCau2.length]),
              cau3(aPool[off + s]),
              cau4(g, dau),
            ],
            c5: cau5(mauDS[s], pick([2, 3, 4, 5]), pick([3, 4, 5, 6]), mauDS[s][2] ? 'tan' : 'cot', pick([2, 3, 4, 5])),
            c6: cau6(cap6[off + s]),
          };
          nhom.push(pb);
        }
        const keys = nhom.map(khoaTN);
        let ok = true;
        for (let i = 0; i < n && ok; i++) for (let j = i + 1; j < n && ok; j++) if (hamming(keys[i], keys[j]) < 3) ok = false;
        if (ok) tot = nhom;
      }
      if (!tot) throw new Error('Không xếp được khoá đáp án đủ khác nhau');
      tatCa.push(...tot);
    }
    return tatCa;
  }

  function chuanHoaCauHinh(c = {}) {
    const ch = { ...MAC_DINH, ...c };
    for (const k of ['hatGiong', 'soPhieu', 'soPhienBanMoiDe']) {
      ch[k] = Number(ch[k]);
      if (!Number.isInteger(ch[k])) throw new Error(`"${k}" phải là số nguyên`);
    }
    if (ch.hatGiong < 1 || ch.hatGiong > 2147483647) throw new Error('Hạt giống phải từ 1 đến 2147483647');
    for (const [k, [lo, hi]] of Object.entries(GIOI_HAN)) {
      if (ch[k] < lo || ch[k] > hi) throw new Error(`"${k}" phải từ ${lo} đến ${hi}`);
    }
    return ch;
  }

  // Sinh toàn bộ một bộ đề. Chỉ phụ thuộc vào 3 số trong cấu hình.
  function taoBoDe(cauHinh) {
    const ch = chuanHoaCauHinh(cauHinh);
    rand = mulberry32(ch.hatGiong);
    const n = ch.soPhienBanMoiDe;
    const phienBan = sinhPhienBan(n);

    // Số phiếu: 3 chữ số, ngẫu nhiên, không trùng
    const soPhieu = shuffle(Array.from({ length: 900 }, (_, i) => i + 100)).slice(0, ch.soPhieu);

    // Thứ tự trong xấp đề: ĐỀ 1, ĐỀ 2 xen kẽ; mỗi nhãn xoay vòng qua các phiên bản ẩn
    const to = soPhieu.map((sp, i) => {
      const de = (i % 2) + 1;
      const pb = phienBan[(de - 1) * n + (Math.floor(i / 2) % n)];
      return { thuTuPhat: i + 1, soPhieu: sp, pb };
    });
    return { cauHinh: ch, maCham: taoMaCham(ch), phienBan, to };
  }

  // ─────────────────────── MÃ CHẤM & ĐÁP ÁN ───────────────────────
  const taoMaCham = (ch) => `${ch.hatGiong}-${ch.soPhieu}-${ch.soPhienBanMoiDe}`;
  function docMaCham(ma) {
    const m = String(ma).trim().match(/^(\d{1,10})\s*-\s*(\d{1,3})\s*-\s*(\d)$/);
    if (!m) throw new Error('Mã chấm có dạng hạt giống-số tờ-số phiên bản, ví dụ 20260929-50-6');
    return chuanHoaCauHinh({ hatGiong: +m[1], soPhieu: +m[2], soPhienBanMoiDe: +m[3] });
  }

  // Bảng tra: số phiếu → đáp án của tờ đó
  function bangDapAn(boDe) {
    const bang = {};
    for (const t of boDe.to) {
      bang[t.soPhieu] = {
        soPhieu: t.soPhieu, thuTuPhat: t.thuTuPhat, de: t.pb.de, phienBan: t.pb.stt,
        tn: khoaTN(t.pb).split(''), ds: khoaDS(t.pb), cau6: t.pb.c6.dapAn,
      };
    }
    return bang;
  }

  // ─────────────────────── CHẤM ĐIỂM ───────────────────────
  // Phần I: 4 câu × 1 điểm. Phần II: 4 điểm. Phần III: 2 điểm.
  // Phần II có hai cách tính:
  //   'moiY' — mỗi ý đúng 1 điểm.
  //   'bgd'  — thang lũy tiến của Bộ GD&ĐT nhân 4: đúng 1/2/3/4 ý → 0,4 / 1 / 2 / 4 điểm.
  const THANG_BGD = [0, 0.4, 1, 2, 4];
  function docSo(s) {
    const t = String(s ?? '').trim().replace(/\s+/g, '').replace(',', '.');
    if (!/^[-−]?\d*\.?\d+$/.test(t)) return null;
    return Number(t.replace('−', '-'));
  }
  function chamDiem(dapAn, traLoi, cachTinhDS = 'moiY') {
    const tn = dapAn.tn.map((d, i) => traLoi.tn?.[i] === d);
    const ds = dapAn.ds.map((d, i) => traLoi.ds?.[i] === d);
    const soDS = ds.filter(Boolean).length;
    const x = docSo(traLoi.cau6);
    const cau6 = x !== null && Math.abs(x - docSo(dapAn.cau6)) < 1e-9;
    const diemTN = tn.filter(Boolean).length;
    const diemDS = cachTinhDS === 'bgd' ? THANG_BGD[soDS] : soDS;
    const diem6 = cau6 ? 2 : 0;
    const tong = Math.round((diemTN + diemDS + diem6) * 100) / 100;
    return { tn, ds, cau6, diemTN, diemDS, diem6, tong };
  }
  const vietSo = (x) => String(Math.round(x * 100) / 100).replace('.', ',');

  // Dữ liệu thô để kiểm tra độc lập (kiem_tra.py / kiem_tra.js)
  function duLieuKiemTra(boDe) {
    return {
      cauHinh: boDe.cauHinh,
      phienBan: boDe.phienBan.map((pb) => ({
        de: pb.de, stt: pb.stt,
        tn: pb.tn.map((c) => ({ goc: c.goc, thamSo: c.thamSo, de: segText(c.de), pa: c.pa.map((p) => ({ txt: segText(p.segs), dung: p.dung, data: p.data })) })),
        c5: { thamSo: pb.c5.thamSo, y: pb.c5.y.map((y) => ({ txt: segText(y.segs), dung: y.dung, data: y.data })) },
        c6: { thamSo: pb.c6.thamSo, dapAn: pb.c6.dapAn, de: segText(pb.c6.de) },
      })),
      to: boDe.to.map((t) => ({ thuTuPhat: t.thuTuPhat, soPhieu: t.soPhieu, de: t.pb.de, stt: t.pb.stt, khoaTN: khoaTN(t.pb), khoaDS: khoaDS(t.pb).join(''), cau6: t.pb.c6.dapAn })),
      thuTu: THU_TU,
    };
  }

  // ─────────────────────── DỰNG FILE WORD ───────────────────────
  // D là thư viện docx (require('docx') trong Node, window.docx trong trình duyệt).
  function taoFileWord(D, boDe, thongTinVao = {}) {
    const TT = { ...THONG_TIN_MAC_DINH, ...thongTinVao };
    const {
      Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType,
      BorderStyle, TabStopType, Tab, HeightRule, VerticalAlign, LeaderType, TableLayoutType,
      MathRun, MathFraction, MathRadical, MathFunction, MathCurlyBrackets,
    } = D;
    const OMath = D.Math; // tránh trùng tên với Math của JavaScript

    // Cây công thức → đối tượng công thức Word (tạo mới mỗi lần để không dùng chung đối tượng)
    function mathKids(ast) {
      return ast.map((n) => {
        if (typeof n === 'string') return new MathRun(n);
        if (n.frac) return new MathFraction({ numerator: mathKids(n.frac[0]), denominator: mathKids(n.frac[1]) });
        if (n.sqrt) return new MathRadical({ children: mathKids(n.sqrt) });
        if (n.fn) return new MathFunction({ name: [new MathRun(n.fn)], children: mathKids(n.arg) });
        if (n.brace) return new MathCurlyBrackets({ children: mathKids(n.brace) });
        throw new Error('Nút công thức lạ: ' + JSON.stringify(n));
      });
    }
    const XANH = '0000FF';
    function runs(segs, base = {}) {
      return segs.map((s) => (s.m
        ? new OMath({ children: mathKids(s.m) })
        : new TextRun({ text: s.t, bold: s.b ?? base.bold, color: s.c ?? base.color, size: s.size ?? base.size })));
    }

    const A4 = { width: 11906, height: 16838 };
    const LE = 850; // 1,5 cm
    const RONG = A4.width - 2 * LE; // 10206
    const THUT = 284; // 0,5 cm
    const KHONG_VIEN = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const VIEN = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
    const vienBang = (b) => ({ top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b });

    const P = (children, o = {}) => new Paragraph({ children, spacing: { before: 0, after: o.after ?? 60 }, ...o });

    function o(text, w, opt = {}) {
      return new TableCell({
        width: { size: w, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: opt.children || [P([new TextRun({ text, bold: opt.bold })], { alignment: opt.align ?? AlignmentType.CENTER, after: 0 })],
      });
    }

    function dongPhuongAn(pa, bo) {
      const letters = pa.map((p, i) => [new TextRun({ text: `${CHU[i]}. `, bold: true, color: XANH }), ...runs(p.segs)]);
      const tabs = (step) => [1, 2, 3].map((i) => ({ type: TabStopType.LEFT, position: THUT + step * i }));
      if (bo === 4) {
        const step = Math.floor((RONG - THUT) / 4);
        const kids = [];
        letters.forEach((l, i) => { if (i) kids.push(new TextRun({ children: [new Tab()] })); kids.push(...l); });
        return [P(kids, { indent: { left: THUT }, tabStops: tabs(step) })];
      }
      const step = Math.floor((RONG - THUT) / 2);
      return [0, 2].map((i) => P([...letters[i], new TextRun({ children: [new Tab()] }), ...letters[i + 1]],
        { indent: { left: THUT }, tabStops: tabs(step).slice(0, 1) }));
    }

    const tieuDeCau = (so) => new TextRun({ text: `Câu ${so}. `, bold: true, color: XANH });

    function dungTo(pb, soPhieu) {
      const tt = THU_TU[pb.de];
      const kids = [];

      // Đầu trang
      kids.push(new Table({
        width: { size: RONG, type: WidthType.DXA }, columnWidths: [4400, RONG - 4400],
        layout: TableLayoutType.FIXED, borders: vienBang(KHONG_VIEN),
        rows: [new TableRow({ children: [
          new TableCell({ width: { size: 4400, type: WidthType.DXA }, borders: vienBang(KHONG_VIEN),
            children: [P([new TextRun({ text: TT.truong, bold: true })], { alignment: AlignmentType.CENTER, after: 0 })] }),
          new TableCell({ width: { size: RONG - 4400, type: WidthType.DXA }, borders: vienBang(KHONG_VIEN),
            children: [
              P([new TextRun({ text: TT.tenBai, bold: true })], { alignment: AlignmentType.CENTER, after: 0 }),
              P([new TextRun({ text: TT.thoiGian, bold: true })], { alignment: AlignmentType.CENTER, after: 0 }),
              P([new TextRun({ text: `ĐỀ ${pb.de}`, bold: true, size: 30 })], { alignment: AlignmentType.CENTER, after: 0 }),
            ] }),
        ] })],
      }));
      kids.push(P([new TextRun({ text: 'Họ tên học sinh:' }), new TextRun({ children: [new Tab()] })],
        { tabStops: [{ type: TabStopType.RIGHT, position: RONG, leader: LeaderType.DOT }], spacing: { before: 120, after: 60 } }));
      kids.push(P([new TextRun({ text: 'Lớp:' }), new TextRun({ children: [new Tab()] }), new TextRun({ children: [new Tab()] }),
        new TextRun({ text: `Số phiếu: ${soPhieu}`, size: 20, italics: true })],
      { tabStops: [{ type: TabStopType.LEFT, position: 6800, leader: LeaderType.DOT }, { type: TabStopType.RIGHT, position: RONG }], after: 100 }));

      // Điểm / Lời phê
      kids.push(new Table({
        width: { size: 9600, type: WidthType.DXA }, columnWidths: [1600, 8000], layout: TableLayoutType.FIXED,
        alignment: AlignmentType.CENTER, borders: vienBang(VIEN),
        rows: [
          new TableRow({ children: [o('Điểm', 1600), o('Lời phê', 8000)] }),
          new TableRow({ height: { value: 800, rule: HeightRule.ATLEAST }, children: [o('', 1600), o('', 8000)] }),
        ],
      }));

      // PHẦN I
      kids.push(P([new TextRun({ text: 'PHẦN I. ', bold: true, color: XANH }), new TextRun({ text: '(4 điểm) Trắc nghiệm 4 lựa chọn.', bold: true })],
        { spacing: { before: 200, after: 60 } }));
      const wNhan = 1500, wO = 900;
      kids.push(new Table({
        width: { size: wNhan + 4 * wO, type: WidthType.DXA }, columnWidths: [wNhan, wO, wO, wO, wO], layout: TableLayoutType.FIXED,
        borders: vienBang(VIEN), indent: { size: THUT, type: WidthType.DXA },
        rows: [
          new TableRow({ children: [o('Câu', wNhan, { bold: true }), ...[1, 2, 3, 4].map((i) => o(String(i), wO, { bold: true }))] }),
          new TableRow({ height: { value: 420, rule: HeightRule.ATLEAST }, children: [o('Chọn', wNhan, { bold: true }), ...[1, 2, 3, 4].map(() => o('', wO))] }),
        ],
      }));
      kids.push(P([], { after: 40 }));
      tt.tn.forEach((iGoc, viTri) => {
        const cau = pb.tn[iGoc];
        kids.push(P([tieuDeCau(viTri + 1), ...runs(cau.de)], { spacing: { before: 60, after: 40 } }));
        kids.push(...dongPhuongAn(cau.pa, cau.bo));
      });

      // PHẦN II
      kids.push(P([new TextRun({ text: 'PHẦN II. ', bold: true, color: XANH }), new TextRun({ text: '(4 điểm) Trắc nghiệm đúng sai.', bold: true })],
        { spacing: { before: 160, after: 60 } }));
      kids.push(P([tieuDeCau(5), ...runs(pb.c5.de)], { after: 60 }));
      const wPB = RONG - 2 * 900;
      kids.push(new Table({
        width: { size: RONG, type: WidthType.DXA }, columnWidths: [wPB, 900, 900], layout: TableLayoutType.FIXED, borders: vienBang(VIEN),
        rows: [
          new TableRow({ children: [o('Phát biểu', wPB, { bold: true, align: AlignmentType.LEFT }), o('Đúng', 900, { bold: true }), o('Sai', 900, { bold: true })] }),
          ...tt.ds.map((iGoc, j) => new TableRow({
            height: { value: 560, rule: HeightRule.ATLEAST },
            children: [
              o('', wPB, { children: [P([new TextRun(`${'abcd'[j]}) `), ...runs(pb.c5.y[iGoc].segs)], { after: 0 })] }),
              o('', 900), o('', 900),
            ],
          })),
        ],
      }));

      // PHẦN III
      kids.push(P([new TextRun({ text: 'PHẦN III. ', bold: true, color: XANH }), new TextRun({ text: '(2 điểm) Trả lời ngắn.', bold: true })],
        { spacing: { before: 240, after: 60 } }));
      kids.push(P([tieuDeCau(6), ...runs(pb.c6.de)], { after: 60 }));
      kids.push(new Table({
        width: { size: 4 * 620, type: WidthType.DXA }, columnWidths: [620, 620, 620, 620], layout: TableLayoutType.FIXED,
        alignment: AlignmentType.RIGHT, borders: vienBang(VIEN),
        rows: [new TableRow({ height: { value: 520, rule: HeightRule.EXACT }, children: [0, 1, 2, 3].map(() => o('', 620)) })],
      }));
      kids.push(P([new TextRun({ text: '--HẾT--', bold: true })], { alignment: AlignmentType.CENTER, spacing: { before: 200, after: 0 } }));
      return kids;
    }

    const TRANG = { page: { size: A4, margin: { top: 720, bottom: 720, left: LE, right: LE } } };
    const KIEU = { default: { document: { run: { font: 'Times New Roman', size: 24 } } } };

    // 1) File đề — mỗi tờ một trang, đúng thứ tự phát
    const de = new Document({
      styles: KIEU,
      sections: boDe.to.map((t) => ({ properties: TRANG, children: dungTo(t.pb, t.soPhieu) })),
    });

    // 2) File đáp án — xếp theo số phiếu tăng dần để tra nhanh
    const cot = [
      ['Số phiếu', 1100], ['Đề', 700], ['Câu 1', 800], ['Câu 2', 800], ['Câu 3', 800], ['Câu 4', 800],
      ['5a', 700], ['5b', 700], ['5c', 700], ['5d', 700], ['Câu 6', 1000],
    ];
    const tongRong = cot.reduce((s, c) => s + c[1], 0);
    const oDA = (text, w, bold, fill) => new TableCell({
      width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
      shading: fill ? { type: D.ShadingType.CLEAR, color: 'auto', fill } : undefined,
      margins: { top: 10, bottom: 10, left: 40, right: 40 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text, bold, size: 21 })] })],
    });
    const sapXep = [...boDe.to].sort((a, b) => a.soPhieu - b.soPhieu);
    const hangDA = sapXep.map((t, i) => {
      const k = khoaTN(t.pb);
      const ds = khoaDS(t.pb);
      const nen = i % 2 ? 'F2F2F2' : undefined;
      const gt = [String(t.soPhieu), String(t.pb.de), ...k, ...ds, t.pb.c6.dapAn];
      return new TableRow({ height: { value: 250, rule: HeightRule.ATLEAST }, children: gt.map((v, j) => oDA(v, cot[j][1], j === 0, nen)) });
    });
    const dapAn = new Document({
      styles: { default: { document: { run: { font: 'Times New Roman', size: 22 } } } },
      sections: [{
        properties: { page: { size: A4, margin: { top: 700, bottom: 700, left: 1000, right: 1000 } } },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: 'ĐÁP ÁN – ' + TT.tenBai + ' (TOÁN 11)', bold: true, size: 26 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: 'Tra theo "Số phiếu" in ở góc phải tờ đề. Bảng xếp theo số phiếu tăng dần. Đ = Đúng, S = Sai.', italics: true, size: 20 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: `Mã chấm: ${boDe.maCham}`, bold: true, size: 20 })] }),
          new Table({
            width: { size: tongRong, type: WidthType.DXA }, columnWidths: cot.map((c) => c[1]), layout: TableLayoutType.FIXED,
            alignment: AlignmentType.CENTER, borders: vienBang({ style: BorderStyle.SINGLE, size: 4, color: '808080' }),
            rows: [new TableRow({ tableHeader: true, children: cot.map((c) => oDA(c[0], c[1], true, 'D9E2F3')) }), ...hangDA],
          }),
          new Paragraph({ spacing: { before: 160 }, children: [new TextRun({ text: 'Lưu ý khi phát đề: xấp đề đã in sẵn đúng thứ tự (ĐỀ 1, ĐỀ 2 xen kẽ). Cứ phát lần lượt theo dãy, không xáo xấp.', italics: true, size: 20 })] }),
        ],
      }],
    });
    return { de, dapAn };
  }

  return {
    MAC_DINH, GIOI_HAN, THONG_TIN_MAC_DINH, THU_TU,
    taoBoDe, taoFileWord, bangDapAn, chamDiem, vietSo, docSo,
    taoMaCham, docMaCham, duLieuKiemTra, khoaTN, khoaDS,
  };
});
