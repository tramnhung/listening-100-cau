# Kiểm thử và ghi chú

## Một mã tổng kết L100.2 — PASS

- [x] Làm và nộp đủ 100 câu / 17 chặng bằng thao tác giao diện trình duyệt local; không chèn điểm vào localStorage. Mỗi chặng cố ý sai câu đầu: 83 đúng, 17 sai.
- [x] Trang làm bài không có form/khối tạo mã; có lời nhắc và link Kết quả. Trang Kết quả tạo một mã L100.2 tổng kết, Copy thành công, hiển thị đúng **220 ký tự**.
- [x] Dán mã vào bảng điểm: đối chiếu tự động các hàng DOM với kết quả vừa chấm, **17/17 chặng khớp đúng/tổng và câu sai**.
- [x] Danh sách câu sai mẫu: 1, 6, 11, 16, 21, 31, 36, 41, 51, 61, 66, 71, 76, 81, 86, 91, 96.
- [x] Mã cắt mất 3 ký tự báo rõ Dòng 1 và lỗi thiếu checksum. Mã sửa nội dung có kiểm tra CRC32.
- [x] Tạo mã sinh viên giả B từ cùng bộ kết quả để kiểm gộp: A và B mỗi người 83/100, đã làm 100/100, 17 chặng. Không lẫn sinh viên.
- [x] Nhập thêm L100.1 cũ của A: giải mã thành công; tổng vẫn 83/100 theo lần làm mới nhất, không cộng trùng. Chi tiết có 35 lượt chặng / 3 mã.
- [x] Tải lại trang bảng điểm: dữ liệu còn đủ. Console không lỗi.
- [x] Xuất cả hai CSV thật bằng nút giao diện, đọc lại file tải xuống: UTF-8 BOM, tiếng Việt có dấu đúng, chi tiết 35 dòng, tổng hợp 2 dòng với số liệu 83/100 và 100/100.
- [x] `test-result-code.mjs`: PASS v1/v2, Unicode, cắt mã/checksum, validation, danh mục cố định, bitmask câu sai/thời gian, tổng 100 câu, 2 sinh viên, lượt cũ/mới, CSV chống công thức.
- [x] `test-grading.mjs`: PASS hồi quy. README và brief đã cập nhật luồng một mã tổng kết.

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
