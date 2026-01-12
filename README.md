# P.E.P.P.E.R AI

**Platform for Ethical Person Identification & Recovery**

## Overview

Pepper is an **AI-assisted system** designed to help **authorities, hospitals, and NGOs** identify missing persons using facial recognition, while strictly maintaining **ethical safeguards** and **human-in-the-loop verification**.

The system is built to support real-world deployment scenarios where **accuracy, privacy, and accountability** are critical.

---

## Key Objectives

* Assist in identifying missing persons using AI-based facial similarity
* Ensure ethical usage with controlled access and manual verification
* Enable scalable deployment for institutions and NGOs
* Maintain transparency, security, and data protection

---

## Tech Stack

### Backend

* **Framework:** FastAPI (Python 3.11)
* **Face Recognition:** ArcFace
* **Similarity Metric:** Cosine Similarity plus adaptive threshold
* **Embeddings:** 512-dimensional vector representations
* **ORM:** SQLAlchemy

### Frontend

* HTML, CSS, JavaScript
* Dashboard-based UI for different user roles
* Integrated **Google Analytics (GA4)** for usage tracking

### Database

* **PostgreSQL**
* Stores embeddings in vector database, metadata, and access-controlled records

### Cloud & Infrastructure

  * Virtual Machine (backend execution)
  * Azure PostgreSQL Flexible Server
---

## Architecture

* Frontend communicates with the FastAPI backend via REST APIs
* Backend handles:

  * Face embedding generation
  * Similarity matching
  * Verification workflows
* Reference images are stored securely in cloud storage
* Facial embeddings and metadata are persisted in PostgreSQL
* Human verification is required before any identification outcome is finalized

---

## Security & Ethics

* Environment variable–based secret management
* Hashed credentials and role-based access control (RBAC)
* No sensitive data committed to source control
* Bias-aware, human-in-the-loop decision process
* Designed strictly for **assistance**, not automated enforcement

---

## Database Schema Management

* Core schemas designed and tested in PostgreSQL
* Final schema stored in `DATABASE/Schemas.sql`
* SQLAlchemy models reflect application-level usage
* Secrets injected via environment variables only

---

## Google Technology Used

* **Google Analytics (GA4)** is integrated into the frontend to track:

  * Page views and user interactions
  * Feature usage (search, upload, verification flows)
  * Platform engagement metrics to guide usability and scalability improvements

---

## Project Status

* Backend APIs functional and tested
* Frontend integrated and connected
* Cloud infrastructure configured on Azure
* Analytics enabled for monitoring and iteration
* Ready for demo and further deployment

---

// NOTE: Backend endpoints are restricted in public demo.
// Full functionality is demonstrated in the demo video.
const API_BASE_URL = "http://20.193.151.214:8000"
For api testing.

## Disclaimer

Pepper is intended to **assist authorized personnel only**.
All identification results require **manual verification** before any real-world action is taken.

