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
