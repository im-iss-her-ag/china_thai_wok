# China-Thai-Wok – Định hướng giao diện

> **Cập nhật:** Hướng thiết kế đã chốt là **ui-kit-v3.html** (Jade + Gold + Glut, font duy nhất Bricolage Grotesque, không chữ Hán, phong cách pan-Asian). Các mục màu/font bên dưới là bản nháp cũ – v3 và `src/styles/global.css` là nguồn chuẩn.

> Website tiếng Đức cho quán China-Thai-Wok (Renthofstr. 8, 98574 Schmalkalden).
> Tham khảo: dynastyhouse.com.vn. Giữ cảm giác **thanh**, tiết chế, nhiều khoảng trắng, nhưng có cá tính riêng và chuyển động tinh tế hơn.
> Tech: Astro (không React), deploy Cloudflare Pages. Trang: **Startseite, Speisekarte, Impressum, Datenschutz** + `/admin`.

---

## 1. Concept: „Papier & Feuer“ (Giấy & Lửa)

- **Giấy**: nền giấy gạo ấm, chữ như mực tàu, nhiều khoảng thở → sự thanh.
- **Lửa**: điểm nhấn duy nhất là hơi nóng / ánh lửa wok → năng lượng, “Schnellküche – immer frisch”.
- Ba thế giới **China · Thai · Wok** là xương sống câu chuyện.
- Tránh: đỏ-vàng chói, rồng, đèn lồng kiểu quán Á “cliché”, font giả chữ Hán.

Một câu định vị (tiếng Đức, dùng ở hero/meta):
> *„Feine asiatische Küche aus dem Wok – immer frisch zubereitet.“*

---

## 2. Màu sắc

### Bảng màu

| Token | Hex | Vai trò | Tỷ lệ dùng |
|---|---|---|---|
| `--paper` | `#F6F1E7` | Nền chính (giấy gạo) | ~60% |
| `--sand` | `#ECE4D6` | Nền section xen kẽ, card | ~15% |
| `--ink` | `#1E1C1A` | Chữ chính, tiêu đề | ~15% |
| `--ink-soft` | `#6B655C` | Chữ phụ, mô tả món, mã dị ứng | — |
| `--line` | `#D9CFBE` | Đường kẻ, viền mảnh | — |
| `--lacquer` | `#B23A2B` | **Màu chủ đạo nhấn**: CTA, con dấu, giá nổi bật, icon cay | ≤5% |
| `--jade` | `#5E7D6E` | Phụ: nhãn Thai, nhãn vegetarisch | ≤3% |
| `--gold` | `#C9A15B` | Đường kẻ 1px, số thứ tự, chi tiết trang trí | ≤2% |
| `--night` | `#141312` | Nền footer + section “Am Wok” | ~5% |

### Quy tắc
- **Chủ đạo = kem + mực**. Đỏ sơn mài là “con dấu”: xuất hiện ít nhưng luôn ở chỗ quan trọng (nút gọi điện, logo dấu, giá).
- Mỗi màn hình tối đa **1 phần tử đỏ** nổi bật.
- Section tối (`--night`) chỉ 2 chỗ: “Am Wok” và footer → tạo nhịp sáng–tối như ngày–đêm.
- Ảnh món được chỉnh tông ấm, hơi giảm bão hoà để hoà nền giấy.
- Tương phản chữ đạt WCAG AA (ink trên paper ≈ 15:1; ink-soft trên paper ≈ 5:1).

---

## 3. Typography

| Vai trò | Font | Weight | Cỡ (desktop → mobile) |
|---|---|---|---|
| Display / H1 | **Cormorant Garamond** | 300, italic 400 | 96–120px → 48px |
| H2 | Cormorant Garamond | 400 | 56px → 36px |
| H3 (tên món) | Cormorant Garamond | 500 | 22px → 20px |
| Body | **Manrope** | 400 | 17px, line-height 1.7 |
| Label / eyebrow | Manrope UPPERCASE | 500 | 12px, letter-spacing .2em |
| Giá | Manrope tabular-nums | 500 | 17px |
| Họa tiết chữ Hán | Noto Serif SC (subset: 中 泰 鑊 火 味) | 300 | 200–400px, opacity 4–6% |

