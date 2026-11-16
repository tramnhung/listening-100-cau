# Kiểm thử và ghi chú

## Bố cục câu hỏi và tên bài — PASS

- [x] 17 title trong JSON là Bài 1–17; thứ tự/ID, mức độ, số câu và thời lượng không đổi.
- [x] Không còn dòng nguồn trong câu hỏi hoặc lời giải. `nguon.html` không thay đổi.
- [x] Sáu bài điền từ có ghi chú mới gồm các đoạn liên kết, placeholder đánh số trong mạch văn; không chép trang ghi chú sách. Kiểm tự động đủ mỗi placeholder đúng một lần, đúng thứ tự.
- [x] So với commit trước: toàn bộ answers/answer, maxWords, audioStartSec, transcriptQuote, source không đổi.
- [x] Trình duyệt 375 px: Bài 12 có một khối ghi chú, không tràn ngang. Nhập choose/private/20%/healthy/zzzz → 4/5; luyện lại chỉ ô 75 với bones → 1/1; giữ đủ ngữ cảnh.
- [x] Bài 3 có hướng dẫn riêng Trắc nghiệm và Đúng/Sai; trả lời đủ → 5/5. DOM không có dòng nguồn trước/sau chấm.
- [x] Tạo mã tổng kết ở Kết quả, dán bảng điểm → 10/100 đã làm, 10/100 đúng; cột Chặng hiện Bài 3 và Bài 12, mỗi bài 5/5.
- [x] Console không lỗi. Ba bộ kiểm tra dữ liệu/audio, chấm điểm, mã nộp đều PASS.
- [x] README và brief cập nhật theo yêu cầu mới; trang nguồn bản quyền giữ nguyên.

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

## Thời gian làm bài / L100.3 — 16/11/2026

- [x] Làm thật trên trình duyệt local: Bài 3 đúng 5/5, 1:31; Bài 12 đúng 5/5, 0:10. Tổng 10/100, đã làm 10/100, thời gian 1:41. Tạo mã từ Kết quả, nhập Bảng điểm: từng chặng và tổng khớp, không có câu sai.
- [x] Reload giữa bài giữ thời gian đã lưu. Bộ test clock kiểm lần đầu chưa thao tác, ẩn/hiện, reload không cộng khoảng offline, dừng nộp, trần 3600 giây.
- [x] Mô phỏng document.hidden và visibilitychange trong trang thử riêng: chờ thật 30 giây, bộ đếm giữ 1:29; tiếp tục làm và nộp ở 1:31. Trang thử đã xóa khỏi repo.
- [ ] Chưa xác nhận thao tác ẩn tab thật: trình duyệt IAB kiểm thử luôn trả document.hidden=false dù đổi tab/ẩn bề mặt. Không coi mô phỏng ở trên là kiểm chứng ẩn tab thật.
- [x] Nhập mã L100.2 cũ TEST-A cùng mã L100.3 TEST-TIME: tách đúng 2 sinh viên; mã cũ hiện đủ 17 chặng, ô thời gian chi tiết/tổng hợp trống.
- [x] Xuất bằng cả hai nút CSV trên giao diện, đọc lại file tải xuống: UTF-8 BOM, tiếng Việt đúng; cột thời gian chi tiết 1:31 và 0:10, tổng 1:41; dòng mã cũ để trống.
- [x] Unit test v1/v2/v3, checksum/mã cắt, thời gian nguyên 0..3600, thiếu thời gian, gộp lượt mới nhất. Fixture 100 câu có thời gian: 282 ký tự. Console trình duyệt không có lỗi.

Thời gian tham khảo, có thể bị sinh viên sửa bằng kỹ thuật; không phải cơ chế chống gian lận. Tổng trống khi dữ liệu cũ thiếu thời gian.
