# trollde

**Trollde** sinh đề kiểm tra "thay số" từ một đề gốc: mỗi học sinh nhận một tờ có cùng bố cục nhưng khác số liệu và khác vị trí đáp án đúng. Mọi đáp án đều do code tính, không do AI đoán.

Đề mẫu hiện tại: **Bài KTTX số 1 – Toán 11 (hàm số lượng giác)**, 6 câu, 15 phút.

## Hai trang web

- **Trollde Trộn Đề** (`web/tron-de.html`): nhập tên trường, số học sinh, số phiên bản và hạt giống, rồi bấm **Trộn đề**. Trang tự kiểm tra lại toàn bộ đáp án và chỉ cho tải file khi không có lỗi. Sau đó tải file đề và bảng đáp án dạng Word để gửi đi in. Trang cũng hiện **mã chấm**, ví dụ `20260929-50-6`.
- **Trollde Chấm Điểm** (`web/cham-diem.html`): dùng trên điện thoại. Nhập mã chấm một lần, sau đó với mỗi bài: gõ số phiếu, chạm đáp án học sinh chọn, bấm **Lưu điểm**. Điểm hiện ngay, bảng điểm xuất được ra file `.csv` để mở bằng Excel.

Hai trang không cần gửi dữ liệu cho nhau: bộ đề chỉ phụ thuộc vào ba số trong mã chấm, nên trang chấm tự dựng lại đúng bảng đáp án. Cả hai trang dùng chung lõi `web/lib/de_toan11.js`. Bộ kiểm tra độc lập của trang web nằm trong `web/lib/kiem_tra.js`.

Phần II có hai cách tính, chọn ở cuối trang chấm: mỗi ý đúng 1 điểm (mặc định), hoặc thang lũy tiến của Bộ GD&ĐT nhân 4 (đúng 1/2/3/4 ý được 0,4 / 1 / 2 / 4 điểm).

## Cách chạy

```bash
npm install          # cài thư viện docx
npm run tao-de       # sinh đề vào thư mục output/
npm run kiem-tra     # kiểm tra độc lập (Python 3, không cần thư viện ngoài)
npm test             # sinh đề + kiem_tra.py + test/chay_thu.js
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
