SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
COMMENT ON SCHEMA "public" IS 'standard public schema';
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
SET default_tablespace = '';
SET default_table_access_method = "heap";
CREATE TABLE IF NOT EXISTS "public"."admins" (
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."admins" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."artists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "bio" "text",
    "instagram_url" "text",
    "soundcloud_url" "text",
    "spotify_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."artists" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "key" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "html" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "email_templates_key_check" CHECK (
        (
            "key" = ANY (
                ARRAY ['confirmation'::"text", 'approved'::"text", 'rejected'::"text"]
            )
        )
    )
);
ALTER TABLE "public"."email_templates" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_id" "uuid" NOT NULL,
    "grade" integer,
    "internal_notes" "text",
    "feedback_for_artist" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reviews_grade_check" CHECK (
        (
            ("grade" IS NULL)
            OR (
                ("grade" >= 1)
                AND ("grade" <= 10)
            )
        )
    )
);
ALTER TABLE "public"."reviews" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "submissions_status_check" CHECK (
        (
            "status" = ANY (
                ARRAY ['pending'::"text", 'in_review'::"text", 'approved'::"text", 'rejected'::"text"]
            )
        )
    )
);
ALTER TABLE "public"."submissions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."tracks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_id" "uuid" NOT NULL,
    "storage_path" "text" NOT NULL,
    "filename" "text",
    "mime_type" "text",
    "size_bytes" bigint,
    "title" "text",
    "genre" "text",
    "bpm" integer,
    "key" "text",
    "description" "text",
    "duration_seconds" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tracks_bpm_check" CHECK (
        (
            ("bpm" IS NULL)
            OR (
                ("bpm" >= 1)
                AND ("bpm" <= 400)
            )
        )
    ),
    CONSTRAINT "tracks_duration_seconds_check" CHECK (
        (
            ("duration_seconds" IS NULL)
            OR ("duration_seconds" >= 0)
        )
    )
);
ALTER TABLE "public"."tracks" OWNER TO "postgres";
ALTER TABLE ONLY "public"."admins"
ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("user_id");
ALTER TABLE ONLY "public"."artists"
ADD CONSTRAINT "artists_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."email_templates"
ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("key");
ALTER TABLE ONLY "public"."reviews"
ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."reviews"
ADD CONSTRAINT "reviews_submission_id_key" UNIQUE ("submission_id");
ALTER TABLE ONLY "public"."submissions"
ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."tracks"
ADD CONSTRAINT "tracks_pkey" PRIMARY KEY ("id");
CREATE INDEX "artists_email_idx" ON "public"."artists" USING "btree" ("email");
CREATE INDEX "reviews_submission_id_idx" ON "public"."reviews" USING "btree" ("submission_id");
CREATE INDEX "submissions_artist_id_idx" ON "public"."submissions" USING "btree" ("artist_id");
CREATE INDEX "submissions_created_at_idx" ON "public"."submissions" USING "btree" ("created_at");
CREATE INDEX "submissions_status_idx" ON "public"."submissions" USING "btree" ("status");
CREATE INDEX "tracks_submission_id_idx" ON "public"."tracks" USING "btree" ("submission_id");
ALTER TABLE ONLY "public"."admins"
ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."reviews"
ADD CONSTRAINT "reviews_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."submissions"
ADD CONSTRAINT "submissions_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."tracks"
ADD CONSTRAINT "tracks_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE CASCADE;
ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."artists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."email_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tracks" ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON TABLE "public"."admins" TO "anon";
GRANT ALL ON TABLE "public"."admins" TO "authenticated";
GRANT ALL ON TABLE "public"."admins" TO "service_role";
GRANT ALL ON TABLE "public"."artists" TO "anon";
GRANT ALL ON TABLE "public"."artists" TO "authenticated";
GRANT ALL ON TABLE "public"."artists" TO "service_role";
GRANT ALL ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";
GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";
GRANT ALL ON TABLE "public"."submissions" TO "anon";
GRANT ALL ON TABLE "public"."submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."submissions" TO "service_role";
GRANT ALL ON TABLE "public"."tracks" TO "anon";
GRANT ALL ON TABLE "public"."tracks" TO "authenticated";
GRANT ALL ON TABLE "public"."tracks" TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "service_role";