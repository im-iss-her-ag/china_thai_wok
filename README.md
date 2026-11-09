# China-Thai-Wok – Website

Astro 5 (static), deploy lên Cloudflare Pages. Thiết kế: `ui-kit-v3.html` (đã chốt).

## Chạy thử
```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # xuất ra dist/
npm run preview
```

## Cấu trúc
```
data/menu.json              Toàn bộ menu (143 món), thông tin quán, mã dị ứng/phụ gia
src/lib/site.ts             Cấu hình: món đặc trưng, ảnh theo danh mục, thanh thông báo (notice)
src/assets/images/          Ảnh (tự tối ưu sang WebP khi build) + CREDITS.md
src/layouts/Base.astro      Header, footer, SEO, JSON-LD Restaurant
src/pages/                  index (Startseite), speisekarte, impressum, datenschutz, 404
src/styles/global.css       Toàn bộ style
src/scripts/main.ts         Hiệu ứng (cursor, zoom, scroll ngang, lọc menu…)
```

## Thay ảnh
Ghi đè file trong `src/assets/images/` **giữ nguyên tên** (jpg/png/webp đều được), build lại.
Ảnh hiện tại là ảnh tạm từ Pexels (Pexels License) – xem `CREDITS.md`.

| File | Dùng ở đâu |
|---|---|
| hero-wok | Ảnh tròn ở hero, ảnh chia sẻ (OG) |
| zoom-wok | Section "Ein Blick in den Wok" (full màn hình) |
| cuisine-china / -thai / -wok / -udon | 4 thẻ "Vier Welten" |
| dish-* | Món đặc trưng + ảnh danh mục trong Speisekarte |
| bg-laternen | Nền cố định section "Über uns" |
| party / dish-ente | 2 khối chữ trái – ảnh vuông phải |
| gastraum (ảnh thật của quán) | Slide 1 "Unser Restaurant" + ảnh khối "Besuchen Sie uns" |
| interior-4, party | Slide 2–3 "Unser Restaurant" (interior-1…3 không còn dùng – ảnh quán khác) |

## Sửa nội dung
- Món / giá: `data/menu.json` (`"soldOut": true` → hiện "Heute aus").
- Món đặc trưng: mảng `signature` trong `src/lib/site.ts`.
- Đánh giá Google / Instagram: `social` trong `src/lib/site.ts` (trích nguyên văn, tên chỉ Vorname + chữ cái đầu họ).
- Giờ mở cửa: `src/lib/hours.ts` (hiển thị, JSON-LD và badge "Jetzt geöffnet" đều đọc từ đây).
- Thanh thông báo (vd. nghỉ lễ): `notice` trong `src/lib/site.ts`.
- Impressum / Datenschutz: dán nội dung vào `src/pages/impressum.astro`, `src/pages/datenschutz.astro` (chỗ `TODO`).

## Deploy Cloudflare Pages
1. Đẩy repo lên GitHub/GitLab → Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Framework preset: **Astro** · Build command: `npm run build` · Output: `dist`.
3. Environment variables: `NODE_VERSION=20`, `SITE_URL=https://<domain-thật>`.
4. Gắn custom domain; cập nhật domain trong `public/robots.txt`.

## Ghi chú
- Font Bricolage Grotesque tự host (không gọi Google Fonts – DSGVO).
- Google Maps chỉ tải sau khi bấm "Karte laden".
- Không cookie, không tracking → không cần cookie banner.
- Phase 2: trang `/admin` (đăng nhập user/pass trong ENV, lưu D1, nút "Veröffentlichen").
