# Listening 100

Trang học: https://tramnhung.github.io/listening-100-cau/

100 câu trong 17 chặng nghe: 30 điền từ Cambridge IELTS 13 (Test 1–3, Section 1), 50 trắc nghiệm gốc và 20 Đúng / Sai biên soạn từ transcript Listening VSTEP. Không cần tài khoản, thư viện ngoài hoặc bước build. Tiến độ được lưu trên trình duyệt.

## Chạy tại máy

Từ thư mục repo, chạy `python tools/serve.py --directory .`, rồi mở `http://localhost:8765/`. Server hỗ trợ HTTP byte ranges để kiểm thử tua MP3. Dùng GitHub Pages với branch `main`, thư mục `/ (root)`.

## Kiểm tra

```sh
python tools/validate_data.py --ffmpeg /path/to/ffmpeg
node tools/test-grading.mjs
```

Kết quả chi tiết audio trong `tools/validation-report.json`; kết quả kiểm thử giao diện và các quyết định biên tập trong `KIEM-THU-VA-GHI-CHU.md`.

## Thêm hoặc sửa chặng nghe

Sửa `data/questions.json`. Mỗi set có `id`, `title`, `level`, `source`, `audio`, `audioDurationSec`, `maxPlays` và `questions`. Giữ ID câu ổn định để tiến độ đã lưu không bị lệch. `maxPlays: 0` là không giới hạn. Mỗi câu cần nguồn, giải thích, trích dẫn tối đa 25 từ và `audioStartSec` tính từ đầu file MP3 cuối cùng. `quoteSource` mặc định `pdf`; ngoại lệ ASR phải có `quoteNote` và đáp án độc lập đã được xác nhận.

Thêm file vào `audio/` và manifest `tools/audio-manifest.json`, chạy kiểm tra rồi thử làm bài trên trình duyệt. Bộ hiện tại khóa ở 100 câu theo brief; nếu thay quy mô, cập nhật cả bộ kiểm tra và nhãn tổng số trên giao diện.

## Tạo lại audio

```sh
python tools/build_audio.py --source-root "D:/UFM/Nhung UFM/Vstep" --ffmpeg /path/to/ffmpeg
```

Nguồn nằm ngoài repo, đường dẫn tương đối trong manifest. Script dùng đúng silenceremove và loudnorm hai lượt của brief §4.2, limiter 0.708, mono 22050 Hz, MP3 64 kbps và Xing. Audio Part 1 được lấy từ `audio-part1-clean` đã xử lý; không đọc lại file Part 1 gốc. Sau khi đổi bất kỳ điểm cắt hoặc bộ lọc nào, phải kiểm lại mốc nghe trên MP3 đã xuất và cập nhật `audioStartSec` nếu cần.

## Nguồn

- Cambridge IELTS 13, Cambridge University Press / Cambridge English Language Assessment, 2018. 30 câu theo JSON đã được người phụ trách đối chiếu answer key, không OCR.
- `Listening VSTEP.pdf` (bộ bổ sung Nghe VSTEP): lấy câu hỏi, key và transcript từ text layer. 20 câu Đúng / Sai được soạn từ transcript chính thức.
- Riêng Cambridge Test 3 Section 1 câu 10: bản scan thiếu trang in 109, trích dẫn từ ASR theo ngoại lệ đã duyệt; giữ nguyên đáp án từ answer key.

Nội dung và audio thuộc các tác giả, nhà xuất bản tương ứng; dùng cho học tập trong lớp. Repo không chứa PDF, audio gốc, transcript đầy đủ hay mô hình ASR.

## Nộp kết quả vào Google Sheet

Giảng viên tự triển khai Apps Script theo `HUONG-DAN-NOI-GOOGLE-SHEET.md` ở thư mục cha. Website đã chuẩn bị phần gửi, chưa cấu hình hay triển khai dịch vụ Google.

Khi nhận được URL Web app `/exec` và mã lớp, sửa đúng hai hằng số trong `assets/config.js` rồi commit/push:

