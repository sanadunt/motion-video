import sys, json, mediapipe as mp, numpy as np, cv2
from mediapipe.tasks.python import vision, BaseOptions
img_path, model = sys.argv[1], sys.argv[2]
det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path=model), num_faces=1))
im = cv2.imread(img_path); h, w = im.shape[:2]
r = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(im, cv2.COLOR_BGR2RGB)))
lm = r.face_landmarks[0]
P = lambda i: (lm[i].x * w, lm[i].y * h)
xs = [p.x * w for p in lm]; ys = [p.y * h for p in lm]
out = dict(w=w, h=h, eyeL=P(33), eyeR=P(263), eyeLc=P(468) if len(lm) > 468 else P(159), eyeRc=P(473) if len(lm) > 473 else P(386), mouth=P(13), chin=P(152), brow=P(10), bbox=[min(xs), min(ys), max(xs), max(ys)])
print(json.dumps({k: [round(v, 1) for v in val] if isinstance(val, (list, tuple)) else val for k, val in out.items()}))
