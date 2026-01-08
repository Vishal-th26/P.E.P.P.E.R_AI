import numpy as np
import os
from fastapi import FastAPI, Depends, HTTPException , File , UploadFile
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
import ast
import uuid
from passlib.context import CryptContext
from models import UserCreate , AuthRequest , MissingPersonCreate , MissingPersonResponse , Matchresult , Matchresponse , Authoritydecision
from database import session_Local
from database_models import LoginPage , AuthorityLogin , MissingPerson , FaceEmbedding , AuthorityDecision
from typing import List
from sklearn.metrics.pairwise import cosine_similarity
from backend_model.embeddingsGen import Gen_embeddings
from backend_model.match import  confidence_from_cosine 
from fastapi import Form, File, UploadFile
from typing import List , Optional
from datetime import datetime




app = FastAPI()

app.mount(
    "/reference_images",
    StaticFiles(directory="reference_images"),
    name="reference_images"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.options("/{path:path}")
async def options_handler(path: str):
    return Response(status_code=200)



def get_db():
    db = session_Local()
    try:
        yield db
    finally:
        db.close()




@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(LoginPage).all()
    return users


#passwordEncription
pwd = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd.verify(plain_password, hashed_password)



# LOGIN / SIGNUP COMBINED
@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):

    username = user.username.strip().lower()

    # check if user already exists
    existing_user = (
        db.query(LoginPage)
        .filter(LoginPage.username == username)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="User already exists. Please log in."
        )

    hashed_pwd = hash_password(user.password)

    new_user = LoginPage(
        username=username,
        password=hashed_pwd
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "Signup successful"
    }


