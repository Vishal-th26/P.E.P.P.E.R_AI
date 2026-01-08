import cv2
import numpy as np
from insightface.app import FaceAnalysis

# Initialize InsightFace (detector + ArcFace)
face_app = FaceAnalysis(name="buffalo_l")
face_app.prepare(ctx_id=0, det_size=(640, 640))

def Gen_embeddings(images):

    embeddings = []

    for img_bytes in images:
        np_img = np.frombuffer(img_bytes,np.uint8)
        img = cv2.imdecode(np_img,cv2.IMREAD_COLOR)

        if img is None:
            continue

        faces = face_app.get(img)

        if len(faces) == 0:
            print(f"No face detected in {img}")
            continue

        # TO Take the mostconfident face
        face = max(faces, key=lambda f: f.det_score)

        embedding = face.embedding
        embedding = embedding / np.linalg.norm(embedding)     #normalize the avg embeddings as well

        embeddings.append(embedding)
        del img,np_img                  #to delete the images

    if len(embeddings) == 0:
        raise Exception("No faces detected in any images")

    return np.mean(embeddings,axis=0), len(embeddings)


                                                       

