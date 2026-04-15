# Madmonos — Production Deployment Guide

> **Geçiş notu:** Eski sistem statik export (`out/` dizini + `serve`) kullanıyordu.  
> Yeni sistem **Next.js SSR** — Node.js process, `next start`, PM2. `out/` artık kullanılmıyor.

---

## Ön Koşullar (Bir Kez)

Sunucuda şunların kurulu olduğunu doğrula:

```bash
node -v        # 18.x veya üzeri olmalı (Next.js 16 gereksinimi)
npm -v         # 9.x veya üzeri
pm2 -v         # kurulu değilse: npm install -g pm2
```

Node.js 18+ yoksa kurulum:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## İlk Deployment (Sıfırdan)

```bash
# 1. Proje dizinine git (yoksa oluştur)
cd /home/cloudpanel/htdocs   # CloudPanel default htdocs, değiştirebilirsin

# 2. Eski out/ klasörünü temizle
rm -rf madmonos.com/out

# 3. Repo'yu clone'la (yoksa)
git clone https://github.com/KULLANICI/madmonos.com.git
cd madmonos.com

# 4. Bağımlılıkları yükle
npm ci --omit=dev

# 5. Log klasörünü oluştur (ecosystem.config.js için)
mkdir -p logs

# 6. .env dosyasını oluştur (aşağıdaki Environment Variables bölümüne bak)
cp .env.example .env   # yoksa elle oluştur: nano .env

# 7. Üretim build'ini al
npm run build

# 8. PM2 ile başlat
pm2 start ecosystem.config.js

# 9. PM2'yi sistem başlangıcında otomatik çalışacak şekilde kaydet
pm2 save
pm2 startup   # çıktıdaki komutu kopyalayıp çalıştır (sudo ile)
```

---

## Güncelleme Deployment (Git Pull)

Her deploy için:

```bash
cd /path/to/madmonos.com

# 1. Eski out/ varsa sil (geçiş sonrası artık oluşmuyor ama emin olmak için)
rm -rf out

# 2. Güncel kodu çek
git pull origin main

# 3. Bağımlılıkları güncelle
npm ci --omit=dev

# 4. Build al
npm run build

# 5. PM2'yi yeniden başlat (sıfır downtime için reload kullan)
pm2 reload madmonos
```

> `pm2 reload` — zero-downtime reload yapar (eski process yenisi ayağa kalkana kadar istekleri karşılamaya devam eder).  
> `pm2 restart` — anlık downtime içerir, acil durum dışında tercih etme.

---

## Environment Variables

Proje kökünde `.env` dosyası oluştur:

```bash
nano /path/to/madmonos.com/.env
```

Aşağıdaki değerleri ekle:

```env
NODE_ENV=production
PORT=3000

# Canonical URL — JSON-LD ve Open Graph için (default: https://madmonos.com)
NEXT_PUBLIC_SITE_URL=https://madmonos.com

# Opsiyonel: Blog Google Sheet için farklı bir GID kullanmak istersen
# BLOG_SHEET_GID=0

# Opsiyonel: Discovery Form lead'lerini bir webhook'a iletmek istersen
# LEAD_MOCK_WEBHOOK_URL=https://hook.eu1.make.com/xxxxx
```

> `NEXT_PUBLIC_SITE_URL` zaten default olarak `https://madmonos.com` hardcoded'dur.  
> Değiştirmeyeceksen bu satırı ekleme zorunluluğun yok.

---

## CloudPanel — Nginx Reverse Proxy Ayarı

CloudPanel'de site için şu şekilde bir Node.js reverse proxy ayarla:

**CloudPanel > Sites > madmonos.com > Vhost Config** altına ekle (veya Node.js app olarak ekle):

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

> `X-Forwarded-For` header'ı, `/api/leads` endpoint'indeki IP rate-limiting için zorunludur.  
> Bu satır olmadan tüm istekler aynı IP'den geliyormuş gibi görünür ve rate limit hatalı tetiklenir.

**SSL:** CloudPanel'in Let's Encrypt entegrasyonunu kullan — Node.js process'in SSL'e ihtiyacı yok, Nginx halleder.

---

## PM2 Komutları

