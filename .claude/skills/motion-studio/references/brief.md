# Brief

Brief adalah kontrak antara permintaan dan kode. Semua angka di komponen harus bisa ditelusuri ke brief, dan setiap revisi memperbarui brief dulu. Simpan di `briefs/<Nama>.md`.

Struktur gabungan dari dua pola yang terbukti: brief "Launch" (layout + event bernomor frame, cocok untuk aset) dan brief "Watering" (beat + emosi + acting, cocok untuk cerita dan karakter). Bagian yang tidak relevan boleh dihapus.

## Template

```markdown
# <Nama> (<Kategori>)

## GOAL
Satu kalimat: apa yang harus dipahami atau dirasakan penonton.
Dipakai di: <video apa / posisi di timeline>.

## DELIVERY
- Komposisi: <Nama>-Portrait / -Landscape / -Square (yang dirender: ...)
- 30 fps, durasi default <x> dtk (prop durationInSeconds)
- Semua nomor frame di bawah adalah frame GLOBAL komposisi.

## PROPS (editable di Studio)
| prop | tipe | default | batas |
| --- | --- | --- | --- |
| title | string | "..." | maks 2 baris di portrait |
| accent | color | #8B5CF6 | |
| durationInSeconds | number | 5 | 2–30 |

## LOOK
Palet, font + weight, gaya (flat / glass / 3D), satu hal yang jadi ciri khas.

## LAYOUT (per orientasi, dalam unit u = sisi pendek/1080)
- Portrait: ... (zona aman bawah untuk UI platform)
- Landscape: ...
- Square: ...
- Urutan layer: background → ... → teks.
- Batas teks: lebar maks, jumlah baris maks.

## BEATS
| frame | dtk | kejadian | fokus mata | emosi/kesan |
| --- | --- | --- | --- | --- |
| 0 | 0.00 | aksen tumbuh dari bawah | aksen | yakin |
| 5 | 0.15 | nama naik + fade | nama | |
| 9 | 0.30 | peran menyusul | peran | |
| 9–132 | | hold, terbaca | teks | tenang |
| 135 | 4.50 | keluar: turun + fade | | |

## MOTION
Kurva per kejadian (EASE.out / SPRING.snappy / ...), overshoot ya/tidak, stagger, apa yang tetap diam.

## SOUND (opsional)
| frame | cue |
| --- | --- |

## CHECKS
- Frame still yang wajib dilihat: 18, 60, 130 (+ teks terpanjang)
- Tidak ada yang keluar margin aman; teks terbaca di lebar 360 px
- <kriteria khusus aset ini>

## DECISIONS
- DECISION: <pilihan yang diambil tanpa ditanyakan, dan alternatifnya>
```

## Aturan menulis

- **Detik dulu, lalu frame.** Pikirkan dalam detik, tulis keduanya. 0,5 dtk = 15 frame pada 30 fps.
- **Satu kejadian, satu baris.** Kalau satu baris berisi dua hal yang bergerak, pecah dan beri jarak 3–6 frame.
- **Fokus mata per baris.** Setiap momen hanya punya satu hal yang "memiliki layar". Kalau dua elemen berebut, tunda salah satunya.
- **Untuk karakter atau cerita, tambahkan satu kata emosi di akhir tiap beat.** Kalau deretan kata emosi saja sudah bercerita, naskahnya lolos. Tambahkan bagian ACTING: mata bergerak 6–10 frame sebelum badan, antisipasi, squash & stretch, napas dan kedip tidak pernah berhenti.
- **Untuk klip produk/launch:** shot adalah event, yaitu keadaan awal → kursor ke aksi → tekanan terdaftar → hasil muncul → hasil ditahan sampai terbaca.
- **Label nilai dari referensi:** `MEASURED` (dibaca dari frame), `ESTIMATED` (kira-kira), `DECISION` (pilihan kreatif).

## Mengubah permintaan singkat jadi brief

Permintaan: "bikin lower third nama + jabatan, gaya default."

Keputusan yang diambil sendiri (dicatat sebagai DECISION): durasi 5 dtk, aksen bar ungu tumbuh dulu, nama Montserrat 800, jabatan Inter 600 dengan opacity 0.8, panel gelap semi transparan, posisi kiri bawah. Di portrait dinaikkan supaya tidak tertutup UI platform. Keluar 0,4 dtk dengan EASE.in.

Yang perlu ditanyakan hanya kalau tidak bisa ditebak, misalnya apakah ada logo di samping nama.
