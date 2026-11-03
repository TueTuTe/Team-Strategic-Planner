# Atelier — Strategy, together.

Văn phòng 3D cho đội ngũ strategy, insight, creative, media và account. Bản đầu tiên cho phép khám phá văn phòng, xem chuyên môn từng vai trò, nhập brief khách hàng, tạo khung IMC 5 giai đoạn, đánh dấu đầu việc và xuất Markdown.

## Xem thử không cần cài đặt

Tải [Atelier-Demo.zip](downloads/Atelier-Demo.zip) từ GitHub bằng nút **Download raw file**, giải nén rồi mở `Atelier.html` bằng Chrome hoặc Edge trên máy tính. Bản đóng gói chứa sẵn mã, font và hình học 3D, không cần tải thư viện từ Internet. Dữ liệu demo được lưu riêng trên trình duyệt của bạn; các nhân vật chưa kết nối AI. Nội dung bản đóng gói đã được kiểm tra ở chế độ ngoại tuyến; thao tác mở `file://` trực tiếp chưa được xác minh trong môi trường quản lý vì chính sách Chromium chặn truy cập file cục bộ.

## Triển khai website với Vercel

1. Đăng nhập Vercel, chọn **Add New → Project**.
2. Import repository `TueTuTe/Team-Strategic-Planner` và chọn nhánh `main`.
3. Dùng preset **Vite**, build command `npm run build`, output directory `dist`; repository đã có `vercel.json` cấu hình các giá trị này.
4. Nhấn **Deploy**. Sau khi thành công, dùng địa chỉ do Vercel cung cấp để mở website.

Không cần API key hay biến môi trường cho bản demo này. Đẩy mã lên GitHub chưa tự triển khai website; địa chỉ chạy thật chỉ có sau khi dự án được kết nối và deploy thành công.

Đổi tên nhân vật: chọn tên trong văn phòng 3D hoặc thẻ tại **Đội ngũ của bạn**, sửa **Tên nhân vật**, rồi nhấn **Lưu tên**. Tên và chữ viết tắt được cập nhật ở văn phòng, đội ngũ và phân công kế hoạch (kể cả kế hoạch đã tạo). Tùy chỉnh được giữ trên trình duyệt này khi tải lại trang.

Không gian 3D mang phong cách thư phòng Nhật Bản: sàn và khung gỗ nâu, vách shoji, thư viện sát tường, khu tatami nâng sàn, bàn trà thấp, đèn giấy và bonsai. Vật liệu gỗ, chiếu, giấy và tranh phong cảnh được tạo cục bộ bằng Canvas; không tải texture từ bên ngoài. Mái được mở để quan sát và chọn nhân vật. Khi bật chuyển động, nhân vật và cá hoạt động ở tối đa 24 khung hình/giây; khi tắt, cảnh chỉ vẽ lại khi góc nhìn hoặc trạng thái thay đổi. Tab ẩn ngừng cập nhật chuyển động.

Mặt bằng hiện tại rộng 18 × 14 đơn vị mô hình (gấp khoảng 2,3 lần bản 12 × 9), gồm góc Strategy mở với vách nan bên hông, studio 4 người, phòng họp kính 8 chỗ có cửa mở và khu trà tatami riêng với 6 đệm ngồi. Cả 5 chỗ làm việc đều có 2 màn hình riêng; màn hình trình chiếu phòng họp không tính vào 10 màn hình cá nhân. Chọn các nút **Góc riêng / Khu làm việc / Phòng họp / Khu thưởng trà** để xem gần từng khu, hoặc **Toàn cảnh** để trở về. Đây là bố trí 3D minh họa, không phải bản vẽ thi công theo kích thước thực tế.

Góc Strategy có thêm tủ gỗ thấp trưng bày bể cá thủy sinh và terrarium rêu; cá bơi nhẹ khi bật chuyển động. Tủ nằm bên trái lối vào mở, tách khỏi mặt bàn máy tính.

## Chuyển động, lời thoại và giao việc

