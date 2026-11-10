import sys, cv2, numpy as np, json, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions
src, out, segm = sys.argv[1], sys.argv[2], sys.argv[3]
im = cv2.imread(src)
S, L, T = 700, 263, 212
crop = im[T:T + S, L:L + S].copy()
def hexof(bgr): return '#%02x%02x%02x' % (int(bgr[2]), int(bgr[1]), int(bgr[0]))
skin = np.median(im[590:630, 540:580].reshape(-1, 3), axis=0)
hair = np.median(im[300:340, 500:560].reshape(-1, 3), axis=0)
# segmentasi per piksel (kelas: 0 latar, 1 rambut, 2 kulit badan, 3 kulit wajah, 4 baju, 5 lain)
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(base_options=BaseOptions(model_asset_path=segm), output_category_mask=True))
cm = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))).category_mask.numpy_view()
cm = cv2.resize(cm, (S, S), interpolation=cv2.INTER_NEAREST)
crop[(cm == 0) | (cm == 5)] = hair            # latar -> rambut (belakang kepala = rambut)
crop[(cm == 4) | (cm == 2)] = skin            # kerah/baju -> kulit leher
crop = cv2.GaussianBlur(crop, (5, 5), 0)
# sel seram: rongga mata gelap dengan tepi lembut, mulut sedikit terbuka gelap, kulit memucat
creepy = crop.astype(np.float32)
mask = np.zeros((S, S), np.float32)
for (x, y) in ((511 - L, 525 - T), (645 - L, 506 - T)):
    cv2.ellipse(mask, (x, y), (40, 30), 0, 0, 360, 1.0, -1)
cv2.ellipse(mask, (582 - L, 674 - T), (30, 12), 0, 0, 360, 0.85, -1)
mask = cv2.GaussianBlur(mask, (0, 0), 9)[..., None]
pale = creepy * 0.55 + np.array([150, 150, 145], np.float32) * 0.3      # pucat kebiruan
keep = (cm == 0) | (cm == 5) | (cm == 1)
pale[keep] = creepy[keep] * 0.8
creepy = pale * (1 - mask) + np.array([6, 5, 5], np.float32) * mask
creepy = np.clip(creepy, 0, 255).astype(np.uint8)
cell = 64
a = cv2.resize(crop, (cell, cell), interpolation=cv2.INTER_AREA)
b = cv2.resize(creepy, (cell, cell), interpolation=cv2.INTER_AREA)
cv2.imwrite(out, np.hstack([a, b]))
cv2.imwrite(out.replace('.png', '_preview.png'), cv2.resize(np.hstack([a, b]), (512, 256), interpolation=cv2.INTER_NEAREST))
print(json.dumps(dict(skin_hex=hexof(skin), hair_hex=hexof(hair))))
