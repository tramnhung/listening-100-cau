# Kiểm thử và ghi chú

## Bổ sung Google Sheet — kiểm thử endpoint giả PASS

- [x] `assets/config.js` có đúng hai hằng số trống; được nạp trước app. Cấu hình trống: không có biểu mẫu hay nút nộp, 5 câu của set vẫn hiển thị bình thường.
- [x] Họ tên/MSSV/Lớp lưu và tự khôi phục qua tải lại; sửa thông tin được. Mọi đọc/ghi localStorage đều try/catch.
- [x] Thông báo minh bạch đúng nguyên văn cạnh ô nhập và nút nộp. Nhật ký endpoint **0 request** sau lưu thông tin và chấm bài, trước khi bấm nộp.
- [x] POST nhận đúng 9 trường, header `text/plain;charset=utf-8`, không preflight. Lượt giao diện thử 4/5 gửi `tong:5`, `dung:4`, `cauSai:"11"`.
- [x] Lỗi HTTP 503 hiện Gửi hỏng + Thử lại; tải lại vẫn giữ kết quả/thông tin; bấm Thử lại nhận `{ok:true}` và báo Gửi xong.
- [x] `{ok:false,error:"sai ma lop"}` không coi là thành công và không fallback; kiểm bằng test Node với endpoint HTTP thật cục bộ.
- [x] CORS bị chặn thật trong trình duyệt: fallback `no-cors`, hiển thị “Đã gửi, cô kiểm tra giúp”, không khẳng định đã nhận. Lỗi console do tình huống CORS/503 được chủ động tạo trong QA.
- [x] Chặn đọc/ghi localStorage: nhập thông tin, chấm 5/5, nộp thành công trong phiên; hiện nhắc giữ trang mở để không mất kết quả chờ.
- [x] Test transport kiểm thêm timeout, mất mạng cả hai lần, khóa tính năng khi config trống và không gửi thừa dữ liệu.
- [x] Không triển khai Apps Script, không gửi đến Google; toàn bộ dữ liệu kiểm thử là giả trên localhost.
- [ ] Chờ URL endpoint + mã lớp thật: dán config, gửi lượt thử được giảng viên đồng ý và kiểm dòng trong Sheet. Chưa thể xác minh Sheet thật khi chưa có cấu hình.

Giới hạn Apps Script hiện tại: fallback có thể ghi trùng nếu POST đầu được xử lý nhưng phản hồi bị CORS chặn; README nêu rõ để giảng viên lọc/đối chiếu. Kết quả luyện lại là riêng lượt luyện lại, không tự cộng dồn điểm.

## Dữ liệu và audio — PASS

- 100 câu: 50 MCQ + 20 Đúng / Sai VSTEP, 30 điền từ Cambridge 13. TRUE/FALSE: 10/10, xen kẽ. Mức độ ước lượng: 40 B1, 45 B1+/B2, 15 B2.
- 17 set, audio tổng 14.880.202 byte (14,88 MB), dài 50,01–177,50 giây.
- `tools/validate_data.py` kiểm toàn bộ yêu cầu dữ liệu và audio mục 8; kết quả `pass: true`, không lỗi. MP3 giải mã được, mono 22050 Hz / 64 kbps, có Xing, không khoảng lặng từ 2 giây, mean volume -18 đến -14 dB; đếm mẫu chạm trần trên PCM dưới 0,001%.
- Kiểm thử chấm điểm: chuẩn hóa Unicode/khoảng trắng/chữ hoa/dấu cuối câu, các đáp án tương đương, lỗi gõ một ký tự, câu trắng và đáp án sai — PASS.
- Nội dung soạn mới và giải thích đã được soát; câu MCQ gốc giữ nguyên cách diễn đạt, lựa chọn và key của tài liệu.

## Web — PASS

- Phục vụ từ đường dẫn con `/listening-100-cau/`, tải được JSON và audio.
- Viewport 375 px: không tràn ngang; đã làm trọn set Cambridge, chấm 5/5; lượt thử trước đó 4/5 nhận đúng lỗi gõ và câu sai. Kết quả lưu được qua chuyển trang.
- Set VSTEP có MCQ và Đúng / Sai: làm đủ 5/5 khi chặn cả đọc lẫn ghi localStorage; trang không crash, hiện thông báo không lưu tiến độ.
- Không có lời giải trong DOM trước nộp. Sau nộp xuất hiện điểm, lời giải, trích dẫn, đánh dấu đúng/sai.
- Tua đến gần cuối rồi phát tại 97,79 giây; nút nghe lại câu 73 phát đúng mốc 55,94 giây. Tốc độ phát 0,75× hoạt động.
- Console không có lỗi đỏ trong các luồng kiểm thử trên.
- Máy chủ Python http.server thông thường không hỗ trợ byte ranges nên ban đầu tua trở về đầu; đã thay bằng `tools/serve.py` và kiểm lại thành công. Không phải lỗi MP3/player.

## Quyết định biên tập

- Giữ đủ 30 câu Cambridge từ JSON đã duyệt. Câu Test 3 Section 1 số 10 giữ đáp án cafe/café; `quoteSource: asr`, ghi rõ “trang in 109 thiếu trong bản scan”. 99 câu còn lại dùng `quoteSource: pdf`. ASR không quyết định đáp án.
- Ba mapping Cambridge đã xác minh toàn file: Cookery classes; South City Cycling Club/Jim Hunter; Banford/Dalton/Linda. Bằng chứng chi tiết giữ ở thư mục làm việc `source-extraction-local/cambridge-mapping-verified.json`.
- Loại toàn bộ Part 2 Bài 7 và tất cả câu needs_review. Giữ nguyên key trong dữ liệu nguồn; danh sách nghi sai nằm trong `DANH-SACH-CAU-NGHI-SAI-DAP-AN.md`.
- Ghép các đoạn VSTEP ngắn theo nhóm để mỗi set có 5–10 câu và audio đạt tối thiểu 45 giây; khoảng nối 1,5 giây. Các đoạn trên 150 giây vẫn dưới mức tối đa 180 giây để giữ đủ ngữ cảnh.
- Tái sử dụng Part 1 đã làm sạch. Riêng đoạn cắt A được cân âm lại từ bản sạch để đạt ngưỡng mean volume; không xử lý lại audio gốc.
- Mọi mốc nghe tính trên MP3 cuối cùng. Cambridge Test 3 câu 7 dò bổ sung theo đoạn liền trước/sau vì ASR bỏ sót cụm “hospital”; đặt mốc 24 giây trên đoạn cắt để nghe từ trước thông tin cần thiết.