- Nhân vật có chuyển động đầu, vẫy tay khi tương tác và gõ phím khi đang làm thử. Nút **Chuyển động** bật/tắt toàn cảnh; mặc định tôn trọng tùy chọn giảm chuyển động của hệ điều hành.
- Khi không còn task đang mở, nhân viên tự rời ghế, đi theo các lối trống và gặp nhau trò chuyện ở lối đi, khu trà hoặc phòng họp. Nhận việc mới sẽ quay về bàn. Nếu đang ở xa khi bấm làm thử, trạng thái **Đang về bàn** được giữ đến khi tới nơi rồi mới bắt đầu thời gian xử lý mô phỏng. Tắt chuyển động đưa nhân viên về chỗ và không tự đi dạo.
- Chọn nhân vật để **Chào hỏi**, **Động viên**, **Nhắc nghiêm** vui vẻ, hoặc **Giao việc**. Bong bóng thoại xuất hiện tại nhân vật; nhật ký bên dưới giữ các phản hồi gần đây.
- **Bàn điều phối** lưu đầu việc và lịch sử trên trình duyệt. **Làm thử · mô phỏng** chạy khoảng 5,5 giây rồi tạo checklist theo chuyên môn và báo xong. Nút **Xem bản nháp** mở nội dung thật đã sinh; đây là mẫu cố định theo vai trò, chưa có agent AI nghiên cứu hoặc xử lý nội dung thật.
- Có thể **Dừng**, **Đánh dấu xong** thủ công hoặc xóa việc. Hủy một lượt làm thử ngăn thông báo hoàn thành sau đó. Đầu việc đang làm được khôi phục khi tải lại trang.
- Nhạc ambient ngũ cung do Web Audio tổng hợp cục bộ, không tải nhạc từ bên ngoài. Trình duyệt cần lần chạm/bấm phím đầu tiên để cho phép phát. Menu **♫** có nút bật/tắt, âm lượng và lựa chọn đọc lời thoại; ghi nhớ tắt nhạc khi tải lại. Nhạc tạm dừng khi tab ẩn.
- Giọng đọc dùng Speech Synthesis nếu thiết bị có giọng tiếng Việt; mặc định tắt. Khi không có giọng đọc, lời thoại văn bản vẫn hoạt động. Việc nghe được âm thanh thực tế phụ thuộc thiết bị/đầu ra âm thanh; kiểm thử tự động xác nhận AudioContext phát và trạng thái điều khiển.

## Box chat với nhân viên

Nút **Nhắn đội ngũ** mở hộp chat nhỏ ở góc phải. Chọn người nhận hoặc viết tên; phản hồi xuất hiện từ chính nhân vật trong cảnh 3D và được giữ trong lịch sử chat của trình duyệt.

- `Vũ ơi, lại đây`: nhân viên đang rảnh đi ra lối giữa văn phòng rồi báo đã tới. Người đang làm việc sẽ báo tình trạng thay vì tự bỏ task.
- `Lãm ơi, tiến độ đến đâu rồi?`: báo task đang chờ, đang về bàn, đang làm thử, đã xong hoặc đã dừng. Phần trăm chỉ là thời gian của lượt mô phỏng.
- `Báo cáo tiến độ cả đội`: từng người trả lời tình trạng riêng.
- Chọn người rồi nhắn `Giao việc: Rà creative brief`, `Bắt đầu làm thử` hoặc `Dừng việc` để thao tác bảng việc từ chat.
- Tên gọi mơ hồ như `Ân ơi` sẽ được hỏi lại để phân biệt Kim Chủ Ân và Trịnh Dĩ An. Khung nhận diện dựa vào tên hiện tại nên vẫn dùng được sau khi đổi tên.

Chat hiện dùng bộ nhận diện ý định và trạng thái task cục bộ, chưa nối mô hình AI hội thoại. Không bịa ra nghiên cứu hay kết quả công việc thật.

## Pretty Please qua YouTube

