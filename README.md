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
- Chọn nhân vật để **Chào hỏi**, **Động viên**, **Nhắc nghiêm** vui vẻ, hoặc **Giao việc**. Bong bóng thoại xuất hiện tại nhân vật; nhật ký bên dưới giữ các phản hồi gần đây.
- **Bàn điều phối** lưu đầu việc và lịch sử trên trình duyệt. **Làm thử · mô phỏng** chạy khoảng 5,5 giây rồi tạo checklist theo chuyên môn và báo xong. Nút **Xem bản nháp** mở nội dung thật đã sinh; đây là mẫu cố định theo vai trò, chưa có agent AI nghiên cứu hoặc xử lý nội dung thật.
- Có thể **Dừng**, **Đánh dấu xong** thủ công hoặc xóa việc. Hủy một lượt làm thử ngăn thông báo hoàn thành sau đó. Đầu việc đang làm được khôi phục khi tải lại trang.
- Nhạc ambient ngũ cung do Web Audio tổng hợp cục bộ, không tải nhạc từ bên ngoài. Trình duyệt cần lần chạm/bấm phím đầu tiên để cho phép phát. Menu **♫** có nút bật/tắt, âm lượng và lựa chọn đọc lời thoại; ghi nhớ tắt nhạc khi tải lại. Nhạc tạm dừng khi tab ẩn.
- Giọng đọc dùng Speech Synthesis nếu thiết bị có giọng tiếng Việt; mặc định tắt. Khi không có giọng đọc, lời thoại văn bản vẫn hoạt động. Việc nghe được âm thanh thực tế phụ thuộc thiết bị/đầu ra âm thanh; kiểm thử tự động xác nhận AudioContext phát và trạng thái điều khiển.

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
