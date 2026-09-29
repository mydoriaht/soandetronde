// tao_de.js — Sinh đề "thay số" từ đề gốc KTTX số 1 – Toán 11 (lượng giác), chạy bằng Node.
// Phần sinh đề nằm trong web/lib/de_toan11.js, dùng chung với trang Trộn đề và trang Chấm điểm.
//
// Chạy:  node tao_de.js            (cần thư viện docx: npm install)
// Kết quả nằm trong thư mục output/

const fs = require('fs');
const path = require('path');
const D = require('docx');
const DeToan11 = require('./web/lib/de_toan11');

// ─────────────────────────── CẤU HÌNH ───────────────────────────
const CAU_HINH = {
  soPhieu: 50,              // số học sinh (số tờ đề cần in)
  soPhienBanMoiDe: 6,       // mỗi nhãn ĐỀ 1 / ĐỀ 2 có bao nhiêu phiên bản ẩn (2–6)
  hatGiong: 20260929,       // đổi số này để ra bộ đề khác hoàn toàn
};
const THONG_TIN = {
  truong: 'TRƯỜNG THPT NHƠN TRẠCH',
  tenBai: 'BÀI KIỂM TRA THƯỜNG XUYÊN SỐ 1',
  thoiGian: 'Thời gian làm bài: 15 phút',
};
const THU_MUC_RA = path.join(__dirname, 'output');

async function main() {
  fs.mkdirSync(THU_MUC_RA, { recursive: true });
  const boDe = DeToan11.taoBoDe(CAU_HINH);
  const { de, dapAn } = DeToan11.taoFileWord(D, boDe, THONG_TIN);

  fs.writeFileSync(path.join(THU_MUC_RA, `De_KTTX1_Toan11_${boDe.to.length}_phieu.docx`), await D.Packer.toBuffer(de));
  fs.writeFileSync(path.join(THU_MUC_RA, 'Dap_an_theo_so_phieu.docx'), await D.Packer.toBuffer(dapAn));
  // Dữ liệu thô để kiểm tra độc lập (không cần gửi cho giáo viên)
  fs.writeFileSync(path.join(THU_MUC_RA, 'du_lieu_kiem_tra.json'), JSON.stringify(DeToan11.duLieuKiemTra(boDe), null, 1));

  console.log(`Đã tạo ${boDe.to.length} tờ đề từ ${boDe.phienBan.length} phiên bản ẩn (2 nhãn × ${CAU_HINH.soPhienBanMoiDe}).`);
  console.log(`Mã chấm (nhập vào trang Chấm điểm): ${boDe.maCham}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