- Tự host woff2 trong `/public/fonts` (DSGVO – không gọi Google Fonts CDN).
- Tiêu đề lớn dùng **từ nghiêng** để nhấn: „Aus dem *Wok*, direkt zu dir.“
- Eyebrow có số thứ tự vàng: `01 — UNSERE KÜCHE`.

---

## 4. Ngôn ngữ thiết kế riêng (signature elements)

1. **Con dấu đỏ (Siegel)** – ô vuông đỏ bo nhẹ chứa chữ 鑊 (wok). Dùng làm logo phụ, favicon, dấu “Empfehlung des Hauses” trên món signature.
2. **Vết mực (Tusche)** – SVG nét cọ, hiện ra bằng mask khi cuộn tới; đặt sau tiêu đề section.
3. **Vòng wok** – vòng tròn nét 1px màu vàng, xoay rất chậm, làm khung cho ảnh món tròn.
4. **Hơi nóng / khói** – SVG khói mảnh bốc lên từ ảnh món ở hero, chuyển động 6–8s, opacity thấp.
5. **Texture giấy** – noise mờ 3–4% phủ toàn trang.
6. **Chữ Hán khổng lồ mờ** – 中 / 泰 / 鑊 nằm sau các khối China / Thai / Wok.
7. **Đường kẻ chấm dẫn giá** – kiểu menu cổ điển: `Knusprige Ente ··········· 12,90 €`.
8. **Marquee mảnh** – dải chữ chạy ngang: „Frisch · Hausgemacht · Aus dem Wok · 鑊 ·“.

### Icon
- Nét mảnh 1.25px, tự vẽ SVG: ớt (scharf), lá (vegetarisch), giờ, điện thoại, xe giao hàng, map pin.
- Cay: 1 ớt = leicht scharf, 2 ớt = scharf.

---

## 5. Chuyển động

- Stack: **Lenis** (cuộn mượt) + **GSAP ScrollTrigger**. Không jQuery/AOS.
- Easing `power3.out`, 0.9–1.2s, stagger 0.08s.
- Kiểu xuất hiện:
  - Tiêu đề: tách dòng, trượt từ dưới lên trong mask.
  - Ảnh: `clip-path` mở từ trên xuống như cuộn giấy, ảnh scale 1.1 → 1.
  - Parallax tối đa 8–10%.
- Header: ẩn khi cuộn xuống, hiện khi cuộn lên; nền trong suốt → kem + blur khi rời hero.
- Hover món: ảnh nhích lên 4px, con dấu đỏ hiện.
- `prefers-reduced-motion` → tắt Lenis + parallax, chỉ fade.
- Animation chỉ dùng `transform`/`opacity` để giữ Lighthouse ≥ 95.

---

## 6. Layout chung

- Container: tối đa **1320px**, gutter 24px (mobile 16px).
- Grid 12 cột; nhiều section dùng bố cục **lệch** (5/7, 4/8) thay vì căn giữa đều → tinh tế hơn Dynasty.
- Khoảng cách section: 160px desktop / 96px mobile.
- Bo góc: 2px (gần như vuông, sang). Không dùng shadow đậm.

### Header (mọi trang)
```
[Logo Siegel + China-Thai-Wok]      Startseite   Speisekarte      [☎ 03683 400505]
```
- Nút điện thoại màu đỏ sơn mài = CTA chính (đặt món qua điện thoại).
- Mobile: logo + nút ☎ tròn + hamburger → overlay toàn màn hình nền kem, link lớn kiểu Cormorant, kèm giờ mở cửa.

