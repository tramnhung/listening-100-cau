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

## Một mã tổng kết cho toàn bộ bài làm

Sinh viên làm xong các chặng rồi mở `ket-qua.html`. Khối **Tạo mã nộp bài** lấy Họ tên / MSSV / Lớp đã lưu, cho sửa trước khi bấm **Tạo mã**, có **Copy mã** và số ký tự. Trang làm bài chỉ nhắc sang Kết quả, không tạo mã theo từng chặng nữa. Nếu làm thêm hoặc sửa kết quả, tạo lại một mã tổng kết mới để thay mã trước; không khóa sinh viên sau lần bấm đầu.

Mã chứa toàn bộ chặng đã nộp/chấm, cả chặng làm sai hết; không chứa bài đang nhập nhưng chưa nộp. Mỗi chặng giữ setId, đúng/tổng, danh sách câu sai và thời gian chấm gần nhất. Có thêm tổng đúng/100 và đã làm/100. Luyện lại câu sai cập nhật kết quả cả chặng. Không tự gửi thông tin lên dịch vụ nào; sinh viên tự copy mã gửi cô qua Zalo.

Trang giảng viên: https://tramnhung.github.io/listening-100-cau/bangdiem.html — không có link từ trang chủ sinh viên. Dán mỗi mã một dòng, chọn **Nhập mã vào bảng**. Nhận mã tổng kết `L100.3`, `L100.2` và mã từng chặng `L100.1` cũ. Mã hỏng báo rõ dòng, mã trùng hệt được báo và bỏ qua; mã hợp lệ khác vẫn nhập. Mỗi mã v2 tách ra các lượt chặng cho bảng chi tiết và CSV.

Tổng hợp theo MSSV (trim, không phân biệt hoa thường), lấy lần mới nhất của từng chặng theo thời điểm nộp bài trong mã. Cùng thời gian thì lấy mã nhập sau. Không cộng lặp điểm khi nhập lại mã tổng kết hoặc trộn với mã cũ. Hiện số đúng/100 và đã làm/100. Thời gian hiển thị theo Việt Nam. Bảng tự lưu localStorage để nhập nhiều đợt, có nút Xóa hết kèm xác nhận.

Hai nút **Xuất CSV chi tiết / tổng hợp** xuất UTF-8 BOM, dấu phẩy phân cột, bảo vệ ô khỏi bị diễn giải thành công thức. Nếu Excel không tự tách cột theo thiết lập vùng, dùng Data → From Text/CSV và chọn dấu phẩy. Khi localStorage bị chặn, trang báo rõ; giữ mã gốc và CSV để dự phòng.

### Định dạng L100.2

DEFLATE + base64url + CRC32 như v1. Mảng gọn `[họ tên, MSSV, lớp, thời gian gốc, tổng đúng, đã làm, các chặng]`; mỗi chặng là `[chỉ số, bitmask câu sai, độ lệch thời gian]`. Đúng/tổng và setId được khôi phục chính xác từ danh mục cố định `CODE_SETS` trong `result-code.js`; chỉ số không được sắp lại hoặc tái sử dụng. Chỉ số/bitmask không hợp lệ, chặng trùng, tổng điểm sai, checksum sai đều bị từ chối. Bitmask thay danh sách số câu dài; thời gian tương đối giảm độ dài mã. Cần trình duyệt hiện đại hỗ trợ CompressionStream/DecompressionStream.

**Độ dài đo thực tế: 220 ký tự** cho 100 câu / 17 chặng, 83 đúng / 17 sai, tên “Sinh viên thử A”, MSSV “TEST-A”, lớp “Lớp thử”. Đây không phải giới hạn cố định: tên/lớp dài hơn và thời gian làm rải nhiều ngày có thể làm mã dài hơn.

**Mã không chống gian lận:** sinh viên biết kỹ thuật có thể sửa điểm trước khi tạo mã; dùng làm sổ theo dõi luyện tập, không phải điểm chính thức. Checksum chỉ phát hiện lỗi sao chép, không phải chữ ký hay mã hóa bảo mật. Mã có thông tin cá nhân, chỉ gửi giảng viên. Địa chỉ bảng điểm riêng không phải cơ chế phân quyền; dữ liệu lớp nằm trên trình duyệt giảng viên.

