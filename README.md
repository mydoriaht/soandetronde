# soandetronde

Sinh đề kiểm tra "thay số" từ một đề gốc: mỗi học sinh nhận một tờ có cùng bố cục nhưng khác số liệu và khác vị trí đáp án đúng. Mọi đáp án đều do code tính, không do AI đoán.

Đề mẫu hiện tại: **Bài KTTX số 1 – Toán 11 (hàm số lượng giác)**, 6 câu, 15 phút.

## Cách chạy

```bash
npm install          # cài thư viện docx
npm run tao-de       # sinh đề vào thư mục output/
npm run kiem-tra     # kiểm tra độc lập (Python 3, không cần thư viện ngoài)
npm test             # chạy cả hai
```

Kết quả trong `output/`:

| File | Dùng để |
|---|---|
| `De_KTTX1_Toan11_50_phieu.docx` | In và phát cho học sinh (mỗi tờ một trang) |
| `Dap_an_theo_so_phieu.docx` | Bảng đáp án cho giáo viên, tra theo "Số phiếu" |
| `du_lieu_kiem_tra.json` | Dữ liệu thô cho `kiem_tra.py`, không cần gửi giáo viên |

## Cách chống hỏi bài

- Học sinh chỉ thấy 2 nhãn **ĐỀ 1** và **ĐỀ 2**, nhưng mỗi nhãn có 6 phiên bản ẩn (tổng 12). Số liệu và vị trí đáp án khác nhau giữa các phiên bản.
- Mỗi tờ có một **Số phiếu** 3 chữ số ngẫu nhiên, trông như số in thứ tự, nên học sinh không đoán được có bao nhiêu phiên bản.
- Hai tờ liền nhau luôn khác nhãn. Hai phiên bản cùng nhãn khác nhau ít nhất 3/4 câu ở phần I, và khác nhau cả mẫu Đ/S câu 5 lẫn đáp án câu 6.
- Xấp đề in sẵn đúng thứ tự, nên cứ phát lần lượt theo dãy và **không xáo xấp**.

## Tuỳ chỉnh

Sửa khối `CAU_HINH` ở đầu `tao_de.js`:

- `soPhieu`: số học sinh.
- `soPhienBanMoiDe`: số phiên bản ẩn mỗi nhãn.
- `hatGiong`: đổi số này để sinh một bộ đề mới hoàn toàn. Cùng một hạt giống thì luôn ra cùng một bộ đề.
- `truong`, `tenBai`, `thoiGian`: phần đầu trang.

## Kiểm tra độc lập

`kiem_tra.py` không tin cờ "đúng/sai" của bộ sinh đề. Nó tự tính lại từng đáp án bằng số (tính chẵn lẻ, chu kì nhỏ nhất, nghiệm trong khoảng, làm tròn), sau đó đối chiếu với bảng đáp án in ra. Nó cũng kiểm tra các ràng buộc chống hỏi bài ở trên. Chỉ in đề khi thấy dòng `KẾT QUẢ: KHÔNG CÓ LỖI`.