### Footer (mọi trang, nền `--night`)
```
Logo Siegel lớn (mờ)
───────────────────────────────────────────
Adresse            Öffnungszeiten              Lieferservice
Renthofstr. 8      Mo  Ruhetag (außer Feiert.) 11:00–14:00 / 17:00–21:00
98574 Schmalkalden Di–So 10:30–15:00           ab 35 € in Schmalkalden
☎ 03683 400505            17:00–21:30          ab 60 € gratis Wein
───────────────────────────────────────────
© 2026 China-Thai-Wok · Impressum · Datenschutz
```

---

## 7. Startseite – bố cục từng section

| # | Section | Nội dung & thiết kế |
|---|---|---|
| 0 | **Header** | Trong suốt trên hero. |
| 1 | **Hero** | Full viewport. Trái (5 cột): eyebrow `SCHMALKALDEN · SEIT …`, **H1** „Chinesische & Thai Küche aus dem *Wok*“, câu phụ, 2 nút: **Jetzt anrufen** (đỏ) + **Speisekarte ansehen** (viền). Phải (7 cột): ảnh/video wok lửa (placeholder), khói SVG bốc lên, vòng wok vàng xoay chậm. Cuối hero: marquee mảnh. |
| 2 | **Intro / Philosophie** | Căn lệch. Câu lớn Cormorant: „Frisch zubereitet. Jeden Tag. Mit Feuer und Geduld.“ Vết mực phía sau. 3 con số nhỏ: *143 Gerichte · 18 Kategorien · 6 Tage die Woche*. |
| 3 | **China · Thai · Wok** | 3 cột cao (ảnh dọc 3:4), mỗi cột có chữ Hán khổng lồ mờ phía sau, tiêu đề, 1 câu mô tả, link „Zur Kategorie →“ (nhảy tới anchor trong Speisekarte). Hover: ảnh nổi lên, chữ Hán đậm lên nhẹ. |
| 4 | **Empfehlungen des Hauses** | Slider ngang 5–6 món signature (vd. Knusprige Ente, Pad Thai, Udon, Großgerichte). Card: ảnh tròn trong vòng wok, số món, tên, mô tả 1 dòng, giá, con dấu đỏ. Kéo/vuốt được. |
| 5 | **Am Wok** (nền tối) | Section điện ảnh: ảnh bếp lớn, pinned khi cuộn, 3 bước chữ hiện lần lượt: *Frische Zutaten → Große Hitze → Sofort serviert*. Ánh cam ấm nhẹ quanh ảnh. |
| 6 | **Lieferservice & Partyservice** | 2 khối song song nền `--sand`. Liefer: giờ giao, tối thiểu 35 €, từ 60 € tặng 1 chai vang. Party: tiệc, sinh nhật, công ty, Weihnachtsfeier → „Rufen Sie uns an“. |
| 7 | **Galerie** | Lưới so le 5–7 ảnh (món + không gian quán), mở ảnh lớn khi bấm. |
| 8 | **Besuchen Sie uns** | Trái: địa chỉ, giờ mở cửa dạng bảng, ngày hôm nay được tô đậm + trạng thái „Jetzt geöffnet / Geschlossen“. Phải: bản đồ dạng ảnh tĩnh, bấm mới tải Google Maps (DSGVO). |
| 9 | **Footer** | Như mục 6. |

**SEO Startseite**
- Title: `China-Thai-Wok Schmalkalden – Chinesisch & Thai Essen, Lieferservice`
- 1 H1 (hero), H2 cho từng section.
- JSON-LD `Restaurant` (địa chỉ, geo, giờ mở cửa 2 khung, telephone, servesCuisine, priceRange €, hasMenu → /speisekarte/).

---

## 8. Speisekarte – bố cục

