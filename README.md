# Pepper – Missing Persons Identification System

Pepper is an AI-assisted system designed to help authorities and NGOs identify missing persons using facial recognition, while maintaining ethical safeguards and human-in-the-loop verification.

## Tech Stack
- Backend: FastAPI (Python 3.11)
- Database: PostgreSQL
- Face Recognition: ArcFace + cosine similarity
- Embeddings: 512-d vector representations
- Cloud: Microsoft Azure (App Service, Blob Storage)

## Architecture
- Frontend communicates with FastAPI backend
- Backend performs embedding generation and matching
- Reference images stored securely in cloud storage
- Metadata and embeddings stored in PostgreSQL

## Security
- Environment variable–based secret management
- Hashed credentials and role-based access
- No sensitive data committed to source control


### Database Schema Management

- Core schemas were designed and tested in PostgreSQL.
- Final schema is stored in `schema.sql`.
- SQLAlchemy models reflect application-level usage.
- Secrets are injected via environment variables.
