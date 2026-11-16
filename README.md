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

## Mã nộp bài và bảng điểm lớp

Trang giảng viên: https://tramnhung.github.io/listening-100-cau/bangdiem.html

Sinh viên nhập Họ tên / MSSV / Lớp, làm bài, rồi bấm **Tạo mã nộp bài** và **Copy mã** để tự gửi qua Zalo. Không có endpoint, tài khoản dịch vụ hay thao tác gửi thông tin tự động. Form nhớ thông tin trên trình duyệt và cho sửa lại. Nếu không lưu được, trang nhắc giữ trang mở và copy mã trước khi rời trang.

Giảng viên giữ riêng địa chỉ `bangdiem.html` (không có liên kết từ trang chủ sinh viên). Dán mỗi mã một dòng rồi chọn **Nhập mã vào bảng**. Mã hỏng báo rõ số dòng; mã hợp lệ vẫn được nhập, mã trùng hệt được đếm và bỏ qua. Bảng tự lưu localStorage để nhập nhiều đợt, có **Xóa hết bảng điểm** kèm xác nhận. Có hai nút xuất CSV chi tiết và tổng hợp, UTF-8 BOM để Excel đọc tiếng Việt, dấu phẩy phân cột, có bảo vệ ô khỏi bị diễn giải thành công thức. Nếu Excel theo thiết lập vùng không tự tách cột, dùng Data → From Text/CSV và chọn dấu phẩy.

Bảng chi tiết giữ từng lượt; tổng hợp theo MSSV (bỏ khoảng trắng đầu/cuối, không phân biệt hoa thường), lấy thời gian mới nhất của từng chặng; nếu cùng thời gian, lấy mã nhập sau. Không cộng lặp điểm khi nộp lại. Tổng hợp hiện số đúng/100 và số câu đã làm/100. Khi sinh viên luyện lại câu sai, mã chứa kết quả cập nhật của **cả chặng**, không chỉ các câu luyện lại.

Mã phiên bản `L100.1` gồm mảng JSON gọn: họ tên, MSSV, lớp, setId, số câu, số đúng, danh sách số câu sai, thời gian chấm bài (Unix giây). Dữ liệu được nén DEFLATE, base64url và checksum CRC32. Mã mẫu kiểm thử dài 123–130 ký tự. Cần trình duyệt hiện đại có CompressionStream/DecompressionStream. Thời gian hiển thị trên bảng theo Việt Nam.

**Mã này không chống gian lận:** sinh viên biết kỹ thuật có thể sửa điểm trước khi tạo mã, nên dùng làm sổ theo dõi luyện tập, không phải điểm chính thức. Checksum chỉ phát hiện lỗi sao chép; không phải chữ ký hay mã hóa bảo mật. Mã chứa thông tin cá nhân, chỉ chia sẻ cho giảng viên. Trang bảng điểm không yêu cầu đăng nhập; địa chỉ riêng không phải cơ chế phân quyền. Dữ liệu lớp chỉ nằm trên trình duyệt giảng viên; nên giữ mã gốc và xuất CSV dự phòng.

Kiểm thử:

```sh
node tools/test-result-code.mjs
node tools/test-grading.mjs
python tools/serve.py --directory . --port 8768
```

Mở trang làm bài rồi bảng điểm trên cùng server. Test tự động kiểm tiếng Việt, round-trip, mã cắt/mã đổi checksum, dữ liệu không hợp lệ, tổng hợp 3 mã/2 sinh viên, nộp lại cùng chặng và CSV. Không dùng dịch vụ ngoài. Phần triển khai Google đã hủy; không cần cấu hình gì thêm.