| # | Phần | Thiết kế |
|---|---|---|
| 1 | **Page hero (thấp, ~50vh)** | Eyebrow `SPEISEKARTE`, H1 „Unsere Speisekarte“, câu: „Alle Hauptgerichte mit Reis – gegen Aufpreis von 3,00 € mit gebratenen Nudeln.“ Chữ 味 khổng lồ mờ. |
| 2 | **Thanh danh mục dính** | Dính dưới header khi cuộn. Pill ngang cuộn được: Vorspeisen · Gebratener Reis · … · Getränke (18 nhóm). Mục đang xem tự sáng (scrollspy). |
| 3 | **Bộ lọc nhỏ** | Toggle: 🌿 Vegetarisch · 🌶 Scharf · ô tìm kiếm (tên/số món). JS thuần, lọc tức thì. |
| 4 | **Các nhóm món** | Mỗi nhóm: H2 Cormorant + số thứ tự vàng + mô tả ngắn + ảnh ngang đại diện (tuỳ nhóm). Món hiển thị **2 cột** desktop, 1 cột mobile. |
| 5 | **Dòng món** | `21 Gebratener Reis mit Huhn ··········· 8,90 €` / dòng dưới: mô tả nhỏ màu ink-soft + mã `a, g, 2` + icon cay/chay. Món signature có con dấu đỏ nhỏ. Món hết hàng (từ admin): mờ + nhãn „Heute aus“. |
| 6 | **Udon** | Thêm hộp giải thích sốt A / B / C / E. |
| 7 | **Allergene & Zusatzstoffe** | Khối cuối trang nền `--sand`, 2 cột: danh sách mã 1–7 và a–k (bắt buộc theo LMIV). Mỗi mã trên dòng món có tooltip. |
| 8 | **CTA cuối** | „Hunger bekommen?“ + nút gọi điện lớn + giờ giao hàng. |

**SEO Speisekarte**
- Title: `Speisekarte – China-Thai-Wok Schmalkalden`
- H1 → H2 (nhóm, có `id` để anchor: `#ente`, `#thai-spezialitaeten`) → H3 (tên món).
- Toàn bộ menu là HTML thật (không chỉ PDF).
- JSON-LD `Menu` → `MenuSection` → `MenuItem` (giá EUR).

---

## 9. Impressum & Datenschutz

Nội dung bạn có sẵn. Mình chỉ làm khung:
- Page hero thấp (~30vh), H1.
- Văn bản 1 cột hẹp (max 720px), Manrope 16px, H2/H3 Cormorant.
- `noindex` không cần; giữ đơn giản, không animation nặng.

---

## 10. Admin (`/admin`)

Đơn giản, đúng nhu cầu khách low-tech:
- **Đăng nhập**: 1 form username + password. Giá trị so với biến môi trường `ADMIN_USER`, `ADMIN_PASSWORD` (đặt trong Cloudflare Pages → Settings → Environment variables, không nằm trong code).
  - Đăng nhập đúng → cookie phiên ký bằng `SESSION_SECRET` (HttpOnly, Secure, 7 ngày).
  - Giới hạn sai 5 lần / 15 phút.
- **Màn hình**: danh sách nhóm → món. Mỗi món sửa được: tên, mô tả, giá, mã dị ứng (checkbox), cay/chay, ẩn/hết hàng. Thêm/xoá món. Sửa giờ mở cửa + dòng thông báo (vd. „Betriebsurlaub 20.–27.12.“).
- **Nút „Veröffentlichen“**: lưu vào Cloudflare D1 rồi kích Deploy Hook → web cập nhật sau ~1 phút.
- Giao diện cùng tone giấy-mực, nút to, dùng tốt trên điện thoại, toàn tiếng Đức. Astro + JS thuần, không framework.

---

## 11. Ảnh & placeholder

- Chưa có ảnh thật → dùng placeholder tông ấm cùng tỷ lệ cuối cùng (hero 16:10, card 3:4, món tròn 1:1).
- Danh sách ảnh cần khách chụp sau: món signature (6), không gian quán (4), bếp/wok lửa (2–3, hoặc video 10s).
- Xuất AVIF/WebP, alt tiếng Đức mô tả món, tên file kiểu `knusprige-ente-mango.avif`.

---

## 12. Việc cần chốt

1. Đồng ý bảng màu và cặp font Cormorant + Manrope?
2. Logo: dùng con dấu 鑊 đề xuất, hay quán đã có logo?
3. Món nào là „Empfehlungen des Hauses“ (5–6 món)?
4. Có năm thành lập („seit …“) để đưa vào hero không?