@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):

    username = user.username.strip().lower()

    existing_user = (
        db.query(LoginPage)
        .filter(LoginPage.username == username)
        .first()
    )

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found. Please sign up."
        )

    if not verify_password(user.password, existing_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    # placeholder token (replace later with JWT)
    fake_token = f"token-{existing_user.seq_id}"

    return {
        "message": "Login successful",
        "token": fake_token
    }




@app.post("/authority/signup")
def authority_signup(data: AuthRequest, db: Session = Depends(get_db)):

    username = data.username.strip().lower()

    if db.query(AuthorityLogin).filter(
        AuthorityLogin.username == username
    ).first():
        raise HTTPException(
            status_code=409,
            detail="Authority already exists"
        )

    authority = AuthorityLogin(
        username=username,
        password=hash_password(data.password)
    )

    db.add(authority)
    db.commit()

    return {"message": "Authority signup successful"}

@app.post("/authority/login")
def authority_login(data: AuthRequest, db: Session = Depends(get_db)):

    username = data.username.strip().lower()

    authority = db.query(AuthorityLogin).filter(
        AuthorityLogin.username == username
    ).first()

    if not authority:
        raise HTTPException(
            status_code=404,
            detail="Authority not found"
        )

    if not verify_password(data.password, authority.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    return {
        "message": "Authority login successful",
        "token": f"authority-token-{authority.seq_id}"
    }





@app.post(
    "/register-missing-person",
    response_model=MissingPersonResponse
)
async def register_missing_person(
    name: str = Form(...),
    min_age: int = Form(...),
    max_age: int = Form(...),
    last_seen_location: Optional[str] = Form(None),
    emergency_contact: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    consent_given: bool = Form(...),
    images: List[UploadFile] = File(...),
    reference_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # ---- basic sanity checks ----
    if min_age > max_age:
        raise HTTPException(
            status_code=422,
            detail="min_age cannot be greater than max_age"
        )

    if len(images) < 3:
        raise HTTPException(
            status_code=422,
            detail="At least 3 images are required"
        )

    if reference_image and not consent_given:
        raise HTTPException(
            status_code=400,
            detail="Consent required to store reference image"
        )
    
    REF_IMG_DIR = "reference_images"
    os.makedirs(REF_IMG_DIR, exist_ok=True)

    reference_image_path = None

    if reference_image:
        filename = f"{uuid.uuid4()}.jpg"
        reference_image_path = os.path.join(REF_IMG_DIR, filename)

        with open(reference_image_path, "wb") as f:
            f.write(await reference_image.read())

   
    image_bytes_list = []
    for img in images:
        image_bytes_list.append(await img.read())
        await img.close()

    final_embedding, image_count = Gen_embeddings(image_bytes_list)

    if final_embedding is None:
        raise HTTPException(
            status_code=400,
            detail="No face detected in uploaded images"
        )

  
    person = MissingPerson(
        name=name,
        min_age=min_age,
        max_age=max_age,
        last_seen_location=last_seen_location,
        emergency_contact=emergency_contact,
        gender=gender,
        consent_given=consent_given,
        status="active",
        reference_image_path = reference_image_path
    )

    db.add(person)
    db.commit()
    db.refresh(person)

    final_embedding = np.asarray(final_embedding, dtype=np.float32)


    final_embedding = final_embedding.flatten()


    if final_embedding.shape[0] != 512:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid embedding size: {final_embedding.shape[0]}"
        )

# Convert to pure Python list
    embedding_list = final_embedding.tolist()
    
    

    
    db.add(
        FaceEmbedding(
            missing_person_id=person.id,
            embedding=embedding_list,
            image_count=image_count
            
        )
    )
    db.commit()

    return MissingPersonResponse(
        missing_person_id=person.id,
        images_processed=image_count
    )



@app.post("/match-missing-person", response_model=Matchresponse)
async def match_missing_person(
    images: list[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
   
    image_bytes = []
    for img in images:
        image_bytes.append(await img.read())
        await img.close()

    
    query_embedding, _ = Gen_embeddings(image_bytes)
    if query_embedding is None:
        return Matchresponse(
            adaptive_threshold=0.0,
            matches=[]
        )

    
    sql = text("""
        SELECT
                
            mp.id,
            mp.name,
            mp.min_age,
            mp.max_age,
            mp.gender,
            mp.emergency_contact,
            mp.last_seen_location,
            mp.reference_image_path AS reference_image,
            fe.embedding
        FROM face_embeddings fe
        JOIN missing_person mp
            ON fe.missing_person_id = mp.id;

               """)
    
    rows = db.execute(sql).fetchall()

    similarities = []
    results = []

   
    for row in rows:
        db_embedding = np.array(
            ast.literal_eval(row.embedding),
            dtype=np.float32
        )

        cos_sim = cosine_similarity(
            query_embedding.reshape(1, -1),
            db_embedding.reshape(1, -1)
        )[0][0]



        similarities.append(cos_sim)
        results.append({
            "missing_person_id": row.id,
            "name": row.name,
            "min_age": row.min_age,
            "max_age": row.max_age,
            "gender": row.gender,
            "contact": row.emergency_contact,
            "location": row.last_seen_location,
            "reference_image": row.reference_image,
            "cos": cos_sim
            })
        print(row._mapping.keys())


    results.sort(key=lambda x: x["cos"], reverse=True)

    best_cos = results[0]["cos"]
    adaptive_threshold = max(0.6, best_cos - 0.08)

    matches = []
    for r in results:
        if r["cos"] >= adaptive_threshold:                       #matching decision
            matches.append(Matchresult(
                missing_person_id = r["missing_person_id"],
                name=r["name"],
                min_age=r["min_age"],
                max_age=r["max_age"],
                gender=r["gender"],
                contact=r["contact"],
                location=r["location"],
                reference_image=r["reference_image"],
                cosine_similarity=round(r["cos"], 3),
                confidence=round(confidence_from_cosine(r["cos"]), 1)
            ))


    matches = matches[:3]

    return Matchresponse(
        adaptive_threshold=round(adaptive_threshold, 3),
        matches=matches
    )


@app.post("/authority-decision")
def record_authority_decision(
    payload: Authoritydecision,
    db: Session = Depends(get_db)
):
    if payload.decision not in ["confirm", "deny"]:
        return {"status": "error", "message": "Invalid decision"}

    decision_entry = AuthorityDecision(
        missing_person_id=payload.missing_person_id,
        decision=payload.decision,
        decided_at=datetime.utcnow()
    )

    db.add(decision_entry)
    db.commit()

    return {
        "status": "success",
        "message": f"Decision '{payload.decision}' recorded"
    }