Kiểm thử: `node tools/test-result-code.mjs`, `node tools/test-grading.mjs`; chạy local bằng `python tools/serve.py --directory . --port 8770`. Bộ test bao gồm v1/v2, 100 câu, mã cắt/checksum, Unicode, gộp 2 sinh viên, không cộng trùng và CSV. Không cần endpoint hoặc tài khoản dịch vụ.


## Trình bày bài luyện (cập nhật 16/11/2026)

17 chặng dùng tên Bài 1–Bài 17 theo thứ tự cố định trong JSON; nhãn mức độ, số câu, thời lượng và ID chặng giữ nguyên. Bảng điểm/CSV lấy tên hiện tại từ JSON nên mã v1/v2 cũ cũng hiển thị Bài N.

Mỗi chặng có hướng dẫn tiếng Việt cho từng dạng câu xuất hiện. Không hiện dòng nguồn dưới mỗi câu hoặc trong lời giải; dữ liệu nguồn vẫn giữ để đối chiếu, trang `nguon.html` giữ nguyên.

Sáu chặng điền từ (Bài 12–17) dùng `gapNotes.heading` và `gapNotes.paragraphs`: một khối ghi chú liên kết bằng câu văn mới, do người biên soạn diễn đạt lại theo nội dung nghe; không sao chép trang ghi chú Cambridge. Các token `{{71}}`…`{{100}}` biến thành ô trống có số ngay trong câu. Mỗi ô xuất hiện một lần, đúng thứ tự. Đáp án, các biến thể, maxWords, trích dẫn và mốc nghe giữ nguyên. Ô 73 nhắc viết số kèm ký hiệu % (ví dụ minh họa khác đáp án), phù hợp dạng một số và bộ đáp án có sẵn.

Sau nộp, khối ghi chú vẫn giữ nguyên, ô đúng/sai được đánh dấu và lời giải riêng xuất hiện bên dưới. Khi luyện lại câu sai, vẫn hiện cả ghi chú; ô đã đúng giữ câu trả lời trước đó và chỉ đọc để không mất ngữ cảnh.

## Thời gian làm bài và L100.3

Mỗi chặng bắt đầu đếm từ thao tác đầu tiên trong bài, dừng khi nộp; chỉ cộng khi tab hiện (`document.hidden === false`). Lưu tiến độ mỗi giây và khi chuyển tab/rời trang; reload tiếp tục thời gian đã lưu, không cộng khoảng đóng trang. Tối đa 60 phút/chặng. Làm lại dùng thời gian lượt mới nhất; “Làm lại từ đầu” xóa cả bộ đếm. localStorage bị chặn sẽ báo không lưu được.

Kết quả chặng hiện phút/giây; Kết quả tổng hiện từng chặng và tổng thời gian. L100.3 giữ DEFLATE + base64url + CRC32, thêm số giây nguyên vào cuối mỗi hàng chặng: `[chỉ số, bitmask sai, lệch thời điểm nộp, số giây]`. Giá trị null dành cho kết quả cũ chưa đo. Bảng điểm và cả hai CSV có thời gian dạng phút:giây; mã L100.1/L100.2 vẫn đọc được, ô thời gian trống. Tổng để trống nếu có lượt được tính điểm thiếu thời gian, tránh thể hiện tổng không đầy đủ.

Thời gian chỉ để tham khảo; sinh viên biết kỹ thuật vẫn sửa được trước khi tạo mã, không dùng làm điểm chính thức. Fixture kiểm thử đủ 100 câu / 17 chặng, 83 đúng, có thời gian từng chặng tạo mã **282 ký tự**; độ dài phụ thuộc tên/lớp, kết quả và thời điểm, không phải giới hạn cố định. Phép đo này dùng dữ liệu test, không phải lượt làm lại 100 câu trên trình duyệt.
