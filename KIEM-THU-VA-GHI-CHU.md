# Kiểm thử và ghi chú

## Mã nộp bài và bảng điểm — PASS

- [x] Không còn config endpoint, mã lớp, POST hay fallback mạng. Đã hủy clasp login, xóa thư mục clasp-tools và apps-script ngoài repo; chưa clone/deploy dự án Google.
- [x] Giữ form và sửa thông báo minh bạch: dữ liệu nằm trong mã do sinh viên tự gửi, trang không tự gửi đi đâu.
- [x] Local: sinh viên giả A / TEST-A / Lớp thử, Part 2 Bài 1, làm 4/5, sai câu 11; tạo mã và Copy thành công. Dán bảng điểm hiện đúng tên, MSSV, lớp, 4/5, 80%, câu sai 11, thời gian.
- [x] Mã cắt mất 1 và 3 ký tự: báo “Dòng 1: Mã bị thiếu ký tự hoặc sai định dạng L100.1.” Không bỏ qua im lặng.
- [x] 3 mã / 2 sinh viên: A có 4/5 + 3/5 → 7/100, đã làm 10/100; B có 5/5 → 5/100, đã làm 5/100. Dán lại mã trùng: báo 1 mã trùng, không cộng thêm.
- [x] Tải lại trang: vẫn đủ 3 mã / 2 sinh viên.
- [x] Xuất CSV thực tế qua nút trên trang, đọc lại file tải xuống: đủ 3 dòng, tên tiếng Việt, “Lớp thử”, “Phần trăm”, “Câu sai” hiển thị đúng; UTF-8 BOM và escaping đã kiểm tự động.
- [x] `test-result-code.mjs`: PASS round-trip, Unicode, mã cắt/checksum hỏng, schema/set validation, nộp lại, tổng hợp, CSV chống công thức, không gọi mạng trong tạo mã.
- [x] `test-grading.mjs`: PASS toàn bộ hồi quy chấm điểm. Console local bảng điểm không có lỗi đỏ.
- [x] README và bảng điểm nêu rõ không chống gian lận; không có link bảng điểm từ trang chủ sinh viên.

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
- Loại toàn bộ Part 2 Bài 7 và tất cả câu needs_review. Giữ nguyên key trong dữ liệu nguồn; danh sách đối chiếu được lưu riêng ở thư mục cha, ngoài repo và GitHub Pages.
- Ghép các đoạn VSTEP ngắn theo nhóm để mỗi set có 5–10 câu và audio đạt tối thiểu 45 giây; khoảng nối 1,5 giây. Các đoạn trên 150 giây vẫn dưới mức tối đa 180 giây để giữ đủ ngữ cảnh.
- Tái sử dụng Part 1 đã làm sạch. Riêng đoạn cắt A được cân âm lại từ bản sạch để đạt ngưỡng mean volume; không xử lý lại audio gốc.
- Mọi mốc nghe tính trên MP3 cuối cùng. Cambridge Test 3 câu 7 dò bổ sung theo đoạn liền trước/sau vì ASR bỏ sót cụm “hospital”; đặt mốc 24 giây trên đoạn cắt để nghe từ trước thông tin cần thiết.
