from sqlalchemy import Column, Integer, String , DateTime, ForeignKey , Boolean ,  Text , DATETIME
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector

Base = declarative_base()

class LoginPage(Base):
    __tablename__ = "login_page"

    seq_id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

class AuthorityLogin(Base):
    __tablename__ = "authority_login"

    seq_id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


class MissingPerson(Base):
    __tablename__ = "missing_person"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    name = Column(Text, nullable=False)

    min_age = Column(Integer, nullable=False)
    max_age = Column(Integer, nullable=False)

    last_seen_location = Column(Text, nullable=True)

    emergency_contact = Column(String(15), nullable=True)

    gender = Column(Text, nullable=True)

    status = Column(Text, default="active")

    created_by = Column(Integer, nullable=True)

    consent_given = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    
    reference_image_path = Column(String, nullable=True)

class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    missing_person_id = Column(
        UUID(as_uuid=True),
        ForeignKey("missing_person.id", ondelete="CASCADE"),
        nullable=False
    )

    embedding = Column(Vector(512), nullable=False)

    image_count = Column(Integer, nullable=False) 

class AuthorityDecision(Base):
    __tablename__ = "authority_decisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    missing_person_id = Column(
        UUID(as_uuid=True),
        ForeignKey("missing_person.id"),
        nullable=False
    )
    decision = Column(String, nullable=False)
    decided_at = Column(DateTime, default=datetime.utcnow)

    