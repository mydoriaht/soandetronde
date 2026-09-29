// Chạy: node test/chay_thu.js — kiểm tra lõi sinh đề, bộ kiểm tra JS và hàm chấm điểm.
const assert = require('assert');
const D = require('docx');
const DeToan11 = require('../web/lib/de_toan11');
const { kiemTra } = require('../web/lib/kiem_tra');

let so = 0;
const thu = (ten, fn) => { fn(); so++; console.log('  ✓', ten); };

// 1) Nhiều hạt giống × mọi số phiên bản: bộ kiểm tra độc lập không được báo lỗi
thu('bộ kiểm tra JS không báo lỗi trên 40 bộ đề', () => {
  for (let h = 1; h <= 8; h++) {
    for (let n = 2; n <= 6; n++) {
      const boDe = DeToan11.taoBoDe({ hatGiong: h * 7919, soPhieu: 45 + h, soPhienBanMoiDe: n });
      const kq = kiemTra(DeToan11.duLieuKiemTra(boDe));
      assert.deepStrictEqual(kq.loi, [], `hạt ${h * 7919}, ${n} phiên bản`);
      assert.strictEqual(kq.phienBan.length, 2 * n);
    }
  }
});

// 2) Cùng mã chấm ⇒ cùng đáp án (trang chấm điểm dựa vào điều này)
thu('mã chấm dựng lại đúng bảng đáp án', () => {
  const a = DeToan11.taoBoDe({ hatGiong: 20260929, soPhieu: 50, soPhienBanMoiDe: 6 });
  assert.strictEqual(a.maCham, '20260929-50-6');
  const b = DeToan11.taoBoDe(DeToan11.docMaCham(' 20260929 - 50 - 6 '));
  assert.deepStrictEqual(DeToan11.bangDapAn(a), DeToan11.bangDapAn(b));
  assert.throws(() => DeToan11.docMaCham('abc'));
  assert.throws(() => DeToan11.docMaCham('1-50-9'));
  assert.throws(() => DeToan11.taoBoDe({ soPhieu: 901 }));
});

// 3) Bộ kiểm tra bắt được đáp án sai (tự làm hỏng dữ liệu)
thu('bộ kiểm tra bắt được đáp án bị sửa sai', () => {
  const d = DeToan11.duLieuKiemTra(DeToan11.taoBoDe({}));
  d.to[3].cau6 = '9,9';
  const pa = d.phienBan[0].tn[1].pa; pa.forEach((p) => { p.dung = !p.dung; });
  const { loi } = kiemTra(d);
  assert.ok(loi.some((e) => e.includes(`Số phiếu ${d.to[3].soPhieu}`)));
  assert.ok(loi.some((e) => e.includes('cờ đúng/sai lệch')));
});

// 4) Chấm điểm
thu('chấm điểm hai cách tính phần II', () => {
  const da = { tn: ['A', 'C', 'B', 'D'], ds: ['Đ', 'S', 'S', 'Đ'], cau6: '0,4' };
  const du = DeToan11.chamDiem(da, { tn: ['A', 'C', 'B', 'D'], ds: ['Đ', 'S', 'S', 'Đ'], cau6: '0.4' });
  assert.strictEqual(du.tong, 10);
  const mot = DeToan11.chamDiem(da, { tn: ['A', 'B', null, 'D'], ds: ['Đ', 'Đ', 'S', null], cau6: ',4' });
  assert.deepStrictEqual([mot.diemTN, mot.diemDS, mot.diem6, mot.tong], [2, 2, 2, 6]);
  const bgd = DeToan11.chamDiem(da, { tn: [], ds: ['Đ', 'Đ', 'S', null], cau6: '' }, 'bgd');
  assert.deepStrictEqual([bgd.diemDS, bgd.diem6, bgd.tong], [1, 0, 1]);
  assert.strictEqual(DeToan11.chamDiem(da, { ds: ['Đ', 'S', 'S', 'S'] }, 'bgd').diemDS, 2);
  assert.strictEqual(DeToan11.chamDiem(da, { cau6: '0,40' }).cau6, true);
  assert.strictEqual(DeToan11.chamDiem(da, { cau6: '4' }).cau6, false);
  assert.strictEqual(DeToan11.vietSo(7.4), '7,4');
});

// 5) Dựng được file Word
thu('dựng file Word đề và đáp án', async () => {
  const { de, dapAn } = DeToan11.taoFileWord(D, DeToan11.taoBoDe({ soPhieu: 4, soPhienBanMoiDe: 2 }), { truong: 'THPT THỬ' });
  assert.ok(de && dapAn);
});

console.log(`${so} nhóm kiểm tra đạt.`);
