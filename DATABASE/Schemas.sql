--
-- PostgreSQL database dump
--

\restrict CmDlAmCSQeTZFqi1TUSm07miTWhFrteMXH48Gh8UI1UrWHanpzW5bBYupufAmic

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-08 14:12:07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16440)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 3 (class 3079 OID 16573)
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- TOC entry 5346 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- TOC entry 1012 (class 1247 OID 16415)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'police',
    'ngo',
    'hospital'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 16926)
-- Name: authority_decisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authority_decisions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    missing_person_id uuid,
    decision text,
    decided_at timestamp without time zone DEFAULT now(),
    CONSTRAINT authority_decisions_decision_check CHECK ((decision = ANY (ARRAY['confirm'::text, 'deny'::text])))
);


ALTER TABLE public.authority_decisions OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16481)
-- Name: authority_login; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authority_login (
    seq_id integer NOT NULL,
    login_id text GENERATED ALWAYS AS ((((((seq_id - 1) / 26) + 1))::text || chr((((seq_id - 1) % 26) + 65)))) STORED,
    username text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.authority_login OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16480)
-- Name: authority_login_seq_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authority_login ALTER COLUMN seq_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.authority_login_seq_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 16901)
-- Name: face_embeddings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.face_embeddings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    missing_person_id uuid,
    embedding public.vector(512) NOT NULL,
    image_count integer NOT NULL,
    embedding_version text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.face_embeddings OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16424)
-- Name: login_page; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_page (
    seq_id integer NOT NULL,
    login_id text GENERATED ALWAYS AS ((((((seq_id - 1) / 26) + 1))::text || chr((((seq_id - 1) % 26) + 65)))) STORED NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.login_page OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16423)
-- Name: login_page_seq_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.login_page ALTER COLUMN seq_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.login_page_seq_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 16539)
-- Name: missing_person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.missing_person (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    min_age integer,
    max_age integer,
    emergency_contact character varying(15),
    status text DEFAULT 'active'::text,
    created_by integer,
    consent_given boolean NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    gender text,
    contact text,
    last_seen_location text,
    reference_image_path text
);


ALTER TABLE public.missing_person OWNER TO postgres;

--
-- TOC entry 5347 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN missing_person.reference_image_path; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.missing_person.reference_image_path IS 'User-consented reference image for human verification only';


--
-- TOC entry 226 (class 1259 OID 16557)
-- Name: person_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    missing_person_id uuid,
    image_url text NOT NULL,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.person_images OWNER TO postgres;

--
-- TOC entry 5188 (class 2606 OID 16936)
-- Name: authority_decisions authority_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authority_decisions
    ADD CONSTRAINT authority_decisions_pkey PRIMARY KEY (id);


--
-- TOC entry 5175 (class 2606 OID 16494)
-- Name: authority_login authority_login_login_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authority_login
    ADD CONSTRAINT authority_login_login_id_key UNIQUE (login_id);


--
-- TOC entry 5177 (class 2606 OID 16492)
-- Name: authority_login authority_login_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authority_login
    ADD CONSTRAINT authority_login_pkey PRIMARY KEY (seq_id);


--
-- TOC entry 5179 (class 2606 OID 16496)
-- Name: authority_login authority_login_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authority_login
    ADD CONSTRAINT authority_login_username_key UNIQUE (username);


--
-- TOC entry 5185 (class 2606 OID 16912)
-- Name: face_embeddings face_embeddings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.face_embeddings
    ADD CONSTRAINT face_embeddings_pkey PRIMARY KEY (id);


--
-- TOC entry 5171 (class 2606 OID 16479)
-- Name: login_page login_page_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_page
    ADD CONSTRAINT login_page_pkey PRIMARY KEY (seq_id);


--
-- TOC entry 5173 (class 2606 OID 16439)
-- Name: login_page login_page_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_page
    ADD CONSTRAINT login_page_username_key UNIQUE (username);


--
-- TOC entry 5181 (class 2606 OID 16551)
-- Name: missing_person missing_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.missing_person
    ADD CONSTRAINT missing_person_pkey PRIMARY KEY (id);


--
-- TOC entry 5183 (class 2606 OID 16567)
-- Name: person_images person_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_images
    ADD CONSTRAINT person_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5186 (class 1259 OID 16918)
-- Name: face_embeddings_vector_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX face_embeddings_vector_idx ON public.face_embeddings USING ivfflat (embedding public.vector_cosine_ops) WITH (lists='100');


--
-- TOC entry 5192 (class 2606 OID 16937)
-- Name: authority_decisions authority_decisions_missing_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authority_decisions
    ADD CONSTRAINT authority_decisions_missing_person_id_fkey FOREIGN KEY (missing_person_id) REFERENCES public.missing_person(id);


--
-- TOC entry 5191 (class 2606 OID 16913)
-- Name: face_embeddings face_embeddings_missing_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.face_embeddings
    ADD CONSTRAINT face_embeddings_missing_person_id_fkey FOREIGN KEY (missing_person_id) REFERENCES public.missing_person(id) ON DELETE CASCADE;


--
-- TOC entry 5189 (class 2606 OID 16552)
-- Name: missing_person missing_person_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.missing_person
    ADD CONSTRAINT missing_person_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.login_page(seq_id);


--
-- TOC entry 5190 (class 2606 OID 16568)
-- Name: person_images person_images_missing_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_images
    ADD CONSTRAINT person_images_missing_person_id_fkey FOREIGN KEY (missing_person_id) REFERENCES public.missing_person(id) ON DELETE CASCADE;


-- Completed on 2026-01-08 14:12:08

--
-- PostgreSQL database dump complete
--

\unrestrict CmDlAmCSQeTZFqi1TUSm07miTWhFrteMXH48Gh8UI1UrWHanpzW5bBYupufAmic