```js
export const SUBMIT_ENDPOINT = "URL_WEB_APP_EXEC";
export const MA_LOP = "MA_LOP_CUA_GIANG_VIEN";
```

Hiện hai giá trị đều rỗng. `SUBMIT_ENDPOINT` rỗng thì toàn bộ giao diện thu thông tin và nộp kết quả bị ẩn. File config được nạp trước app; không có thư viện ngoài.

Khi bật, sinh viên nhập Họ tên, Mã số sinh viên, Lớp một lần, có thể sửa lại. Thông tin và kết quả chờ nộp lưu riêng trong localStorage (`listening100-submission-v1`). Khi bị chặn lưu trữ, vẫn làm/nộp được trong trang hiện tại và có cảnh báo mất dữ liệu chờ nếu rời trang. Không tự gửi lúc lưu thông tin, chấm điểm, tải lại hoặc mở lại trang. Chỉ nút **Nộp cho cô / Thử lại** mới gửi.

JSON POST chỉ có `maLop`, `hoTen`, `mssv`, `lop`, `setId`, `setTitle`, `tong`, `dung`, `cauSai`. `cauSai` là số câu toàn bộ đề, ngăn bằng dấu phẩy; rỗng khi đúng hết. Điểm là ảnh chụp của **lượt làm vừa chấm**; khi luyện lại câu sai, `tong` là số câu trong lượt luyện lại đó, không gộp với lượt trước. Không gửi câu trả lời chi tiết, thời gian, email hay dữ liệu cá nhân khác. Dòng thông báo dữ liệu xuất hiện cạnh biểu mẫu và từng nút nộp.

Request dùng `Content-Type: text/plain;charset=utf-8`, không gửi cookie, timeout 15 giây. Chỉ phản hồi JSON `{ok:true}` mới báo gửi xong. HTTP lỗi hoặc `{ok:false}` hiện lỗi và nút Thử lại, giữ nguyên kết quả qua tải lại trang nếu localStorage hoạt động. Nút bị khóa khi đang gửi/đã gửi để tránh bấm lặp.

Nếu fetch bị trình duyệt chặn CORS/lỗi mạng, thử một lần `mode: no-cors`; phản hồi opaque chỉ báo **“Đã gửi, cô kiểm tra giúp”**, không khẳng định Sheet đã nhận. Do trình duyệt không phân biệt được CORS với lỗi mạng, và request đầu có thể đã được Apps Script ghi trước khi phản hồi bị chặn, fallback có thể tạo hai dòng. Apps Script hiện chưa có chống trùng; giảng viên đối chiếu/lọc các dòng trùng. Mã lớp nằm trong file công khai, chỉ là mã phân loại/chặn sơ bộ, không phải mật khẩu bảo vệ Sheet.

### Kiểm thử không dùng Google

```sh
python tools/mock_submission.py
# Trong terminal khác:
node tools/test-submission.mjs
node tools/test-grading.mjs
```

Mở `http://127.0.0.1:8766/lam-bai.html?set=vstep-p2-t01`. Máy chủ QA thay config **trong phản hồi HTTP**, không sửa file config thật; endpoint giả ở port 8767. Chỉ dùng thông tin sinh viên giả.

- `http://127.0.0.1:8767/scenario?value=fail-once`: lỗi lần đầu, lần sau thành công.
- Đổi `value` thành `success`, `reject`, `cors`, `disabled` để thử các trường hợp tương ứng; tải lại web sau khi đổi sang/từ `disabled`.
- `http://127.0.0.1:8767/requests`: xem payload/header nhận được. POST `/reset` xóa nhật ký QA.
- `http://127.0.0.1:8766/qa-no-storage.html?set=vstep-p2-t01`: chặn đọc/ghi localStorage.

Sau khi có endpoint thật, cần một lượt kiểm thử được giảng viên đồng ý và đối chiếu trực tiếp dòng mới trong Sheet; thử nghiệm cục bộ không thay thế bước này.
