# BÀI LÀM – ĐÁNH GIÁ NĂNG LỰC FRONTEND (K24)

- **Mã đề:** 01
- **Họ tên:** Lê Trung Đông
- **Lớp:** CNTT3
- **Link repository:** https://github.com/ptitvn/ktr_dgnl_buoi26-11-26.git
- **Hệ điều hành (Windows/macOS):** Windows
- **Mã commit P2 đã nộp trước phút 90 (gõ `git log --oneline -1`):** (Chưa commit riêng cho dự án)
- **Phiên bản Node.js (gõ `node -v`):** v22.18.0

## 4.1. Giao diện danh sách sản phẩm

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin. Đánh dấu `[x]` vào các mục đã làm để tự kiểm tra.

- [x] 4.1.1. Bố cục trang
- [x] 4.1.2. Bảng sản phẩm
- [x] 4.1.3. Định dạng dữ liệu
- [x] 4.1.4. Hiển thị trên điện thoại

## 4.2. Thêm, sửa, xoá sản phẩm qua API

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin.

- [x] 4.2.1. Tải danh sách
- [x] 4.2.2. Form thêm sản phẩm
- [x] 4.2.3. Gửi form
- [x] 4.2.4. Sửa sản phẩm
- [x] 4.2.5. Xoá sản phẩm

## 4.3. Tìm kiếm, lọc và phân trang

> Pha 2 – mức AI-2 (được dùng AI, ghi nhật ký ở Mục 4.3.5).

> Mục 4.3.1 đến 4.3.3 và ý c của Mục 4.3.4 chấm trực tiếp trên mã nguồn.

- [x] 4.3.1. Tìm kiếm và lọc
- [x] 4.3.2. Phân trang
- [x] 4.3.3. Đồng bộ URL

### 4.3.4. Phản biện mã do AI sinh

#### a) Thao tác làm danh sách hiển thị sai

Các bước thao tác:

```text
1. Chạy mock API ở chế độ chậm bằng lệnh: npm run api:cham (các request có từ khoá q bắt đầu bằng "ban" bị trễ 2,5 giây; các request khác trễ 0,1 giây).
2. Mở trang danh sách sản phẩm (/products).
3. Gõ "ban" vào ô tìm kiếm và chờ qua thời gian debounce để gửi request GET /api/products?q=ban.
4. Ngay sau khi request đầu được gửi (trong vòng dưới 2 giây), xoá "ban" và gõ "chuot" để gửi request GET /api/products?q=chuot.
```

Kết quả hiển thị:

```text
Sau 0,1 giây, bảng hiển thị danh sách chuột tương ứng với "chuot". Tuy nhiên khoảng 2,4 giây sau, khi request cũ (q="ban") trả về muộn hơn, bảng bất ngờ đổi lại thành danh sách sản phẩm có từ khoá "ban" trong khi ô tìm kiếm vẫn đang hiển thị "chuot".
```

Kết quả đúng:

```text
Bảng phải giữ nguyên kết quả của truy vấn mới nhất ("chuot"); request cũ ("ban") phải bị huỷ (abort) hoặc kết quả trả về muộn của nó phải bị bỏ qua, không được ghi đè state và không làm tắt trạng thái loading của request mới.
```

#### b) Vì sao hook hiển thị sai

Hook `src/ai/useProductSearch_ai.js` không dùng `AbortController` để huỷ request cũ và không có biến cờ kiểm tra hiệu lực (`cancelled`) trong `useEffect`, dẫn đến lỗi race condition khi các phản hồi API về không theo thứ tự gửi. Khi request cũ hoàn tất sau request mới, nó vẫn gọi `setData`, `setTotal` và `setLoading(false)`, làm ghi đè kết quả mới nhất bằng dữ liệu cũ. Ngoài ra, nếu request bị huỷ chủ động, đoạn `catch` vẫn gán `CanceledError` vào `error`.

#### c) Hook đã sửa

> Chấm trực tiếp trên file src/hooks/useProductSearch.js và trang danh sách.

### 4.3.5. Nhật ký dùng AI (giữ – sửa – loại bỏ)

> Ghi ít nhất 2 lần dùng AI có ảnh hưởng đến mã nộp. Không dùng AI trong Pha 2 thì xoá bảng và ghi "Không sử dụng AI trong Pha 2".

| Lần | Câu lệnh chính gửi cho AI | Đoạn mã hoặc ý AI đưa ra (file) | Quyết định (giữ/sửa/loại bỏ) | Lý do | Bằng chứng kiểm chứng (chạy thử gì, kết quả) |
|---|---|---|---|---|---|
| 1 | Sửa lỗi race condition trong `useProductSearch_ai.js` khi gõ nhanh ở chế độ API chậm | Đề xuất dùng `AbortController` truyền `signal` vào `api.get` kết hợp cờ `cancelled` trong `src/hooks/useProductSearch.js` | Sửa | Bổ sung bỏ qua lỗi `CanceledError` / `axios.isCancel(err)`, chuẩn hoá `q.trim()` và `page >= 1`, thêm hàm `reload` để tái tải sau khi xoá hoặc thử lại khi lỗi 500 | Chạy `npm run api:cham`, gõ `"ban"` rồi đổi sang `"chuot"`: request `"ban"` bị abort trên server, bảng giữ đúng kết quả `"chuot"` |
| 2 | Viết logic đồng bộ bộ lọc tìm kiếm, lọc danh mục, trạng thái và phân trang với URL bằng `useSearchParams` | Tạo helper cập nhật `URLSearchParams` trong `src/pages/ProductListPage.jsx` và debounce ô tìm kiếm 300ms | Sửa | Bổ sung reset `page=1` khi đổi `q`/`category`/`status`, loại bỏ param rỗng hoặc `page=1` khỏi URL, đồng thời tự chuẩn hoá `page` âm hoặc vượt quá `totalPages` | Thử truy cập `/products?page=-3`, `/products?page=999`, và gõ `"   "` trên trình duyệt: URL tự chuẩn hoá về trang hợp lệ và hiển thị đúng dữ liệu |

## Ghi chú (không tính điểm)

- **Từ khoá chỉ có khoảng trắng (`q = "   "`):** Trim chuỗi `q` trước khi đồng bộ lên URL và trước khi gọi API trong `useProductSearch`, tránh gửi truy vấn rỗng lên URL hoặc làm nhấp nháy danh sách không cần thiết.
- **`page` âm hoặc không hợp lệ (`page=-3`, `page=abc`, `page=0`):** Hàm `normalizePage` trong `src/utils/format.js` đưa về `1`, đồng thời `ProductListPage` thay thế URL bằng `replace: true` để URL sạch và không gây lỗi phân trang.
- **`page` vượt quá tổng số trang (`page=999`):** Khi tải xong (`total > 0`), nếu `page > Math.ceil(total / 10)` thì tự động điều hướng (`replace: true`) về trang cuối hợp lệ (`totalPages`).
- **Xoá phần tử cuối cùng của trang cuối (`page > 1`):** Sau khi xoá thành công sản phẩm duy nhất còn lại trên trang hiện tại, tự động lùi về `page - 1` thay vì hiển thị trang trống.
- **Chống bấm gửi nhiều lần & lỗi từ server:** Nút lưu/xoá bị vô hiệu hoá trong khi đang gửi request; lỗi `400`/`409` trả về `{ message, field }` được hiển thị trực tiếp ngay dưới trường tương ứng (ví dụ trùng SKU).