Trình phát nhúng dùng đúng [video người dùng cung cấp](https://www.youtube.com/watch?v=ufwB9Uja_wM), không tải hoặc đóng gói bản thu. Sau lần tương tác đầu tiên, trình phát xuất hiện trên tivi lớn trong văn phòng 3D; có thể cần bấm nút Play của YouTube theo chính sách trình duyệt. Nút **Mở trên YouTube** là đường dẫn dự phòng nếu video không cho nhúng hoặc không phát được trên thiết bị.

Chuyển sang YouTube sẽ dừng ambient; chuyển về ambient hoặc nhấn **Tắt tivi** sẽ gỡ iframe. Phát video cần Internet; bản HTML ngoại tuyến vẫn dùng được văn phòng, chat, task và nhạc ambient. Kiểm thử xác nhận URL video và các thao tác chuyển nguồn với iframe giả lập, không xác nhận bản thu thực tế phát được ở mọi khu vực/thiết bị.

## Chạy ứng dụng

Yêu cầu Node.js 22.12+ hoặc 24 và npm. Đã xác thực với Node.js 24.

```sh
cd /workspace/Team-Strategic-Planner
npm ci --no-audit --no-fund
npm run dev -- --port 5173
```

```sh
npm test
npm run build
npm run test:e2e
npm run build:demo
```

Kiểm thử trình duyệt sử dụng Chromium tại `/usr/bin/chromium`; đặt `CHROMIUM_PATH` nếu cài ở vị trí khác. Playwright tự khởi chạy Vite nếu cần. Font, hình học 3D và icon được phục vụ cục bộ, không cần API key.

## Phạm vi hiện tại

- Các nhân vật là vai trò mô phỏng, chưa kết nối mô hình AI hay người dùng thật.
- Khung IMC được sinh từ mẫu; không tự khẳng định insight, benchmark hoặc dự báo hiệu quả.
- Ngân sách các giai đoạn là phân bổ tham khảo, cần điều chỉnh bằng nghiên cứu và báo giá thực tế.
- Brief, kế hoạch và trạng thái đầu việc chỉ lưu trong localStorage của trình duyệt. Xuất Markdown để sao lưu. Chưa có đăng nhập, đồng bộ hoặc phân quyền; tránh dùng dữ liệu mật trong bản demo.
- Dự án Mộc là dữ liệu mẫu để khám phá giao diện.
- Văn phòng cần WebGL; các tính năng brief và kế hoạch vẫn dùng được khi WebGL không khả dụng.

Để phát triển thành đội ngũ AI thực tế: bổ sung backend giữ API key, điều phối các vai trò, lưu trữ dự án có xác thực, nguồn nghiên cứu có trích dẫn, và quy trình duyệt nội dung trước khi gửi khách hàng.

## Công nghệ

Vite, JavaScript, Three.js, Lucide và font Be Vietnam Pro / DM Sans được đóng gói cục bộ. Không cần database hoặc dịch vụ bên ngoài cho bản trải nghiệm.

## Tivi lớn trong văn phòng

Tivi dùng chung nằm trên vách shoji cạnh khu làm việc; màn hình được chiếu đúng vị trí và phối cảnh 3D khi xoay, phóng to hoặc đổi kích thước cửa sổ. Đây là tivi bổ sung, tách khỏi màn hình trình bày trong phòng họp và 10 màn hình cá nhân.

- **Phát H2H** mở video YouTube người dùng đã chọn trên mặt tivi và chuyển camera tới góc xem gần. Các nút Play của YouTube vẫn thuộc trình phát gốc.
- **Xem gần tivi** hoặc tab **Tivi** đưa camera ngang màn hình; đèn treo phía trước được ẩn trong góc xem này để không che nội dung.
- **Trình chiếu kế hoạch** đưa brief, đối tượng và khung IMC của dự án mới nhất lên 3 slide; chuyển slide bằng nút mũi tên ngay trên tivi. Nếu chưa có dự án mới thì chiếu dữ liệu mẫu Mộc.
- **Tắt tivi**, chuyển sang ambient, quay camera ra sau tivi hoặc rời trang văn phòng sẽ dừng video; không phát video ở một trình phát bị ẩn.

Video được giữ trong iframe gốc và không sao chép vào WebGL texture. Lớp HTML được ánh xạ vào bốn góc màn hình, kết hợp mặt nạ độ sâu để các vật thể phía trước vẫn che khuất tivi đúng vị trí. Kiểm thử xác nhận URL video, mặt màn hình, bấm chuyển slide, xoay camera, mobile và thao tác dừng/chuyển nguồn bằng iframe giả lập; không khẳng định bản thu YouTube thực tế phát được trong mọi trình duyệt hoặc khu vực.

## Vườn Nhật bên văn phòng

Tab **Vườn Nhật** đưa camera ra khu vườn liền kề với ba cây anh đào, cánh hoa rơi, thác nước chuyển động, bảy cá koi bơi và ghế nghỉ ngắm hồ. **Toàn cảnh** cho thấy cả văn phòng lẫn vườn.

Nhấn **Ra vườn nghỉ** để tối đa hai nhân viên rảnh đi theo lối gỗ và đường đá ra ghế bên hồ. Họ ngồi nghỉ, trò chuyện bằng bong bóng chữ rồi quay về bàn. Khi nhận việc mới, họ quay lại bàn trước khi bắt đầu làm. Nhân viên đang có task không tham gia nghỉ; người rảnh cũng tự ghé vườn trong chu kỳ sinh hoạt. Bật **Chuyển động** để sử dụng việc đi lại và hiệu ứng nước, cá, hoa.

## Izakaya sau vườn

Quán bar nằm phía sau khu vườn, có quầy gỗ, ghế cao, kệ sake, đèn lồng đỏ, rèm noren và bàn nhỏ. Một nhánh nước thông từ hồ koi ra con suối sau vườn; cầu gỗ cong bắc qua suối là lối đi duy nhất từ vườn sang quán. Tab **Izakaya** xem gần quầy; **Cầu qua suối** xem lối nối và dòng nước.

Nhấn **Tan ca · Sang Izakaya** để bắt đầu giờ nghỉ theo lựa chọn của bạn, không phụ thuộc đồng hồ máy. Tối đa hai người rảnh đi bộ qua vườn, lên cầu rồi ngồi tại quầy và trò chuyện bằng bong bóng chữ. Trong giờ nghỉ này, nhân viên đã xong việc có thể tự sang quán. Nhân viên có task đang mở tiếp tục ở lại làm việc; nhận việc mới khi đang nghỉ sẽ quay về bàn trước khi bắt đầu xử lý. **Về văn phòng** kết thúc giờ nghỉ và gọi mọi người quay lại. Nút **Chuyển động** vẫn áp dụng cho cả khu bar và suối.

## Sảnh tiếp đón và cầu đèn lồng

Góc còn lại, phía sau văn phòng và đối diện Izakaya, là sảnh lễ tân riêng. Vách gỗ kín và một nhánh suối ngăn sảnh với Izakaya thành hai gian độc lập, mỗi gian có cầu vào riêng. Cửa chính đón khách mở ra sân ngoài bên trái sảnh, có lối tiếp cận lát đá, bậc thềm, mái hiên và rèm noren chàm. Quầy gỗ kumiko, biển Atelier và mèo thần tài xoay ra cửa chính này. Sofa cong và bàn trà oval nằm ở khu tatami phía trong, bên phải. Cầu đèn lồng sang văn phòng là lối nội bộ, tách khỏi cửa khách. Luồng khách đi từ sân ngoài qua cửa chính tới quầy, vòng qua đầu quầy rồi vào khu chờ, không phải đi qua văn phòng. Vách shoji, diềm mái gỗ, chân tường gỗ, tranh cuộn và góc tokonoma cắm hoa tạo phong cách Nhật rõ hơn. Suối được nối dài từ khu Izakaya qua giữa văn phòng và sảnh. Cầu gỗ cong treo tám đèn lồng kết nối hai khu; cửa mở phía sau văn phòng và lối giữa các đồ nội thất cho phép nhân viên đi qua thực sự.

Chọn **Sảnh tiếp đón** / **Xem sảnh & sofa** để xem gần; **Cửa đón khách** / **Xem cửa đón khách** xem lối vào từ sân ngoài; **Quầy lễ tân** / **Quầy & mèo thần tài** xem quầy và mèo; **Cầu đèn lồng** xem lối qua suối. **Ra sảnh tiếp khách** gọi tối đa hai người rảnh, ưu tiên Account, đi qua cầu rồi ngồi tại sofa và trò chuyện. Họ tự quay về sau lượt tiếp đón hoặc trở về bàn khi nhận việc mới. Nhân viên có task đang mở không được điều đi; tắt chuyển động đưa mọi người về bàn và ngừng vẫy tay của mèo. Tiếp khách và lời thoại là mô phỏng, chưa có khách hay lịch hẹn thật.

Tivi sảnh được gắn lên mặt sau vách quầy lễ tân, hướng về sofa. Chọn **Tivi sảnh** / **Xem tivi sảnh** để xem gần; đổi giữa **Lời chào Atelier** và **Tranh phong cảnh Nhật**, hoặc bật/tắt bằng hàng điều khiển **TIVI SẢNH**. Nội dung này được vẽ cục bộ, dùng được ngoại tuyến và khi tắt chuyển động. Tivi sảnh hoạt động độc lập với tivi YouTube trong văn phòng.
