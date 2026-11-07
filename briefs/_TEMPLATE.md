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
