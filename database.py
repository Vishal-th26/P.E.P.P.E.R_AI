from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set in environment variables")



engine = create_engine(DATABASE_URL)
session_Local = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()