```bash
pm2 list                    # çalışan process'leri listele
pm2 logs madmonos           # canlı log takibi
pm2 logs madmonos --lines 100   # son 100 satır
pm2 reload madmonos         # zero-downtime yeniden başlatma
pm2 stop madmonos           # durdur
pm2 delete madmonos         # process'i PM2'den kaldır
pm2 monit                   # CPU/RAM monitör
```

---

## Kontrol Listesi — Deploy Sonrası

Aşağıdakileri tarayıcıdan doğrula:

- [ ] `https://madmonos.com` → ana sayfa yükleniyor
- [ ] `https://madmonos.com/robots.txt` → içerik görünüyor (AI crawler rule'ları var)
- [ ] `https://madmonos.com/sitemap.xml` → XML formatında URL listesi
- [ ] `https://madmonos.com/llms.txt` → metin dosyası yükleniyor
- [ ] `https://madmonos.com/api/leads` → `POST` isteğine `415` dönüyor (doğru cevap)
- [ ] `https://madmonos.com/blog` → yazılar listeleniyor
- [ ] Discovery brief butonuna tıklayınca modal açılıyor
- [ ] Footer'da "AI Engine: Active · Last Sync: HH:MM:SS UTC" görünüyor
- [ ] `pm2 logs madmonos` → hata yok

---

## Dikkat Edilmesi Gerekenler

### `public/_headers` dosyası
Bu dosya Netlify/Cloudflare Pages static deployment için yazılmıştı. SSR ortamında Nginx tarafından okunmaz — zararsız ama işlevsiz. Nginx tarafında cache-control ayarlamak istersen CloudPanel'in vhost config'ine ekleyebilirsin (gerekli değil şimdilik).

### `out/` klasörü
Artık oluşturulmuyor. `npm run build` artık `.next/` dizinine çıktı üretir, `out/` değil. İlk deploymant'ta eski `out/` klasörünü silebilirsin.

### Node.js memory
`ecosystem.config.js`'te `max_memory_restart: "512M"` ayarlı. Sunucunda RAM kısıtı varsa `256M`'ye düşürebilirsin.

---

## Blog Sistemi — Yeni Yazılar İçin Build Gerekiyor mu?

**Kısa cevap: Hayır. Yeni blog yazıları için build almana gerek yok.**

### Nasıl çalışıyor?

Blog yazıları Google Sheets'ten çekilir ve **ISR (Incremental Static Regeneration)** ile önbelleğe alınır:

```
revalidate: 3600   →   1 saatte bir Google Sheets'e yeniden istek atılır
```

| Durum | Ne olur? |
|---|---|
| Mevcut bir yazıyı düzenledin | Maksimum **1 saat** içinde otomatik güncellenir |
| Yeni bir yazı ekledin (`/blog/yeni-slug`) | İlk ziyaretçi sayfayı açtığında dinamik olarak render edilir, sonra 1 saat cache'lenir |
| `/blog` liste sayfası | Saatte bir yeniden oluşturulur, yeni yazı görünür |
| Yazı sildiysen | 1 saat içinde listeden düşer; eski slug'a gidilirse 404 döner |

### Özet akış:
```
Google Sheets'e satır ekle
        ↓
Bekle (max 1 saat)
        ↓
/blog listesinde yazı görünür
        ↓
/blog/yeni-slug ilk ziyarette oluşturulur, cache'lenir
```

### Hemen yayınlamak istersen:
Build almak yerine **PM2'yi reload** etmek yeterli — cache temizlenir ve Sheets'ten yeniden çekilir:

```bash
pm2 reload madmonos
```

---

## Sorun Giderme

**Port 3000 meşgul:**
```bash
sudo lsof -i :3000
pm2 delete madmonos
pm2 start ecosystem.config.js
```

**Build hatası (ENOMEM):**
```bash
# Node.js için daha fazla memory ayır
NODE_OPTIONS="--max-old-space-size=1024" npm run build
```

**PM2 process yok oldu:**
```bash
pm2 resurrect   # kayıtlı process listesini geri yükle
```

**Nginx 502 Bad Gateway:**
```bash
pm2 list          # madmonos çalışıyor mu?
pm2 logs madmonos # hata mesajı var mı?
```
