--
-- PostgreSQL database dump
--

\restrict A4MdYm0uom25wulKEyEOzPBuHF5z9cm4dikAGVw1A71ZRdP7Q20m4KWtzYZx5Z2

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

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

DROP EVENT TRIGGER IF EXISTS pgrst_drop_watch;
DROP EVENT TRIGGER IF EXISTS pgrst_ddl_watch;
DROP EVENT TRIGGER IF EXISTS issue_pg_net_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_graphql_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_cron_access;
DROP EVENT TRIGGER IF EXISTS issue_graphql_placeholder;
DROP PUBLICATION IF EXISTS supabase_realtime;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS "prefixes_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS "objects_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY public.workouts DROP CONSTRAINT IF EXISTS "workouts_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.workout_exercises DROP CONSTRAINT IF EXISTS "workout_exercises_workoutId_fkey";
ALTER TABLE IF EXISTS ONLY public.workout_exercises DROP CONSTRAINT IF EXISTS "workout_exercises_exerciseId_fkey";
ALTER TABLE IF EXISTS ONLY public.training_sessions DROP CONSTRAINT IF EXISTS "training_sessions_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.todos DROP CONSTRAINT IF EXISTS "todos_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.recipe_ingredients DROP CONSTRAINT IF EXISTS "recipe_ingredients_recipeId_fkey";
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS "payments_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.online_coaching_registrations DROP CONSTRAINT IF EXISTS "online_coaching_registrations_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.nutrition_plans DROP CONSTRAINT IF EXISTS "nutrition_plans_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.goals DROP CONSTRAINT IF EXISTS "goals_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.customer_workouts DROP CONSTRAINT IF EXISTS "customer_workouts_workoutId_fkey";
ALTER TABLE IF EXISTS ONLY public.customer_workouts DROP CONSTRAINT IF EXISTS "customer_workouts_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.customer_schedule_assignments DROP CONSTRAINT IF EXISTS "customer_schedule_assignments_workoutId_fkey";
ALTER TABLE IF EXISTS ONLY public.customer_schedule_assignments DROP CONSTRAINT IF EXISTS "customer_schedule_assignments_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.customer_progression DROP CONSTRAINT IF EXISTS "customer_progression_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.customer_photos DROP CONSTRAINT IF EXISTS "customer_photos_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.customer_nutrition_plans DROP CONSTRAINT IF EXISTS "customer_nutrition_plans_nutritionPlanId_fkey";
ALTER TABLE IF EXISTS ONLY public.customer_nutrition_plans DROP CONSTRAINT IF EXISTS "customer_nutrition_plans_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.customer_measurements DROP CONSTRAINT IF EXISTS "customer_measurements_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.achievements DROP CONSTRAINT IF EXISTS "achievements_userId_fkey";
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_oauth_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
DROP TRIGGER IF EXISTS update_objects_updated_at ON storage.objects;
DROP TRIGGER IF EXISTS prefixes_delete_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS prefixes_create_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS objects_update_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_insert_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_delete_delete_prefix ON storage.objects;
DROP TRIGGER IF EXISTS enforce_bucket_name_length_trigger ON storage.buckets;
DROP TRIGGER IF EXISTS tr_check_filters ON realtime.subscription;
DROP INDEX IF EXISTS storage.objects_bucket_id_level_idx;
DROP INDEX IF EXISTS storage.name_prefix_search;
DROP INDEX IF EXISTS storage.idx_prefixes_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name;
DROP INDEX IF EXISTS storage.idx_name_bucket_level_unique;
DROP INDEX IF EXISTS storage.idx_multipart_uploads_list;
DROP INDEX IF EXISTS storage.bucketid_objname;
DROP INDEX IF EXISTS storage.bname;
DROP INDEX IF EXISTS realtime.subscription_subscription_id_entity_filters_key;
DROP INDEX IF EXISTS realtime.messages_inserted_at_topic_index;
DROP INDEX IF EXISTS realtime.ix_realtime_subscription_entity;
DROP INDEX IF EXISTS public.users_email_key;
DROP INDEX IF EXISTS public.launch_notifications_email_key;
DROP INDEX IF EXISTS public.ingredients_name_key;
DROP INDEX IF EXISTS public.exercise_set_logs_sid_exid_set_uq;
DROP INDEX IF EXISTS public.exercise_set_logs_prog_idx;
DROP INDEX IF EXISTS public."customer_workouts_customerId_workoutId_key";
DROP INDEX IF EXISTS public."customer_schedule_assignments_customerId_weekday_key";
DROP INDEX IF EXISTS public."customer_photos_customerId_week_position_key";
DROP INDEX IF EXISTS public."customer_nutrition_plans_customerId_nutritionPlanId_key";
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_pattern_idx;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_oauth_client_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.oauth_consents_user_order_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_user_client_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_client_idx;
DROP INDEX IF EXISTS auth.oauth_clients_deleted_at_idx;
DROP INDEX IF EXISTS auth.oauth_auth_pending_exp_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_pkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS prefixes_pkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS objects_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_name_key;
ALTER TABLE IF EXISTS ONLY storage.buckets DROP CONSTRAINT IF EXISTS buckets_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets_analytics DROP CONSTRAINT IF EXISTS buckets_analytics_pkey;
ALTER TABLE IF EXISTS ONLY realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY realtime.subscription DROP CONSTRAINT IF EXISTS pk_subscription;
ALTER TABLE IF EXISTS ONLY realtime.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.workouts DROP CONSTRAINT IF EXISTS workouts_pkey;
ALTER TABLE IF EXISTS ONLY public.workout_exercises DROP CONSTRAINT IF EXISTS workout_exercises_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.training_sessions DROP CONSTRAINT IF EXISTS training_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.todos DROP CONSTRAINT IF EXISTS todos_pkey;
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS services_pkey;
ALTER TABLE IF EXISTS ONLY public.recipes DROP CONSTRAINT IF EXISTS recipes_pkey;
ALTER TABLE IF EXISTS ONLY public.recipe_ingredients DROP CONSTRAINT IF EXISTS recipe_ingredients_pkey;
ALTER TABLE IF EXISTS ONLY public.pricing_calculations DROP CONSTRAINT IF EXISTS pricing_calculations_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.online_coaching_registrations DROP CONSTRAINT IF EXISTS online_coaching_registrations_pkey;
ALTER TABLE IF EXISTS ONLY public.nutrition_plans DROP CONSTRAINT IF EXISTS nutrition_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.nutrition_calculations DROP CONSTRAINT IF EXISTS nutrition_calculations_pkey;
ALTER TABLE IF EXISTS ONLY public.launch_notifications DROP CONSTRAINT IF EXISTS launch_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.ingredients DROP CONSTRAINT IF EXISTS ingredients_pkey;
ALTER TABLE IF EXISTS ONLY public.goals DROP CONSTRAINT IF EXISTS goals_pkey;
ALTER TABLE IF EXISTS ONLY public.exercises DROP CONSTRAINT IF EXISTS exercises_pkey;
ALTER TABLE IF EXISTS ONLY public.exercise_set_logs DROP CONSTRAINT IF EXISTS exercise_set_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_workouts DROP CONSTRAINT IF EXISTS customer_workouts_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_schedule_assignments DROP CONSTRAINT IF EXISTS customer_schedule_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_progression DROP CONSTRAINT IF EXISTS customer_progression_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_photos DROP CONSTRAINT IF EXISTS customer_photos_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_nutrition_plans DROP CONSTRAINT IF EXISTS customer_nutrition_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_measurements DROP CONSTRAINT IF EXISTS customer_measurements_pkey;
ALTER TABLE IF EXISTS ONLY public.achievements DROP CONSTRAINT IF EXISTS achievements_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_client_unique;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_clients DROP CONSTRAINT IF EXISTS oauth_clients_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_id_key;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_code_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS storage.s3_multipart_uploads_parts;
DROP TABLE IF EXISTS storage.s3_multipart_uploads;
DROP TABLE IF EXISTS storage.prefixes;
DROP TABLE IF EXISTS storage.objects;
DROP TABLE IF EXISTS storage.migrations;
DROP TABLE IF EXISTS storage.buckets_analytics;
DROP TABLE IF EXISTS storage.buckets;
DROP TABLE IF EXISTS realtime.subscription;
DROP TABLE IF EXISTS realtime.schema_migrations;
DROP TABLE IF EXISTS realtime.messages;
DROP TABLE IF EXISTS public.workouts;
DROP TABLE IF EXISTS public.workout_exercises;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.training_sessions;
DROP TABLE IF EXISTS public.todos;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.recipes;
DROP TABLE IF EXISTS public.recipe_ingredients;
DROP TABLE IF EXISTS public.pricing_calculations;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.online_coaching_registrations;
DROP TABLE IF EXISTS public.nutrition_plans;
DROP TABLE IF EXISTS public.nutrition_calculations;
DROP TABLE IF EXISTS public.launch_notifications;
DROP TABLE IF EXISTS public.ingredients;
DROP TABLE IF EXISTS public.goals;
DROP TABLE IF EXISTS public.exercises;
DROP TABLE IF EXISTS public.exercise_set_logs;
DROP TABLE IF EXISTS public.customer_workouts;
DROP TABLE IF EXISTS public.customer_schedule_assignments;
DROP TABLE IF EXISTS public.customer_progression;
DROP TABLE IF EXISTS public.customer_photos;
DROP TABLE IF EXISTS public.customer_nutrition_plans;
DROP TABLE IF EXISTS public.customer_measurements;
DROP TABLE IF EXISTS public.achievements;
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.oauth_consents;
DROP TABLE IF EXISTS auth.oauth_clients;
DROP TABLE IF EXISTS auth.oauth_authorizations;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP FUNCTION IF EXISTS storage.update_updated_at_column();
DROP FUNCTION IF EXISTS storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text);
DROP FUNCTION IF EXISTS storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.prefixes_insert_trigger();
DROP FUNCTION IF EXISTS storage.prefixes_delete_cleanup();
DROP FUNCTION IF EXISTS storage.operation();
DROP FUNCTION IF EXISTS storage.objects_update_prefix_trigger();
DROP FUNCTION IF EXISTS storage.objects_update_level_trigger();
DROP FUNCTION IF EXISTS storage.objects_update_cleanup();
DROP FUNCTION IF EXISTS storage.objects_insert_prefix_trigger();
DROP FUNCTION IF EXISTS storage.objects_delete_cleanup();
DROP FUNCTION IF EXISTS storage.lock_top_prefixes(bucket_ids text[], names text[]);
DROP FUNCTION IF EXISTS storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);
DROP FUNCTION IF EXISTS storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION IF EXISTS storage.get_size_by_bucket();
DROP FUNCTION IF EXISTS storage.get_prefixes(name text);
DROP FUNCTION IF EXISTS storage.get_prefix(name text);
DROP FUNCTION IF EXISTS storage.get_level(name text);
DROP FUNCTION IF EXISTS storage.foldername(name text);
DROP FUNCTION IF EXISTS storage.filename(name text);
DROP FUNCTION IF EXISTS storage.extension(name text);
DROP FUNCTION IF EXISTS storage.enforce_bucket_name_length();
DROP FUNCTION IF EXISTS storage.delete_prefix_hierarchy_trigger();
DROP FUNCTION IF EXISTS storage.delete_prefix(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS storage.delete_leaf_prefixes(bucket_ids text[], names text[]);
DROP FUNCTION IF EXISTS storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION IF EXISTS storage.add_prefixes(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS realtime.topic();
DROP FUNCTION IF EXISTS realtime.to_regrole(role_name text);
DROP FUNCTION IF EXISTS realtime.subscription_check_filters();
DROP FUNCTION IF EXISTS realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION IF EXISTS realtime.quote_wal2json(entity regclass);
DROP FUNCTION IF EXISTS realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION IF EXISTS realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION IF EXISTS realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION IF EXISTS realtime."cast"(val text, type_ regtype);
DROP FUNCTION IF EXISTS realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION IF EXISTS realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION IF EXISTS realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION IF EXISTS pgbouncer.get_auth(p_usename text);
DROP FUNCTION IF EXISTS extensions.set_graphql_placeholder();
DROP FUNCTION IF EXISTS extensions.pgrst_drop_watch();
DROP FUNCTION IF EXISTS extensions.pgrst_ddl_watch();
DROP FUNCTION IF EXISTS extensions.grant_pg_net_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_graphql_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_cron_access();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS storage.buckettype;
DROP TYPE IF EXISTS realtime.wal_rls;
DROP TYPE IF EXISTS realtime.wal_column;
DROP TYPE IF EXISTS realtime.user_defined_filter;
DROP TYPE IF EXISTS realtime.equality_op;
DROP TYPE IF EXISTS realtime.action;
DROP TYPE IF EXISTS auth.one_time_token_type;
DROP TYPE IF EXISTS auth.oauth_response_type;
DROP TYPE IF EXISTS auth.oauth_registration_type;
DROP TYPE IF EXISTS auth.oauth_client_type;
DROP TYPE IF EXISTS auth.oauth_authorization_status;
DROP TYPE IF EXISTS auth.factor_type;
DROP TYPE IF EXISTS auth.factor_status;
DROP TYPE IF EXISTS auth.code_challenge_method;
DROP TYPE IF EXISTS auth.aal_level;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS supabase_vault;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP EXTENSION IF EXISTS pg_graphql;
DROP SCHEMA IF EXISTS vault;
DROP SCHEMA IF EXISTS storage;
DROP SCHEMA IF EXISTS realtime;
DROP SCHEMA IF EXISTS pgbouncer;
DROP SCHEMA IF EXISTS graphql_public;
DROP SCHEMA IF EXISTS graphql;
DROP SCHEMA IF EXISTS extensions;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    date timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: customer_measurements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_measurements (
    id text NOT NULL,
    "customerId" text NOT NULL,
    week integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    weight double precision,
    height double precision,
    age integer,
    chest double precision,
    waist double precision,
    hips double precision,
    thigh double precision,
    arm double precision,
    neck double precision,
    "bodyFat" double precision,
    "muscleMass" double precision,
    bmi double precision,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: customer_nutrition_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_nutrition_plans (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "nutritionPlanId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: customer_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_photos (
    id text NOT NULL,
    "customerId" text NOT NULL,
    week integer NOT NULL,
    "position" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "imageUrl" text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: customer_progression; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_progression (
    id text NOT NULL,
    "customerId" text NOT NULL,
    week integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    endurance double precision,
    strength double precision,
    flexibility double precision,
    balance double precision,
    "goalAchieved" boolean DEFAULT false NOT NULL,
    "goalProgress" double precision,
    "goalNotes" text,
    "progressRating" integer,
    "trainerNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: customer_schedule_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_schedule_assignments (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "workoutId" text NOT NULL,
    weekday integer NOT NULL,
    "trainingDay" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: customer_workouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_workouts (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "workoutId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: exercise_set_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_set_logs (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    session_id text NOT NULL,
    customer_id text NOT NULL,
    training_day integer NOT NULL,
    workout_id text NOT NULL,
    exercise_id text NOT NULL,
    set_number integer NOT NULL,
    weight_kg double precision NOT NULL,
    reps_done integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: exercises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercises (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "muscleGroup" text NOT NULL,
    equipment text,
    difficulty text DEFAULT 'beginner'::text NOT NULL,
    category text DEFAULT 'strength'::text NOT NULL,
    instructions text,
    tips text,
    "videoUrl" text,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goals (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    target text NOT NULL,
    current text NOT NULL,
    deadline timestamp(3) without time zone,
    completed boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredients (
    id text NOT NULL,
    name text NOT NULL,
    "nameRo" text,
    per text,
    "perRo" text,
    calories double precision NOT NULL,
    protein double precision NOT NULL,
    carbs double precision NOT NULL,
    fat double precision NOT NULL,
    fiber double precision,
    sugar double precision,
    category text,
    aliases text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: launch_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.launch_notifications (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    interests text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: nutrition_calculations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutrition_calculations (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "customerName" text NOT NULL,
    gender text NOT NULL,
    age integer NOT NULL,
    height integer NOT NULL,
    weight double precision NOT NULL,
    "activityLevel" text NOT NULL,
    bmr double precision NOT NULL,
    "maintenanceCalories" double precision NOT NULL,
    protein double precision NOT NULL,
    carbs double precision NOT NULL,
    fat double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: nutrition_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutrition_plans (
    id text NOT NULL,
    name text NOT NULL,
    goal text NOT NULL,
    calories integer NOT NULL,
    protein integer NOT NULL,
    carbs integer NOT NULL,
    fat integer NOT NULL,
    meals integer NOT NULL,
    clients integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    description text,
    "weekMenu" jsonb,
    created timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastUsed" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text
);


--
-- Name: online_coaching_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.online_coaching_registrations (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    program text,
    status text DEFAULT 'pending'::text NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    notes text,
    interests text[] DEFAULT ARRAY[]::text[],
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "customerId" text NOT NULL,
    amount double precision NOT NULL,
    "paymentMethod" text NOT NULL,
    "paymentType" text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    notes text,
    "paymentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: pricing_calculations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_calculations (
    id text NOT NULL,
    service text NOT NULL,
    duration integer NOT NULL,
    frequency integer NOT NULL,
    discount double precision DEFAULT 0 NOT NULL,
    vat double precision DEFAULT 21 NOT NULL,
    "finalPrice" double precision NOT NULL,
    "includeNutritionPlan" boolean DEFAULT false NOT NULL,
    "nutritionPlanCount" integer DEFAULT 0 NOT NULL,
    "customerId" text,
    "customerName" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_ingredients (
    id text NOT NULL,
    "recipeId" text NOT NULL,
    name text NOT NULL,
    quantity double precision NOT NULL,
    unit text NOT NULL,
    "exists" boolean DEFAULT false NOT NULL,
    "availableInApi" boolean DEFAULT false NOT NULL,
    "apiMatch" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "prepTime" integer,
    servings integer DEFAULT 1 NOT NULL,
    instructions text,
    "totalCalories" double precision DEFAULT 0 NOT NULL,
    "totalProtein" double precision DEFAULT 0 NOT NULL,
    "totalCarbs" double precision DEFAULT 0 NOT NULL,
    "totalFat" double precision DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id text NOT NULL,
    name text NOT NULL,
    "basePrice" double precision NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: todos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.todos (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    priority text DEFAULT 'medium'::text NOT NULL,
    deadline timestamp(3) without time zone,
    completed boolean DEFAULT false NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: training_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_sessions (
    id text NOT NULL,
    "customerId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    type text DEFAULT '1:1'::text NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    phone text,
    goal text,
    "joinDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    plan text DEFAULT 'Basic'::text NOT NULL,
    "trainingFrequency" integer DEFAULT 1 NOT NULL,
    "lastWorkout" timestamp(3) without time zone,
    "totalSessions" integer DEFAULT 0 NOT NULL,
    rating double precision DEFAULT 0,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: workout_exercises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workout_exercises (
    id text NOT NULL,
    "workoutId" text NOT NULL,
    "exerciseId" text NOT NULL,
    day integer NOT NULL,
    "order" integer NOT NULL,
    sets integer DEFAULT 3 NOT NULL,
    reps text NOT NULL,
    weight text,
    "restTime" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: workouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workouts (
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    difficulty text NOT NULL,
    duration integer NOT NULL,
    exercises integer NOT NULL,
    "trainingType" text,
    clients integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    description text,
    created timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastUsed" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.achievements (id, title, description, points, completed, date, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: customer_measurements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_measurements (id, "customerId", week, date, weight, height, age, chest, waist, hips, thigh, arm, neck, "bodyFat", "muscleMass", bmi, notes, "createdAt", "updatedAt") FROM stdin;
cmg47k8u80046atebwhqfjtba	cmg3zc6f00001c2fk7xcz8z9m	1	2025-09-28 00:00:00	54	170	34	84	61	94	51	24	31	\N	\N	18.7	\N	2025-09-28 21:24:54.017	2025-09-29 05:23:21.635
cmg4t6kij00019uh9rc39d3x1	cmg3zc6kf0002c2fkaq5c5a96	1	2025-09-29 00:00:00	49	152	27	90	71	92	53	27	31	\N	\N	21.2	\N	2025-09-29 07:30:07.482	2025-09-29 07:30:07.482
cmg4ze7nt00029gfmua1cxe75	cmg4zcgmr00009gfm1ptz4rfg	1	2025-09-29 00:00:00	64	172	27	\N	\N	\N	\N	\N	\N	\N	\N	21.6	\N	2025-09-29 10:24:01.794	2025-09-29 10:24:01.794
cmg65umxe0001cafpc4xh0npi	cmg51euw20006bpec53j1e4bb	1	2025-09-30 00:00:00	57	150	32	99	79	91	54	31	34	\N	\N	25.3	\N	2025-09-30 06:12:31.946	2025-09-30 06:12:31.946
cmgeov79w0001g5h9svfz3vsh	cmg40s3t400016reaj691t59r	1	2025-10-06 00:00:00	50	165	26	79	63	88	51	25	31	\N	\N	18.4	\N	2025-10-06 05:27:00.421	2025-10-06 05:27:00.421
cmgerh0rk0005g5h9pb2ioptt	cmg8zzacg000093gx865cl2xm	1	2025-10-06 00:00:00	57	163	26	83	71	101	56	28	31	\N	\N	21.5	\N	2025-10-06 06:39:57.728	2025-10-06 06:39:57.728
cmgg9rr6v0001bnfgjb2i39p3	cmg51euw20006bpec53j1e4bb	1	2025-10-07 00:00:00	56.2	150	32	98	79	90	52.5	30	33	\N	\N	25	\N	2025-10-07 07:59:57.799	2025-10-07 08:02:17.565
cmggh6eoj00097udf2kctm2z5	cmgeufv4m0001dfdlqjcks11j	1	2025-10-07 00:00:00	97.9	168	33	110	108	117	69	39	36	\N	\N	34.7	\N	2025-10-07 11:27:18.74	2025-10-07 11:27:18.74
cmgggyjka00037udfb053w525	cmgeu9tgh0000dfdld8yohhuy	1	2025-10-07 00:00:00	71	168	31	97	77	108	62	31	33.5	\N	\N	25.2	\N	2025-10-07 11:21:11.818	2025-10-07 18:52:21.193
cmgevu9oh000185dqxmfxx8bk	cmg72xn1g003sfofh52suc9zq	1	2025-10-07 00:00:00	65.25	161	27	89	73	98	61	30	33	\N	\N	25.2	\N	2025-10-06 08:42:14.273	2025-10-07 20:48:21.662
cmgj7agv90001affwmqan2hls	cmg3zc6kf0002c2fkaq5c5a96	1	2025-10-09 00:00:00	48	152	27	91	72	89.5	52.5	26.5	30.5	\N	\N	20.8	\N	2025-10-09 09:13:50.566	2025-10-09 09:13:50.566
cmgqe3h0d0001jy0451p9kmgh	cmgh0mdii006f89gxl5ejkg3d	1	2025-10-14 00:00:00	53	168	28	80	67	95	54	25.5	31	\N	\N	18.8	\N	2025-10-14 09:58:44.701	2025-10-14 09:58:44.701
cmgqgnd7i0001l204n0y93xf6	cmgeu9tgh0000dfdld8yohhuy	1	2025-10-14 00:00:00	70.5	168	31	93	78	105.5	61	31	33	\N	\N	25	\N	2025-10-14 11:10:12.127	2025-10-14 11:10:12.127
cmgqgvmuy0003l20445h252ex	cmgeufv4m0001dfdlqjcks11j	1	2025-10-14 00:00:00	96	168	\N	112	97	117	69	38	36	\N	\N	34	\N	2025-10-14 11:16:37.883	2025-10-14 11:16:37.883
cmgrk3t7q0001l10497xaxo2x	cmg40s3t400016reaj691t59r	2	2025-10-15 00:00:00	51	165	26	84	64.5	89	50	25.5	31	\N	\N	18.7	\N	2025-10-15 05:34:44.391	2025-10-15 05:34:44.391
cmgron4zo0001l504cflugmi5	cmg72xn1g003sfofh52suc9zq	2	2025-10-15 00:00:00	64	161	27	87	73	101	59	28.5	32.5	\N	\N	24.7	\N	2025-10-15 07:41:44.581	2025-10-15 07:41:44.581
cmgrm9koa0001l5044iq84x4t	cmg51euw20006bpec53j1e4bb	3	2025-10-15 00:00:00	56.2	150	32	99	80	91.5	54	30.5	32	\N	\N	25	\N	2025-10-15 06:35:12.49	2025-10-15 14:26:14.966
\.


--
-- Data for Name: customer_nutrition_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_nutrition_plans (id, "customerId", "nutritionPlanId", "assignedAt", status, notes, "createdAt", "updatedAt") FROM stdin;
cmgh1c6ml006l89gx80utedfg	cmg72xn1g003sfofh52suc9zq	cmgh1c6jq006j89gxlq1h2eo8	2025-10-07 20:51:40.37	active	\N	2025-10-07 20:51:40.557	2025-10-07 20:51:40.557
cmgnjxoia0009dybzkx708kew	cmg3zc6kf0002c2fkaq5c5a96	cmgnjxod20007dybzzwrut7mv	2025-10-12 10:18:53.649	active	\N	2025-10-12 10:18:53.651	2025-10-12 10:18:53.651
cmgsfv1ut0003l804qvco2llh	cmg8zzacg000093gx865cl2xm	cmgsfv1i10001l8047reh2gkl	2025-10-15 20:23:43.397	active	\N	2025-10-15 20:23:43.398	2025-10-15 20:23:43.398
\.


--
-- Data for Name: customer_photos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_photos (id, "customerId", week, "position", date, "imageUrl", notes, "createdAt", "updatedAt") FROM stdin;
cmg41uqfg00186rea739ugolo	cmg3zc6f00001c2fk7xcz8z9m	1	back	2025-09-28 00:00:00	/uploads/customer-photos/cmg3zc6f00001c2fk7xcz8z9m_week1_back_1759085105532.png	\N	2025-09-28 18:45:05.741	2025-09-28 18:45:05.741
cmg41sxti00126rea2z3x45pk	cmg3zc6f00001c2fk7xcz8z9m	1	front	2025-09-28 00:00:00	/uploads/customer-photos/cmg3zc6f00001c2fk7xcz8z9m_week1_front_1759085021625.png	\N	2025-09-28 18:43:41.944	2025-09-28 18:43:41.944
cmg41uq3l00166reae875hlp8	cmg3zc6f00001c2fk7xcz8z9m	1	side	2025-09-28 00:00:00	/uploads/customer-photos/cmg3zc6f00001c2fk7xcz8z9m_week1_side_1759085105098.png	\N	2025-09-28 18:45:05.313	2025-09-28 18:45:05.313
cmg4pkfoz004satebsr61sofu	cmg3zc6f00001c2fk7xcz8z9m	2	front	2025-09-29 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg3zc6f00001c2fk7xcz8z9m_week2_front_1759124933171.png	\N	2025-09-29 05:48:56.051	2025-09-29 05:48:56.051
cmg50zs450005bpecb4gflt5c	cmg3zc6kf0002c2fkaq5c5a96	1	back	2025-09-29 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg3zc6kf0002c2fkaq5c5a96_week1_back_1759144126585.jpeg	\N	2025-09-29 11:08:47.766	2025-09-29 11:08:47.766
cmg50ziwp0001bpec0gxbv32c	cmg3zc6kf0002c2fkaq5c5a96	1	front	2025-09-29 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg3zc6kf0002c2fkaq5c5a96_week1_front_1759144114528.jpeg	\N	2025-09-29 11:08:35.771	2025-09-29 11:08:35.771
cmg50znij0003bpecoh493hhx	cmg3zc6kf0002c2fkaq5c5a96	1	side	2025-09-29 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg3zc6kf0002c2fkaq5c5a96_week1_side_1759144120445.jpeg	\N	2025-09-29 11:08:41.803	2025-09-29 11:08:41.803
cmgf1jrck000s6ofagfjc24yb	cmg40s3t400016reaj691t59r	1	back	2025-10-06 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg40s3t400016reaj691t59r_week1_back_1759749720349.jpeg	\N	2025-10-06 11:22:01.652	2025-10-06 11:22:01.652
cmgf1jhvz000o6ofacktkxpu9	cmg40s3t400016reaj691t59r	1	front	2025-10-06 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg40s3t400016reaj691t59r_week1_front_1759749708064.jpeg	\N	2025-10-06 11:21:49.329	2025-10-06 11:21:49.329
cmgf1jmi2000q6ofaenbvg8fu	cmg40s3t400016reaj691t59r	1	side	2025-10-06 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg40s3t400016reaj691t59r_week1_side_1759749714063.jpeg	\N	2025-10-06 11:21:55.37	2025-10-06 11:21:55.37
cmg65ytt20007cafp5udbczmv	cmg51euw20006bpec53j1e4bb	1	back	2025-09-30 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg51euw20006bpec53j1e4bb_week1_back_1759212946294.jpeg	\N	2025-09-30 06:15:47.559	2025-09-30 06:15:47.559
cmg65ymg00003cafpn3mkhl7k	cmg51euw20006bpec53j1e4bb	1	front	2025-09-30 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg51euw20006bpec53j1e4bb_week1_front_1759212936402.jpeg	\N	2025-09-30 06:15:37.955	2025-09-30 06:15:37.955
cmg65yqkr0005cafpqjmer5c8	cmg51euw20006bpec53j1e4bb	1	side	2025-09-30 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg51euw20006bpec53j1e4bb_week1_side_1759212942174.jpeg	\N	2025-09-30 06:15:43.372	2025-09-30 06:15:43.372
cmggwhqz9000580euikzdq2ry	cmg51euw20006bpec53j1e4bb	2	back	2025-10-07 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg51euw20006bpec53j1e4bb_week3_back_1759862160352.jpeg	\N	2025-10-07 18:36:02.134	2025-10-07 20:34:19.421
cmggwhhet000180eu0wkly29m	cmg51euw20006bpec53j1e4bb	2	front	2025-10-07 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg51euw20006bpec53j1e4bb_week3_front_1759862147758.jpeg	\N	2025-10-07 18:35:49.641	2025-10-07 20:34:19.421
cmggwhlxk000380euil730exy	cmg51euw20006bpec53j1e4bb	2	side	2025-10-07 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg51euw20006bpec53j1e4bb_week3_side_1759862154455.jpeg	\N	2025-10-07 18:35:55.592	2025-10-07 20:34:19.421
cmgf0pj2b00096ofa9i82mvjz	cmg8zzacg000093gx865cl2xm	1	back	2025-10-06 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg8zzacg000093gx865cl2xm_week1_back_1759748310032.jpeg	\N	2025-10-06 10:58:31.233	2025-10-06 10:58:31.233
cmgf0paaj00056ofad79op262	cmg8zzacg000093gx865cl2xm	1	front	2025-10-06 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg8zzacg000093gx865cl2xm_week1_front_1759748298979.jpeg	\N	2025-10-06 10:58:19.867	2025-10-06 10:58:19.867
cmgf0pegp00076ofalbch5av6	cmg8zzacg000093gx865cl2xm	1	side	2025-10-06 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg8zzacg000093gx865cl2xm_week1_side_1759748304156.jpeg	\N	2025-10-06 10:58:25.273	2025-10-06 10:58:25.273
cmggx731l000j80eu6ql3b2mc	cmgeu9tgh0000dfdld8yohhuy	1	back	2025-10-07 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeu9tgh0000dfdld8yohhuy_week1_back_1759863342641.jpeg	\N	2025-10-07 18:55:44.169	2025-10-07 18:55:44.169
cmggx6u85000f80eu6u0hw6ld	cmgeu9tgh0000dfdld8yohhuy	1	front	2025-10-07 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeu9tgh0000dfdld8yohhuy_week1_front_1759863331195.jpeg	\N	2025-10-07 18:55:32.679	2025-10-07 18:55:32.679
cmggx6ypf000h80euol40j4nv	cmgeu9tgh0000dfdld8yohhuy	1	side	2025-10-07 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeu9tgh0000dfdld8yohhuy_week1_side_1759863337170.jpeg	\N	2025-10-07 18:55:38.547	2025-10-07 18:55:38.547
cmggwm1co000b80eucmdfpcjb	cmgeufv4m0001dfdlqjcks11j	1	back	2025-10-07 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeufv4m0001dfdlqjcks11j_week1_back_1759862360508.jpeg	\N	2025-10-07 18:39:22.201	2025-10-07 18:39:22.201
cmggwls1y000780euzh2le11m	cmgeufv4m0001dfdlqjcks11j	1	front	2025-10-07 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeufv4m0001dfdlqjcks11j_week1_front_1759862345984.jpeg	\N	2025-10-07 18:39:10.084	2025-10-07 18:39:10.084
cmggwlwoj000980eulkjjms14	cmgeufv4m0001dfdlqjcks11j	1	side	2025-10-07 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeufv4m0001dfdlqjcks11j_week1_side_1759862354919.jpeg	\N	2025-10-07 18:39:16.147	2025-10-07 18:39:16.147
cmgqf2uw4002ddyj0z9r6ubo9	cmg3zc6kf0002c2fkaq5c5a96	2	front	2025-10-14 10:26:15.649	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg3zc6kf0002c2fkaq5c5a96_week2_front_1760056369690.jpeg	\N	2025-10-14 10:26:15.651	2025-10-14 10:26:15.651
cmgqf2va2002fdyj09i9t52p3	cmg3zc6kf0002c2fkaq5c5a96	2	side	2025-10-14 10:26:16.153	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg3zc6kf0002c2fkaq5c5a96_week2_side_1760056374543.jpeg	\N	2025-10-14 10:26:16.155	2025-10-14 10:26:16.155
cmgqf2vpf002hdyj02g9e6ske	cmg3zc6kf0002c2fkaq5c5a96	2	back	2025-10-14 10:26:16.705	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg3zc6kf0002c2fkaq5c5a96_week2_back_1760056378703.jpeg	\N	2025-10-14 10:26:16.707	2025-10-14 10:26:16.707
cmgqfnko9002jdyj0nbr7skco	cmg3zc6f00001c2fk7xcz8z9m	2	back	2025-10-14 10:42:22.183	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg3zc6f00001c2fk7xcz8z9m_week2_back_1759093706809.jpeg	\N	2025-10-14 10:42:22.185	2025-10-14 10:42:22.185
cmgqfnlto002ldyj02rk8dltm	cmg3zc6f00001c2fk7xcz8z9m	2	side	2025-10-14 10:42:23.675	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg3zc6f00001c2fk7xcz8z9m_week2_side_1759093701039.jpeg	\N	2025-10-14 10:42:23.677	2025-10-14 10:42:23.677
cmgqfnmyg002ndyj0j7bu1hak	cmg40s3t400016reaj691t59r	2	back	2025-10-14 10:42:25.143	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg40s3t400016reaj691t59r_week2_back_1760339204088.jpeg	\N	2025-10-14 10:42:25.144	2025-10-14 10:42:25.144
cmgqfnnca002pdyj08wuroqxt	cmg40s3t400016reaj691t59r	2	front	2025-10-14 10:42:25.641	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg40s3t400016reaj691t59r_week2_front_1760339191769.jpeg	\N	2025-10-14 10:42:25.642	2025-10-14 10:42:25.642
cmgqfnnpx002rdyj0rmq3tugk	cmg40s3t400016reaj691t59r	2	side	2025-10-14 10:42:26.132	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg40s3t400016reaj691t59r_week2_side_1760339198370.jpeg	\N	2025-10-14 10:42:26.134	2025-10-14 10:42:26.134
cmgqfo38s002tdyj08zwd7xx0	cmg72xn1g003sfofh52suc9zq	1	front	2025-10-14 10:42:46.251	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg72xn1g003sfofh52suc9zq_week1_front_1760259198646.jpeg	\N	2025-10-14 10:42:46.252	2025-10-14 10:42:46.252
cmgqfo3rm002vdyj0yonxt04y	cmg72xn1g003sfofh52suc9zq	1	side	2025-10-14 10:42:46.928	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg72xn1g003sfofh52suc9zq_week1_side_1760259203327.jpeg	\N	2025-10-14 10:42:46.93	2025-10-14 10:42:46.93
cmgqfo486002xdyj0papm9oa2	cmg72xn1g003sfofh52suc9zq	1	back	2025-10-14 10:42:47.525	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg72xn1g003sfofh52suc9zq_week1_back_1760259206894.jpeg	\N	2025-10-14 10:42:47.527	2025-10-14 10:42:47.527
cmgqsev7a0001jj04zpl488ek	cmgh0mdii006f89gxl5ejkg3d	1	front	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgh0mdii006f89gxl5ejkg3d_week1_front_1760459968785.jpeg	\N	2025-10-14 16:39:30.825	2025-10-14 16:39:30.825
cmgqsezyq0003jj049yl4j44x	cmgh0mdii006f89gxl5ejkg3d	1	side	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgh0mdii006f89gxl5ejkg3d_week1_side_1760459976021.jpeg	\N	2025-10-14 16:39:37.106	2025-10-14 16:39:37.106
cmgqsf5iq0005jj04kdyh1mpv	cmgh0mdii006f89gxl5ejkg3d	1	back	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgh0mdii006f89gxl5ejkg3d_week1_back_1760459983097.jpeg	\N	2025-10-14 16:39:44.306	2025-10-14 16:39:44.306
cmgqt0b370001ky04s92jk9q6	cmgeufv4m0001dfdlqjcks11j	2	front	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeufv4m0001dfdlqjcks11j_week2_front_1760460969744.jpeg	\N	2025-10-14 16:56:11.21	2025-10-14 16:56:11.21
cmgqt0fug0003ky04h4kj5hsg	cmgeufv4m0001dfdlqjcks11j	2	side	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeufv4m0001dfdlqjcks11j_week2_side_1760460976080.jpeg	\N	2025-10-14 16:56:17.465	2025-10-14 16:56:17.465
cmgqt0lvb0005ky04ddnw2yrc	cmgeufv4m0001dfdlqjcks11j	2	back	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeufv4m0001dfdlqjcks11j_week2_back_1760460983514.jpeg	\N	2025-10-14 16:56:25.271	2025-10-14 16:56:25.271
cmgqt2bn40001jt04y13rd4gt	cmgeu9tgh0000dfdld8yohhuy	2	front	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeu9tgh0000dfdld8yohhuy_week2_front_1760461064015.jpeg	\N	2025-10-14 16:57:45.24	2025-10-14 16:57:45.24
cmgqt2gtq0003jt048yvzl6ie	cmgeu9tgh0000dfdld8yohhuy	2	side	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeu9tgh0000dfdld8yohhuy_week2_side_1760461071031.jpeg	\N	2025-10-14 16:57:52.047	2025-10-14 16:57:52.047
cmgqt2lj80005jt04fkoa0tm1	cmgeu9tgh0000dfdld8yohhuy	2	back	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmgeu9tgh0000dfdld8yohhuy_week2_back_1760461076932.jpeg	\N	2025-10-14 16:57:58.149	2025-10-14 16:57:58.149
cmgquf6vi0001jr04m7jvh128	cmg51euw20006bpec53j1e4bb	3	front	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg51euw20006bpec53j1e4bb_week3_front_1760463344119.jpeg	\N	2025-10-14 17:35:45.208	2025-10-14 17:35:45.208
cmgqufccb0003jr044ilneiiv	cmg51euw20006bpec53j1e4bb	3	side	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg51euw20006bpec53j1e4bb_week3_side_1760463351152.jpeg	\N	2025-10-14 17:35:52.38	2025-10-14 17:35:52.38
cmgqufhmq0005jr04pqmzumzo	cmg51euw20006bpec53j1e4bb	3	back	2025-10-14 00:00:00	https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/customer-photos/cmg51euw20006bpec53j1e4bb_week3_back_1760463357762.jpeg	\N	2025-10-14 17:35:59.234	2025-10-14 17:35:59.234
\.


--
-- Data for Name: customer_progression; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_progression (id, "customerId", week, date, endurance, strength, flexibility, balance, "goalAchieved", "goalProgress", "goalNotes", "progressRating", "trainerNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: customer_schedule_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_schedule_assignments (id, "customerId", "workoutId", weekday, "trainingDay", "isActive", "createdAt", "updatedAt") FROM stdin;
cmgqdyvb30017dyj0pkts3r4h	cmgeufv4m0001dfdlqjcks11j	cmg418zs8000w6reaop5d59tc	1	1	t	2025-10-14 09:55:09.951	2025-10-14 09:55:09.951
cmgqdyvhx0019dyj048t3is1m	cmgeufv4m0001dfdlqjcks11j	cmg418zs8000w6reaop5d59tc	2	2	t	2025-10-14 09:55:10.197	2025-10-14 09:55:10.197
cmgqdyvos001bdyj0fpd9dh8i	cmgeufv4m0001dfdlqjcks11j	cmg418zs8000w6reaop5d59tc	3	3	t	2025-10-14 09:55:10.444	2025-10-14 09:55:10.444
cmgqdyw2k001ddyj0f2mmfrxo	cmgeu9tgh0000dfdld8yohhuy	cmg418zs8000w6reaop5d59tc	1	1	t	2025-10-14 09:55:10.94	2025-10-14 09:55:10.94
cmgqdyw9a001fdyj0cbjb52vc	cmgeu9tgh0000dfdld8yohhuy	cmg418zs8000w6reaop5d59tc	2	2	t	2025-10-14 09:55:11.182	2025-10-14 09:55:11.182
cmgqdywfw001hdyj0ticj5kvd	cmgeu9tgh0000dfdld8yohhuy	cmg418zs8000w6reaop5d59tc	3	3	t	2025-10-14 09:55:11.421	2025-10-14 09:55:11.421
cmgqdywtf001jdyj0l71sgihd	cmg72xn1g003sfofh52suc9zq	cmg418zs8000w6reaop5d59tc	1	1	t	2025-10-14 09:55:11.908	2025-10-14 09:55:11.908
cmgqdyx03001ldyj075tnaq99	cmg72xn1g003sfofh52suc9zq	cmg418zs8000w6reaop5d59tc	2	2	t	2025-10-14 09:55:12.147	2025-10-14 09:55:12.147
cmgqdyx70001ndyj0otxkz9rh	cmg72xn1g003sfofh52suc9zq	cmg418zs8000w6reaop5d59tc	3	3	t	2025-10-14 09:55:12.397	2025-10-14 09:55:12.397
cmgqdyxkg001pdyj0ifp0mzar	cmg8zzacg000093gx865cl2xm	cmg418zs8000w6reaop5d59tc	1	1	t	2025-10-14 09:55:12.881	2025-10-14 09:55:12.881
cmgqdyxr2001rdyj0sp9flnad	cmg8zzacg000093gx865cl2xm	cmg418zs8000w6reaop5d59tc	2	2	t	2025-10-14 09:55:13.119	2025-10-14 09:55:13.119
cmgqdyxxq001tdyj0c9y002vt	cmg8zzacg000093gx865cl2xm	cmg418zs8000w6reaop5d59tc	3	3	t	2025-10-14 09:55:13.359	2025-10-14 09:55:13.359
cmgqdyyb8001vdyj03i22mxbc	cmg51euw20006bpec53j1e4bb	cmg418zs8000w6reaop5d59tc	1	1	t	2025-10-14 09:55:13.844	2025-10-14 09:55:13.844
cmgqdyyj6001xdyj01zoy8tvd	cmg51euw20006bpec53j1e4bb	cmg418zs8000w6reaop5d59tc	2	2	t	2025-10-14 09:55:14.083	2025-10-14 09:55:14.083
cmgqdyyq9001zdyj0109o6z0m	cmg51euw20006bpec53j1e4bb	cmg418zs8000w6reaop5d59tc	3	3	t	2025-10-14 09:55:14.385	2025-10-14 09:55:14.385
cmgqdyz3t0021dyj0cca05aso	cmg40s3t400016reaj691t59r	cmg418zs8000w6reaop5d59tc	1	1	t	2025-10-14 09:55:14.874	2025-10-14 09:55:14.874
cmgqdyzaw0023dyj0am245iss	cmg40s3t400016reaj691t59r	cmg418zs8000w6reaop5d59tc	2	2	t	2025-10-14 09:55:15.128	2025-10-14 09:55:15.128
cmgqdyzho0025dyj0d9bu0gcv	cmg40s3t400016reaj691t59r	cmg418zs8000w6reaop5d59tc	3	3	t	2025-10-14 09:55:15.372	2025-10-14 09:55:15.372
cmgqdyzvb0027dyj0x6pqdp31	cmg3zc6kf0002c2fkaq5c5a96	cmg418zs8000w6reaop5d59tc	1	1	t	2025-10-14 09:55:15.864	2025-10-14 09:55:15.864
cmgqdz02d0029dyj05oih824j	cmg3zc6kf0002c2fkaq5c5a96	cmg418zs8000w6reaop5d59tc	2	2	t	2025-10-14 09:55:16.117	2025-10-14 09:55:16.117
cmgqdz093002bdyj089ozjdm5	cmg3zc6kf0002c2fkaq5c5a96	cmg418zs8000w6reaop5d59tc	3	3	t	2025-10-14 09:55:16.36	2025-10-14 09:55:16.36
\.


--
-- Data for Name: customer_workouts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_workouts (id, "customerId", "workoutId", "assignedAt", status, notes, "createdAt", "updatedAt") FROM stdin;
cmg46ka9s000datebv9c34hh5	cmg3zc6f00001c2fk7xcz8z9m	cmg418zs8000w6reaop5d59tc	2025-09-28 20:56:56.32	active		2025-09-28 20:56:56.32	2025-09-28 20:56:56.32
cmg46km1t000fateb8xm12mzd	cmg3zc6kf0002c2fkaq5c5a96	cmg418zs8000w6reaop5d59tc	2025-09-28 20:57:11.585	active		2025-09-28 20:57:11.585	2025-09-28 20:57:11.585
cmg46l13a000hatebhuzojjqe	cmg40s3t400016reaj691t59r	cmg418zs8000w6reaop5d59tc	2025-09-28 20:57:31.079	active		2025-09-28 20:57:31.079	2025-09-28 20:57:31.079
\.


--
-- Data for Name: exercise_set_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exercise_set_logs (id, session_id, customer_id, training_day, workout_id, exercise_id, set_number, weight_kg, reps_done, created_at) FROM stdin;
\.


--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exercises (id, name, description, "muscleGroup", equipment, difficulty, category, instructions, tips, "videoUrl", "imageUrl", "isActive", "createdAt", "updatedAt") FROM stdin;
cmg3zc6rn0003c2fkd07enlqz	Bench Press	Classic chest exercise performed with a barbell	chest	barbell	intermediate	strength	Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up	Keep feet flat on floor, maintain arch in back, control the weight	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn0004c2fkqbe5fcca	Incline Dumbbell Press	Upper chest focused pressing movement	chest	dumbbell	intermediate	strength	Set bench to 30-45 degree incline, press dumbbells up and together	Focus on upper chest, keep core tight, control the negative	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn0005c2fkcppeshz9	Push-ups	Bodyweight chest exercise	chest	bodyweight	beginner	strength	Start in plank position, lower chest to ground, push back up	Keep body straight, engage core, full range of motion	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn0006c2fkhm7ztssx	Pull-ups	Bodyweight back exercise	back	bodyweight	advanced	strength	Hang from bar, pull body up until chin clears bar, lower slowly	Engage lats, avoid swinging, full range of motion	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn0007c2fkqsxspvt6	Barbell Rows	Horizontal pulling exercise for back	back	barbell	intermediate	strength	Bend forward, pull bar to lower chest, squeeze shoulder blades	Keep back straight, pull with elbows, control the weight	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn0008c2fkdocrkylm	Lat Pulldown	Machine-based vertical pulling exercise	back	machine	beginner	strength	Pull bar to upper chest, squeeze lats, return slowly	Lean back slightly, pull with lats not arms, full stretch	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn0009c2fkvhwwdbj4	Overhead Press	Vertical pressing movement for shoulders	shoulders	barbell	intermediate	strength	Press bar from shoulder height to overhead, lower with control	Keep core tight, press straight up, full range of motion	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000ac2fk1rit5fmb	Lateral Raises	Isolation exercise for side delts	shoulders	dumbbell	beginner	strength	Raise arms to sides until parallel to floor, lower slowly	Slight bend in elbows, control the weight, avoid swinging	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000bc2fk3bvxzraz	Rear Delt Flyes	Posterior deltoid isolation exercise	shoulders	dumbbell	beginner	strength	Bend forward, raise arms to sides, squeeze rear delts	Keep slight bend in elbows, focus on rear delts, control movement	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000cc2fkzi2dx2os	Bicep Curls	Classic bicep isolation exercise	arms	dumbbell	beginner	strength	Curl weights up, squeeze biceps, lower slowly	Keep elbows at sides, full range of motion, control the negative	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000dc2fkczsos0ny	Tricep Dips	Bodyweight tricep exercise	arms	bodyweight	intermediate	strength	Lower body using arms, push back up, keep elbows close	Keep body upright, full range of motion, control the movement	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000ec2fk3i7c9tt0	Hammer Curls	Bicep exercise with neutral grip	arms	dumbbell	beginner	strength	Curl with neutral grip, squeeze biceps, lower slowly	Keep wrists neutral, full range of motion, control the weight	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000fc2fkae8b216d	Squats	Fundamental leg exercise	legs	barbell	intermediate	strength	Lower until thighs parallel to floor, drive through heels to stand	Keep chest up, knees track over toes, full depth	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000gc2fk0vnbzoee	Romanian Deadlifts	Hip hinge movement for posterior chain	legs	barbell	intermediate	strength	Hinge at hips, lower bar along legs, return to standing	Keep back straight, feel stretch in hamstrings, drive hips forward	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000hc2fkfwsfgvf0	Walking Lunges	Dynamic single leg exercise	legs	bodyweight	beginner	strength	Step forward into lunge, push back up, alternate legs	Keep torso upright, full range of motion, control the movement	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000ic2fkipmq2ses	Leg Press	Machine-based leg exercise	legs	machine	beginner	strength	Push platform away, lower with control, drive through heels	Keep knees aligned, full range of motion, control the weight	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000jc2fkhp2nhnif	Hip Thrusts	Primary glute strengthening exercise	glutes	barbell	intermediate	strength	Drive hips up, squeeze glutes, lower with control	Keep core tight, drive through heels, full hip extension	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000kc2fkk8a8forf	Glute Bridges	Bodyweight glute exercise	glutes	bodyweight	beginner	strength	Lift hips up, squeeze glutes, lower slowly	Keep feet close to glutes, drive through heels, squeeze at top	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000lc2fkq2ahgivk	Bulgarian Split Squats	Single leg glute and quad exercise	glutes	bodyweight	intermediate	strength	Rear foot elevated, lower into lunge, drive up through front heel	Keep torso upright, full range of motion, control the movement	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000mc2fkizr5yw9l	Cable Kickbacks	Isolation exercise for glutes	glutes	cable	beginner	strength	Kick leg back, squeeze glute, return slowly	Keep core tight, focus on glute contraction, control the movement	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000nc2fk1o7b32st	Plank	Isometric core strengthening exercise	core	bodyweight	beginner	strength	Hold straight line from head to heels, engage core	Keep body straight, breathe normally, engage entire core	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000oc2fkyf1tt9s4	Dead Bug	Core stability exercise	core	bodyweight	beginner	strength	Lower opposite arm and leg, return to start, alternate	Keep lower back pressed to floor, move slowly, maintain tension	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000pc2fk42s2rh8u	Russian Twists	Rotational core exercise	core	bodyweight	beginner	strength	Rotate torso side to side, keep feet off ground	Keep core tight, control the rotation, full range of motion	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000qc2fk9e2ibqhm	Box Jumps	Explosive plyometric exercise	cardio	box	advanced	plyometric	Jump onto box, step down, repeat	Land softly, full hip extension, control the landing	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000rc2fksezlnpv9	Burpees	Full body cardio exercise	cardio	bodyweight	advanced	cardio	Drop to push-up, jump feet to hands, jump up	Maintain form, control the movement, full range of motion	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zc6rn000sc2fkzljym5ff	Mountain Climbers	Dynamic cardio exercise	cardio	bodyweight	intermediate	cardio	Alternate bringing knees to chest in plank position	Keep core tight, maintain plank position, quick movements	\N	\N	t	2025-09-28 17:34:41.219	2025-09-28 17:34:41.219
cmg3zflrk001zc2fkxubzh3s3	Bench Press	Classic chest exercise performed with a barbell	chest	barbell	intermediate	strength	Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up	Keep feet flat on floor, maintain arch in back, control the weight	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk0020c2fk2mc1f4pr	Incline Dumbbell Press	Upper chest focused pressing movement	chest	dumbbell	intermediate	strength	Set bench to 30-45 degree incline, press dumbbells up and together	Focus on upper chest, keep core tight, control the negative	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk0021c2fkwwkzywmo	Push-ups	Bodyweight chest exercise	chest	bodyweight	beginner	strength	Start in plank position, lower chest to ground, push back up	Keep body straight, engage core, full range of motion	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk0022c2fks7wyj4sv	Pull-ups	Bodyweight back exercise	back	bodyweight	advanced	strength	Hang from bar, pull body up until chin clears bar, lower slowly	Engage lats, avoid swinging, full range of motion	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk0023c2fkz3zu4y6f	Barbell Rows	Horizontal pulling exercise for back	back	barbell	intermediate	strength	Bend forward, pull bar to lower chest, squeeze shoulder blades	Keep back straight, pull with elbows, control the weight	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk0024c2fk032pjdro	Lat Pulldown	Machine-based vertical pulling exercise	back	machine	beginner	strength	Pull bar to upper chest, squeeze lats, return slowly	Lean back slightly, pull with lats not arms, full stretch	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk0025c2fkzocw37xl	Overhead Press	Vertical pressing movement for shoulders	shoulders	barbell	intermediate	strength	Press bar from shoulder height to overhead, lower with control	Keep core tight, press straight up, full range of motion	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk0026c2fkqxhaodav	Lateral Raises	Isolation exercise for side delts	shoulders	dumbbell	beginner	strength	Raise arms to sides until parallel to floor, lower slowly	Slight bend in elbows, control the weight, avoid swinging	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk0027c2fkdvcr6lib	Rear Delt Flyes	Posterior deltoid isolation exercise	shoulders	dumbbell	beginner	strength	Bend forward, raise arms to sides, squeeze rear delts	Keep slight bend in elbows, focus on rear delts, control movement	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk0028c2fkusultmlh	Bicep Curls	Classic bicep isolation exercise	arms	dumbbell	beginner	strength	Curl weights up, squeeze biceps, lower slowly	Keep elbows at sides, full range of motion, control the negative	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk0029c2fk93uow014	Tricep Dips	Bodyweight tricep exercise	arms	bodyweight	intermediate	strength	Lower body using arms, push back up, keep elbows close	Keep body upright, full range of motion, control the movement	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk002ac2fkotsphwln	Hammer Curls	Bicep exercise with neutral grip	arms	dumbbell	beginner	strength	Curl with neutral grip, squeeze biceps, lower slowly	Keep wrists neutral, full range of motion, control the weight	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk002bc2fky2koxldn	Squats	Fundamental leg exercise	legs	barbell	intermediate	strength	Lower until thighs parallel to floor, drive through heels to stand	Keep chest up, knees track over toes, full depth	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk002cc2fko0ljsorw	Romanian Deadlifts	Hip hinge movement for posterior chain	legs	barbell	intermediate	strength	Hinge at hips, lower bar along legs, return to standing	Keep back straight, feel stretch in hamstrings, drive hips forward	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk002dc2fkmfhd4bkf	Walking Lunges	Dynamic single leg exercise	legs	bodyweight	beginner	strength	Step forward into lunge, push back up, alternate legs	Keep torso upright, full range of motion, control the movement	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrk002ec2fkewy80scf	Leg Press	Machine-based leg exercise	legs	machine	beginner	strength	Push platform away, lower with control, drive through heels	Keep knees aligned, full range of motion, control the weight	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrl002fc2fkfnpwmnwp	Hip Thrusts	Primary glute strengthening exercise	glutes	barbell	intermediate	strength	Drive hips up, squeeze glutes, lower with control	Keep core tight, drive through heels, full hip extension	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrl002gc2fkc6ruj1k2	Glute Bridges	Bodyweight glute exercise	glutes	bodyweight	beginner	strength	Lift hips up, squeeze glutes, lower slowly	Keep feet close to glutes, drive through heels, squeeze at top	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrl002hc2fkiuh4bzbg	Bulgarian Split Squats	Single leg glute and quad exercise	glutes	bodyweight	intermediate	strength	Rear foot elevated, lower into lunge, drive up through front heel	Keep torso upright, full range of motion, control the movement	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrl002ic2fkibmsic9o	Cable Kickbacks	Isolation exercise for glutes	glutes	cable	beginner	strength	Kick leg back, squeeze glute, return slowly	Keep core tight, focus on glute contraction, control the movement	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrl002jc2fkhxm7p175	Plank	Isometric core strengthening exercise	core	bodyweight	beginner	strength	Hold straight line from head to heels, engage core	Keep body straight, breathe normally, engage entire core	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrl002kc2fkt9ctgsmi	Dead Bug	Core stability exercise	core	bodyweight	beginner	strength	Lower opposite arm and leg, return to start, alternate	Keep lower back pressed to floor, move slowly, maintain tension	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrl002lc2fk3qwm2qgg	Russian Twists	Rotational core exercise	core	bodyweight	beginner	strength	Rotate torso side to side, keep feet off ground	Keep core tight, control the rotation, full range of motion	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrl002mc2fkg9vu9jo6	Box Jumps	Explosive plyometric exercise	cardio	box	advanced	plyometric	Jump onto box, step down, repeat	Land softly, full hip extension, control the landing	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrl002nc2fkn6ahgtlu	Burpees	Full body cardio exercise	cardio	bodyweight	advanced	cardio	Drop to push-up, jump feet to hands, jump up	Maintain form, control the movement, full range of motion	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zflrl002oc2fkr12boq7q	Mountain Climbers	Dynamic cardio exercise	cardio	bodyweight	intermediate	cardio	Alternate bringing knees to chest in plank position	Keep core tight, maintain plank position, quick movements	\N	\N	t	2025-09-28 17:37:20.624	2025-09-28 17:37:20.624
cmg3zldad003vc2fkiqishiny	Bench Press	Classic chest exercise performed with a barbell	chest	barbell	intermediate	strength	Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up	Keep feet flat on floor, maintain arch in back, control the weight	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad003wc2fkm06k45ci	Incline Dumbbell Press	Upper chest focused pressing movement	chest	dumbbell	intermediate	strength	Set bench to 30-45 degree incline, press dumbbells up and together	Focus on upper chest, keep core tight, control the negative	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad003xc2fkj8w9akgb	Push-ups	Bodyweight chest exercise	chest	bodyweight	beginner	strength	Start in plank position, lower chest to ground, push back up	Keep body straight, engage core, full range of motion	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad003yc2fkd6ntqktn	Pull-ups	Bodyweight back exercise	back	bodyweight	advanced	strength	Hang from bar, pull body up until chin clears bar, lower slowly	Engage lats, avoid swinging, full range of motion	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad003zc2fk6ymodpdi	Barbell Rows	Horizontal pulling exercise for back	back	barbell	intermediate	strength	Bend forward, pull bar to lower chest, squeeze shoulder blades	Keep back straight, pull with elbows, control the weight	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad0040c2fkn07s63g7	Lat Pulldown	Machine-based vertical pulling exercise	back	machine	beginner	strength	Pull bar to upper chest, squeeze lats, return slowly	Lean back slightly, pull with lats not arms, full stretch	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad0041c2fkcrmtzfrh	Overhead Press	Vertical pressing movement for shoulders	shoulders	barbell	intermediate	strength	Press bar from shoulder height to overhead, lower with control	Keep core tight, press straight up, full range of motion	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad0042c2fk6ydj1k4j	Lateral Raises	Isolation exercise for side delts	shoulders	dumbbell	beginner	strength	Raise arms to sides until parallel to floor, lower slowly	Slight bend in elbows, control the weight, avoid swinging	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad0043c2fk97zjvjri	Rear Delt Flyes	Posterior deltoid isolation exercise	shoulders	dumbbell	beginner	strength	Bend forward, raise arms to sides, squeeze rear delts	Keep slight bend in elbows, focus on rear delts, control movement	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad0044c2fkjq9hbk8m	Bicep Curls	Classic bicep isolation exercise	arms	dumbbell	beginner	strength	Curl weights up, squeeze biceps, lower slowly	Keep elbows at sides, full range of motion, control the negative	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad0045c2fkloduytez	Tricep Dips	Bodyweight tricep exercise	arms	bodyweight	intermediate	strength	Lower body using arms, push back up, keep elbows close	Keep body upright, full range of motion, control the movement	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad0046c2fkcstxxoaa	Hammer Curls	Bicep exercise with neutral grip	arms	dumbbell	beginner	strength	Curl with neutral grip, squeeze biceps, lower slowly	Keep wrists neutral, full range of motion, control the weight	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad0047c2fk9mruozoy	Squats	Fundamental leg exercise	legs	barbell	intermediate	strength	Lower until thighs parallel to floor, drive through heels to stand	Keep chest up, knees track over toes, full depth	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad0048c2fk451dfg17	Romanian Deadlifts	Hip hinge movement for posterior chain	legs	barbell	intermediate	strength	Hinge at hips, lower bar along legs, return to standing	Keep back straight, feel stretch in hamstrings, drive hips forward	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad0049c2fk42n0coc4	Walking Lunges	Dynamic single leg exercise	legs	bodyweight	beginner	strength	Step forward into lunge, push back up, alternate legs	Keep torso upright, full range of motion, control the movement	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad004ac2fkh3gpiii1	Leg Press	Machine-based leg exercise	legs	machine	beginner	strength	Push platform away, lower with control, drive through heels	Keep knees aligned, full range of motion, control the weight	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad004bc2fkd2t01e5v	Hip Thrusts	Primary glute strengthening exercise	glutes	barbell	intermediate	strength	Drive hips up, squeeze glutes, lower with control	Keep core tight, drive through heels, full hip extension	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad004cc2fkptw339ga	Glute Bridges	Bodyweight glute exercise	glutes	bodyweight	beginner	strength	Lift hips up, squeeze glutes, lower slowly	Keep feet close to glutes, drive through heels, squeeze at top	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad004dc2fkkj3w5p15	Bulgarian Split Squats	Single leg glute and quad exercise	glutes	bodyweight	intermediate	strength	Rear foot elevated, lower into lunge, drive up through front heel	Keep torso upright, full range of motion, control the movement	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad004ec2fksif5bhwy	Cable Kickbacks	Isolation exercise for glutes	glutes	cable	beginner	strength	Kick leg back, squeeze glute, return slowly	Keep core tight, focus on glute contraction, control the movement	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad004fc2fk8ddp7771	Plank	Isometric core strengthening exercise	core	bodyweight	beginner	strength	Hold straight line from head to heels, engage core	Keep body straight, breathe normally, engage entire core	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad004gc2fkv8nbetwx	Dead Bug	Core stability exercise	core	bodyweight	beginner	strength	Lower opposite arm and leg, return to start, alternate	Keep lower back pressed to floor, move slowly, maintain tension	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad004hc2fkoi5403i1	Russian Twists	Rotational core exercise	core	bodyweight	beginner	strength	Rotate torso side to side, keep feet off ground	Keep core tight, control the rotation, full range of motion	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad004ic2fkh2ta14z6	Box Jumps	Explosive plyometric exercise	cardio	box	advanced	plyometric	Jump onto box, step down, repeat	Land softly, full hip extension, control the landing	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad004jc2fk1nktuxs7	Burpees	Full body cardio exercise	cardio	bodyweight	advanced	cardio	Drop to push-up, jump feet to hands, jump up	Maintain form, control the movement, full range of motion	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg3zldad004kc2fknkd516ld	Mountain Climbers	Dynamic cardio exercise	cardio	bodyweight	intermediate	cardio	Alternate bringing knees to chest in plank position	Keep core tight, maintain plank position, quick movements	\N	\N	t	2025-09-28 17:41:49.573	2025-09-28 17:41:49.573
cmg5n34tr006c7ugxndpm0e0h	Jumping Jacks	Full body cardio exercise	cardio	bodyweight	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:15.692	2025-09-29 21:27:15.692
cmg5n358s006d7ugx4u6j15s6	High Knees	Running in place with high knees	cardio	bodyweight	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:16.301	2025-09-29 21:27:16.301
cmg5n35dq006e7ugxjd1g2932	Jump Rope	Cardio exercise with jump rope	cardio	rope	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:16.478	2025-09-29 21:27:16.478
cmg5n35gy006f7ugxad3c0uqm	Light Jogging	Light running in place	cardio	bodyweight	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:16.594	2025-09-29 21:27:16.594
cmg5n35kc006g7ugxb1mraw29	Clam Shells	Side-lying hip abduction exercise	glutes	bodyweight	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:16.717	2025-09-29 21:27:16.717
cmg5n35nj006h7ugxhdahgjpt	Monster Walks	Lateral walking with resistance band	glutes	band	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:16.831	2025-09-29 21:27:16.831
cmg5n35sb006i7ugxqcavkxj1	Glute Kickbacks	Hip extension exercise	glutes	cable	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:17.003	2025-09-29 21:27:17.003
cmg5n35vl006j7ugxq643n4go	Abductor Machine	Hip abduction on machine	glutes	machine	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:17.122	2025-09-29 21:27:17.122
cmg5n35yj006k7ugxvtwx1q4d	Inchworm Walkouts	Full body movement from standing to plank	core	bodyweight	intermediate	strength	\N	\N	\N	\N	t	2025-09-29 21:27:17.227	2025-09-29 21:27:17.227
cmg5n362s006l7ugxxjosuw23	Bicycle Crunches	Alternating knee-to-elbow crunches	core	bodyweight	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:17.38	2025-09-29 21:27:17.38
cmg5n366o006m7ugx1wo7an85	Leg Raises	Lying leg raises	core	bodyweight	intermediate	strength	\N	\N	\N	\N	t	2025-09-29 21:27:17.52	2025-09-29 21:27:17.52
cmg5n36ai006n7ugx9h5a4ftj	Crunches	Basic abdominal crunches	core	bodyweight	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:17.659	2025-09-29 21:27:17.659
cmg5n36dx006o7ugx8v55zbzi	Heel Touches	Side crunches touching heels	core	bodyweight	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:17.782	2025-09-29 21:27:17.782
cmg5n36hb006p7ugxg3sxym1h	Reverse Crunches	Reverse abdominal crunches	core	bodyweight	intermediate	strength	\N	\N	\N	\N	t	2025-09-29 21:27:17.903	2025-09-29 21:27:17.903
cmg5n36lb006q7ugxzdqgnyw0	Scapula Retractions	Shoulder blade squeezing exercise	back	cable	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:18.047	2025-09-29 21:27:18.047
cmg5n36o7006r7ugxfk9gu9ru	Resistance Band Face Pulls	Face pulls with resistance band	back	band	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:18.152	2025-09-29 21:27:18.152
cmg5n36ro006s7ugxiuu47vo0	Seated Row	Seated cable row	back	cable	intermediate	strength	\N	\N	\N	\N	t	2025-09-29 21:27:18.276	2025-09-29 21:27:18.276
cmg5n36vz006t7ugxavw7f62l	Single-Arm Row	Single arm dumbbell row	back	dumbbells	intermediate	strength	\N	\N	\N	\N	t	2025-09-29 21:27:18.432	2025-09-29 21:27:18.432
cmg5n3704006u7ugx8n5zv2t6	Triceps Pushdowns	Cable tricep pushdown	arms	cable	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:18.581	2025-09-29 21:27:18.581
cmg5n3733006v7ugx1ailslny	Overhead Triceps Extension	Overhead tricep extension	arms	dumbbell	intermediate	strength	\N	\N	\N	\N	t	2025-09-29 21:27:18.687	2025-09-29 21:27:18.687
cmg5n376g006w7ugx4h2dpl08	Biceps Curls	Dumbbell bicep curls	arms	dumbbells	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:18.808	2025-09-29 21:27:18.808
cmg5n379i006x7ugx5jnfhlb6	Arm Circles	Circular arm movements	shoulders	bodyweight	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:18.918	2025-09-29 21:27:18.918
cmg5n37ef006y7ugx4e124ddh	Arm Swings	Dynamic arm swinging	shoulders	bodyweight	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:19.096	2025-09-29 21:27:19.096
cmg5n37hm006z7ugxkg28p7o3	Shoulder Rolls	Circular shoulder movements	shoulders	bodyweight	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:19.211	2025-09-29 21:27:19.211
cmg5n37ln00707ugx7j1pfhqm	Band Pull-aparts	Resistance band pull-aparts	shoulders	band	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:19.356	2025-09-29 21:27:19.356
cmg5n37ph00717ugxge8n6vkd	Front Raises	Dumbbell front raises	shoulders	dumbbells	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:19.494	2025-09-29 21:27:19.494
cmg5n37tu00727ugxdib9bni2	Shoulder Press	Dumbbell shoulder press	shoulders	dumbbells	intermediate	strength	\N	\N	\N	\N	t	2025-09-29 21:27:19.65	2025-09-29 21:27:19.65
cmg5n37wx00737ugxg4ncgbll	Arnold Press	Arnold shoulder press	shoulders	dumbbells	intermediate	strength	\N	\N	\N	\N	t	2025-09-29 21:27:19.762	2025-09-29 21:27:19.762
cmg5n37zz00747ugxder4ogp1	Dynamic Chest Opener	Chest opening stretch	chest	bodyweight	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:19.871	2025-09-29 21:27:19.871
cmg5n383j00757ugxwodvbqjn	Chest Press Machine	Machine chest press	chest	machine	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:20	2025-09-29 21:27:20
cmg5n388e00767ugxqbr9aexm	Pec Deck	Pec deck machine	chest	machine	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:20.174	2025-09-29 21:27:20.174
cmg5n38bv00777ugx2l3owkdy	Butterfly	Butterfly machine	chest	machine	beginner	strength	\N	\N	\N	\N	t	2025-09-29 21:27:20.3	2025-09-29 21:27:20.3
cmg6oxidp0007anebvrw7a1uw	Jumping jacks	Full body warm-up exercise	Full Body	Bodyweight	Beginner	Warm-up	Stand with feet together, arms at sides. Jump up spreading feet shoulder-width apart while raising arms overhead. Jump back to starting position.	Keep core engaged, land softly on balls of feet	\N	\N	t	2025-09-30 15:06:38.798	2025-09-30 15:06:38.798
cmg6oxije0008aneb4cr2jxwr	High knees	Running in place with high knee lifts	Full Body	Bodyweight	Beginner	Warm-up	Run in place, bringing knees up towards chest. Pump arms naturally.	Maintain upright posture, engage core	\N	\N	t	2025-09-30 15:06:39.003	2025-09-30 15:06:39.003
cmg6oxion0009anebip168yat	Bodyweight squats	Basic squat movement	Legs	Bodyweight	Beginner	Strength	Stand with feet shoulder-width apart. Lower down as if sitting back into a chair, then return to standing.	Keep chest up, knees tracking over toes	\N	\N	t	2025-09-30 15:06:39.191	2025-09-30 15:06:39.191
cmg6oxitw000aanebbdeueabz	Walking lunges	Forward stepping lunges	Legs	Bodyweight	Beginner	Strength	Step forward into lunge position, lower back knee towards ground, then step forward with other leg.	Keep torso upright, don't let front knee go past toes	\N	\N	t	2025-09-30 15:06:39.38	2025-09-30 15:06:39.38
cmg6oxiz0000baneb8tjt30gt	Arm circles	Shoulder mobility exercise	Shoulders	Bodyweight	Beginner	Warm-up	Extend arms to sides, make small circles forward and backward.	Keep movements controlled, don't force range of motion	\N	\N	t	2025-09-30 15:06:39.565	2025-09-30 15:06:39.565
cmg6oxjbj000caneblw7crm50	Inchworm walkouts	Full body mobility exercise	Full Body	Bodyweight	Intermediate	Warm-up	From standing, bend forward and walk hands out to plank position, then walk hands back to feet.	Keep legs straight, engage core throughout	\N	\N	t	2025-09-30 15:06:40.016	2025-09-30 15:06:40.016
cmg6oxjgq000daneb7tk3o2in	Arm swings	Dynamic shoulder warm-up	Shoulders	Bodyweight	Beginner	Warm-up	Swing arms forward and backward in large circles.	Start small, gradually increase range of motion	\N	\N	t	2025-09-30 15:06:40.202	2025-09-30 15:06:40.202
cmg6oxjlz000eanebh85eapjc	Shoulder rolls	Shoulder mobility exercise	Shoulders	Bodyweight	Beginner	Warm-up	Roll shoulders forward and backward in circular motion.	Move slowly and controlled	\N	\N	t	2025-09-30 15:06:40.391	2025-09-30 15:06:40.391
cmg6oxjrc000fanebd54o42gh	Dynamic chest opener	Chest and shoulder mobility	Chest	Bodyweight	Beginner	Warm-up	Extend arms to sides, bring them forward and back in controlled motion.	Feel stretch across chest	\N	\N	t	2025-09-30 15:06:40.585	2025-09-30 15:06:40.585
cmg6oxjwv000ganebm2os799f	Light jogging on the spot	Cardio warm-up	Full Body	Bodyweight	Beginner	Warm-up	Jog in place with light, bouncy steps.	Stay light on feet, pump arms naturally	\N	\N	t	2025-09-30 15:06:40.783	2025-09-30 15:06:40.783
cmg6oxk23000haneb7w81712a	Glute bridges	Glute activation exercise	Glutes	Bodyweight	Beginner	Activation	Lie on back, knees bent, feet flat. Lift hips up squeezing glutes at top.	Hold at top for 2 seconds, squeeze glutes hard	\N	\N	t	2025-09-30 15:06:40.972	2025-09-30 15:06:40.972
cmg6oxk7a000ianebcjw1pcmz	Clam shells	Hip and glute activation	Glutes	Bodyweight	Beginner	Activation	Lie on side, knees bent. Keep feet together, lift top knee up.	Don't let hips roll back, focus on glute activation	\N	\N	t	2025-09-30 15:06:41.159	2025-09-30 15:06:41.159
cmg6oxkcy000janeb3fzja9yy	Monster walks	Lateral glute activation	Glutes	Bodyweight	Beginner	Activation	Squat position, take lateral steps while maintaining squat.	Keep knees tracking over toes, stay low	\N	\N	t	2025-09-30 15:06:41.363	2025-09-30 15:06:41.363
cmg6oxkii000kanebga7y2ik3	Hip thrust	Glute-focused compound exercise	Glutes	Barbell	Intermediate	Strength	Sit with upper back against bench, barbell across hips. Drive hips up squeezing glutes.	Hold at top, squeeze glutes hard, control descent	\N	\N	t	2025-09-30 15:06:41.563	2025-09-30 15:06:41.563
cmg6oxknq000lanebp0nujp5g	Squat	Lower body compound exercise	Legs	Barbell	Intermediate	Strength	Stand with feet shoulder-width apart, barbell on back. Lower down as if sitting back, then drive up.	Keep chest up, knees tracking over toes, drive through heels	\N	\N	t	2025-09-30 15:06:41.751	2025-09-30 15:06:41.751
cmg6oxktt000manebt1xkmvj2	Romanian deadlift	Hip hinge movement	Hamstrings	Barbell	Intermediate	Strength	Stand holding barbell, hinge at hips keeping legs straighter, lower bar down legs, return to standing.	Keep chest up, feel stretch in hamstrings	\N	\N	t	2025-09-30 15:06:41.969	2025-09-30 15:06:41.969
cmg6oxkzm000naneb8i9o6vfw	Bulgarian split squat	Single leg squat variation	Legs	Bodyweight	Intermediate	Strength	Stand in front of bench, place rear foot on bench. Lower down into lunge position, drive up.	Keep front knee tracking over toe, don't let it cave in	\N	\N	t	2025-09-30 15:06:42.178	2025-09-30 15:06:42.178
cmg6oxl4m000oanebqnl24tbd	Glute kickbacks	Isolation glute exercise	Glutes	Cable	Beginner	Strength	Attach cable to ankle, kick back against resistance focusing on glute contraction.	Keep core engaged, don't swing the leg	\N	\N	t	2025-09-30 15:06:42.358	2025-09-30 15:06:42.358
cmg6oxl9e000panebd69ar91r	Abductor machine	Hip abductor isolation	Hip Abductors	Machine	Beginner	Strength	Sit in abductor machine, push legs out against resistance, return to start.	Control the movement, don't let legs snap back	\N	\N	t	2025-09-30 15:06:42.53	2025-09-30 15:06:42.53
cmg6oxlez000qanebmmqrfx7a	Scapula retractions	Shoulder blade activation	Back	Cable	Beginner	Activation	On cable machine, pull shoulder blades back and together without bending elbows.	Focus on squeezing shoulder blades together	\N	\N	t	2025-09-30 15:06:42.732	2025-09-30 15:06:42.732
cmg6oxlle000ranebjndcuz34	Resistance band face pulls	Posterior deltoid and upper trap exercise	Back	Resistance Band	Beginner	Strength	Hold band at face level, pull towards face separating hands at end.	Keep elbows high, focus on external rotation	\N	\N	t	2025-09-30 15:06:42.922	2025-09-30 15:06:42.922
cmg6oxlqn000sanebs9l2qn6z	Lat pulldown	Latissimus dorsi exercise	Back	Cable	Intermediate	Strength	Sit at lat pulldown machine, pull bar down to chest, control return.	Keep chest up, pull with lats not arms	\N	\N	t	2025-09-30 15:06:43.152	2025-09-30 15:06:43.152
cmg6oxlvo000tanebm3rv4rvy	Seated row	Mid-back strengthening	Back	Cable	Intermediate	Strength	Sit at rowing machine, pull handle to torso, squeeze shoulder blades together.	Keep chest up, pull elbows back	\N	\N	t	2025-09-30 15:06:43.332	2025-09-30 15:06:43.332
cmg6oxm0v000uanebyrbh30v6	Dumbbell single-arm row	Unilateral back exercise	Back	Dumbbell	Intermediate	Strength	Bend over bench, row dumbbell to hip, control descent.	Keep core engaged, don't rotate torso	\N	\N	t	2025-09-30 15:06:43.519	2025-09-30 15:06:43.519
cmg6oxm5o000vaneb8obgmfvy	Triceps pushdowns	Triceps isolation exercise	Triceps	Cable	Beginner	Strength	Stand at cable machine, push bar down extending arms, control return.	Keep elbows at sides, don't swing the weight	\N	\N	t	2025-09-30 15:06:43.692	2025-09-30 15:06:43.692
cmg6oxmb0000wanebjr0ezlvq	Overhead triceps extension	Triceps isolation exercise	Triceps	Dumbbell	Intermediate	Strength	Hold dumbbell overhead, lower behind head, extend back up.	Keep elbows pointing forward, don't flare them out	\N	\N	t	2025-09-30 15:06:43.885	2025-09-30 15:06:43.885
cmg6oxmki000xaneb2yd3ns2s	Dips	Bodyweight triceps exercise	Triceps	Bodyweight	Intermediate	Strength	Support body on bench, lower down by bending elbows, push back up.	Keep chest up, don't go too low if it hurts shoulders	\N	\N	t	2025-09-30 15:06:44.226	2025-09-30 15:06:44.226
cmg6oxmq4000yanebdn56f5y8	Chest press machine	Machine chest exercise	Chest	Machine	Beginner	Strength	Sit in chest press machine, push handles forward, control return.	Keep shoulder blades back, don't let shoulders roll forward	\N	\N	t	2025-09-30 15:06:44.428	2025-09-30 15:06:44.428
cmg6oxmvq000zaneb3k4tu479	Pec deck	Chest fly machine	Chest	Machine	Beginner	Strength	Sit in pec deck machine, bring arms together in front of chest, control return.	Keep slight bend in elbows, feel stretch across chest	\N	\N	t	2025-09-30 15:06:44.631	2025-09-30 15:06:44.631
cmg6oxn0m0010anebgfhqha5t	Band pull-aparts	Posterior deltoid exercise	Shoulders	Resistance Band	Beginner	Activation	Hold band in front, pull apart bringing hands to sides.	Keep arms straight, focus on rear delts	\N	\N	t	2025-09-30 15:06:44.806	2025-09-30 15:06:44.806
cmg6oxn630011aneb0ldmrjms	Front raises	Anterior deltoid exercise	Shoulders	Dumbbell	Beginner	Strength	Hold dumbbells, raise arms to front to shoulder height, control descent.	Keep slight bend in elbows, don't swing the weight	\N	\N	t	2025-09-30 15:06:45.003	2025-09-30 15:06:45.003
cmg6oxnaw0012anebdmxi8w6q	Shoulder press machine	Machine shoulder exercise	Shoulders	Machine	Beginner	Strength	Sit in shoulder press machine, press handles overhead, control return.	Keep core engaged, don't arch back excessively	\N	\N	t	2025-09-30 15:06:45.176	2025-09-30 15:06:45.176
cmg6oxnfx0013aneb2aqa81je	Lateral raises	Medial deltoid exercise	Shoulders	Dumbbell	Beginner	Strength	Hold dumbbells, raise arms to sides to shoulder height, control descent.	Keep slight bend in elbows, lead with pinkies	\N	\N	t	2025-09-30 15:06:45.357	2025-09-30 15:06:45.357
cmg6oxnkv0014anebsvb52sjz	Arnold press	Rotational shoulder exercise	Shoulders	Dumbbell	Intermediate	Strength	Start with dumbbells at shoulders, rotate and press overhead, reverse the motion.	Control the rotation, don't rush the movement	\N	\N	t	2025-09-30 15:06:45.535	2025-09-30 15:06:45.535
cmg6oxnpt0015anebzhyj8ggm	Biceps curls	Biceps isolation exercise	Biceps	Dumbbell	Beginner	Strength	Hold dumbbells, curl up to shoulders, control descent.	Keep elbows at sides, don't swing the weight	\N	\N	t	2025-09-30 15:06:45.714	2025-09-30 15:06:45.714
cmg6oxnuu0016aneb3v4e898g	Hammer curls	Biceps and forearm exercise	Biceps	Dumbbell	Beginner	Strength	Hold dumbbells with neutral grip, curl up to shoulders, control descent.	Keep wrists straight, focus on biceps contraction	\N	\N	t	2025-09-30 15:06:45.895	2025-09-30 15:06:45.895
cmg6oxnzz0017anebn2fh43qd	Bicycle crunches	Rotational core exercise	Abs	Bodyweight	Beginner	Strength	Lie on back, bring knees to chest, alternate touching elbow to opposite knee.	Keep lower back pressed to ground, don't pull on neck	\N	\N	t	2025-09-30 15:06:46.079	2025-09-30 15:06:46.079
cmg6oxo5i0018anebnlnucybv	Leg raises	Lower ab exercise	Abs	Bodyweight	Intermediate	Strength	Lie on back, raise legs up to 90 degrees, lower with control.	Keep lower back pressed to ground, don't swing legs	\N	\N	t	2025-09-30 15:06:46.278	2025-09-30 15:06:46.278
cmg6oxoad0019aneb1ttwbl43	Russian twists	Rotational core exercise	Abs	Bodyweight	Intermediate	Strength	Sit with knees bent, lean back slightly, rotate torso side to side.	Keep chest up, don't round shoulders	\N	\N	t	2025-09-30 15:06:46.453	2025-09-30 15:06:46.453
cmg6oxok4001aanebhpcj0q5k	Heel touches	Oblique exercise	Abs	Bodyweight	Beginner	Strength	Lie on back, knees bent, reach to touch heels alternately.	Keep shoulders off ground, don't pull on neck	\N	\N	t	2025-09-30 15:06:46.804	2025-09-30 15:06:46.804
cmg6oxope001banebw327eb27	Reverse crunches	Lower ab exercise	Abs	Bodyweight	Intermediate	Strength	Lie on back, bring knees to chest, lift hips off ground.	Keep lower back pressed to ground, control the movement	\N	\N	t	2025-09-30 15:06:46.995	2025-09-30 15:06:46.995
cmg6oxoud001canebdh3ti1sf	Side plank	Lateral core exercise	Abs	Bodyweight	Intermediate	Strength	Lie on side, support body on forearm, hold straight line.	Keep hips up, don't let them sag	\N	\N	t	2025-09-30 15:06:47.174	2025-09-30 15:06:47.174
cmg6oxp2r001daneb1r62vm8l	Mountain climbers	Dynamic core exercise	Abs	Bodyweight	Intermediate	Strength	Start in plank, alternate bringing knees to chest quickly.	Keep core engaged, maintain plank position	\N	\N	t	2025-09-30 15:06:47.476	2025-09-30 15:06:47.476
cmg6oxp7k001eanebtr4dq6jf	Jump squats	Explosive lower body exercise	Legs	Bodyweight	Intermediate	Plyometric	Perform squat, then explode up into jump, land softly.	Land softly, keep knees tracking over toes	\N	\N	t	2025-09-30 15:06:47.649	2025-09-30 15:06:47.649
cmg6oxpfu001fanebxp9wj79p	Jump rope	Cardio exercise	Full Body	Jump Rope	Intermediate	Cardio	Jump over rope with both feet, maintain rhythm.	Stay light on feet, keep core engaged	\N	\N	t	2025-09-30 15:06:47.946	2025-09-30 15:06:47.946
cmg6oxpkx001ganebhgy36eqv	Sprint in place	High intensity cardio	Full Body	Bodyweight	Advanced	Cardio	Run in place at maximum intensity, pump arms.	Maintain high intensity, keep core engaged	\N	\N	t	2025-09-30 15:06:48.129	2025-09-30 15:06:48.129
cmg9vwxjk00109ifnr0ftsuq7	Leg swings	Dynamic leg mobility exercise	Legs	Bodyweight	Beginner	Warm-up	Stand next to wall, swing leg forward and backward in controlled motion	Keep core engaged, don't force the range of motion	\N	\N	t	2025-10-02 20:45:27.568	2025-10-02 20:45:27.568
cmg9vwxn600119ifnp2m1ot2p	Banded lateral walks	Lateral glute activation exercise	Glutes	Resistance Band	Beginner	Activation	Place band around legs above knees, take lateral steps while maintaining tension	Keep tension on band, don't let knees cave in	\N	\N	t	2025-10-02 20:45:27.762	2025-10-02 20:45:27.762
cmg9w1e3x00af9ifnmknv2ka3	Ankle mobility	Ankle range of motion exercise	Ankles	Bodyweight	Beginner	Warm-up	Move ankle in circles and up/down motions	Move slowly, don't force range of motion	\N	\N	t	2025-10-02 20:48:55.726	2025-10-02 20:48:55.726
cmg9vwxq100129ifnzcrqve6v	Clamshells with band	Hip and glute activation with resistance band	Glutes	Resistance Band	Beginner	Activation	Lie on side with band around knees, lift top knee up against resistance	Don't let hips roll back, focus on glute activation	\N	\N	t	2025-10-02 20:45:27.865	2025-10-02 20:45:27.865
cmg9vwxt600139ifnozfsdlfv	Standing calf raises	Calf muscle strengthening exercise	Calves	Bodyweight	Beginner	Strength	Stand on edge of step, raise up on toes, lower down below step level	Control the movement, feel stretch in calves	\N	\N	t	2025-10-02 20:45:27.979	2025-10-02 20:45:27.979
cmg9vwxw400149ifnlmesicu6	Shoulder shrugs	Upper trap and shoulder mobility exercise	Shoulders	Bodyweight	Beginner	Warm-up	Lift shoulders up towards ears, roll them back and down	Move slowly and controlled, don't force range of motion	\N	\N	t	2025-10-02 20:45:28.085	2025-10-02 20:45:28.085
cmg9vwxz400159ifnop2ykr8f	Light dumbbell rows	Light back activation exercise	Back	Dumbbell	Beginner	Warm-up	Hold light dumbbells, row to sides focusing on shoulder blade movement	Keep movements controlled, focus on activation	\N	\N	t	2025-10-02 20:45:28.193	2025-10-02 20:45:28.193
cmg9vwy2500169ifn7cwmizk5	Dumbbell bicep curl	Biceps isolation exercise with dumbbells	Biceps	Dumbbell	Beginner	Strength	Hold dumbbells, curl up to shoulders, control descent	Keep elbows at sides, don't swing the weight	\N	\N	t	2025-10-02 20:45:28.301	2025-10-02 20:45:28.301
cmg9vwy5100179ifnol68x1by	Cable tricep pushdown	Triceps isolation exercise with cable	Triceps	Cable	Beginner	Strength	Stand at cable machine, push bar down extending arms, control return	Keep elbows at sides, don't swing the weight	\N	\N	t	2025-10-02 20:45:28.405	2025-10-02 20:45:28.405
cmg9vz9c500529ifno8ow0e3g	Overhead dumbbell tricep extension	Triceps isolation exercise with dumbbell overhead	Triceps	Dumbbell	Intermediate	Strength	Hold dumbbell overhead with both hands, lower behind head, extend back up	Keep elbows pointing forward, don't flare them out	\N	\N	t	2025-10-02 20:47:16.169	2025-10-02 20:47:16.169
cmg9vz9fk00539ifnrc0h0ay8	Hanging knee raises	Lower ab exercise hanging from bar	Abs	Pull-up Bar	Intermediate	Strength	Hang from bar, bring knees up to chest, lower with control	Keep core engaged, don't swing the legs	\N	\N	t	2025-10-02 20:47:16.352	2025-10-02 20:47:16.352
cmg9vz9in00549ifnanek6lme	Glute bridge march	Dynamic glute bridge with alternating leg lifts	Glutes	Bodyweight	Intermediate	Strength	Start in glute bridge position, lift one leg up, lower and alternate	Keep hips up throughout, don't let them drop	\N	\N	t	2025-10-02 20:47:16.463	2025-10-02 20:47:16.463
cmg9vz9mn00559ifneyvat67g	Light dumbbell chest press	Light chest activation exercise	Chest	Dumbbell	Beginner	Warm-up	Hold light dumbbells, press up and out, control descent	Keep movements controlled, focus on activation	\N	\N	t	2025-10-02 20:47:16.607	2025-10-02 20:47:16.607
cmg9vz9pe00569ifnzvxkgc8r	Dumbbell chest press	Chest strengthening exercise with dumbbells	Chest	Dumbbell	Intermediate	Strength	Lie on bench, press dumbbells up from chest, control descent	Keep shoulder blades back, don't let shoulders roll forward	\N	\N	t	2025-10-02 20:47:16.706	2025-10-02 20:47:16.706
cmg9w1cf8009x9ifnozlz18uk	Hip circles	Hip mobility warm-up exercise	Hips	Bodyweight	Beginner	Warm-up	Stand on one leg, make circles with the other leg, switch sides	Keep movements controlled, don't force range of motion	\N	\N	t	2025-10-02 20:48:53.54	2025-10-02 20:48:53.54
cmg9w1ckb009y9ifnvc9hfv7n	Side lunges	Lateral lunge movement	Legs	Bodyweight	Beginner	Warm-up	Step to the side, lower into lunge position, return to center	Keep chest up, don't let knee cave in	\N	\N	t	2025-10-02 20:48:53.723	2025-10-02 20:48:53.723
cmg9w1cq9009z9ifndf7sosrs	Donkey kicks	Glute activation exercise	Glutes	Bodyweight	Beginner	Activation	Start on hands and knees, kick one leg back and up, return	Keep core engaged, don't arch back	\N	\N	t	2025-10-02 20:48:53.938	2025-10-02 20:48:53.938
cmg9w1ct400a09ifntgdytjkq	Banded side steps	Lateral glute activation with band	Glutes	Resistance Band	Beginner	Activation	Place band around legs, take lateral steps while maintaining tension	Keep tension on band, don't let knees cave in	\N	\N	t	2025-10-02 20:48:54.04	2025-10-02 20:48:54.04
cmg9w1cw800a19ifnu8jc7u4f	Dumbbell lunges	Lunge exercise with dumbbells	Legs	Dumbbell	Intermediate	Strength	Hold dumbbells, step forward into lunge, return to start	Keep torso upright, don't let front knee go past toes	\N	\N	t	2025-10-02 20:48:54.152	2025-10-02 20:48:54.152
cmg9w1czn00a29ifn8tscxu7j	Step-ups with dumbbells	Step-up exercise with dumbbells	Legs	Dumbbell	Intermediate	Strength	Hold dumbbells, step up onto platform, step down	Control the movement, don't use momentum	\N	\N	t	2025-10-02 20:48:54.276	2025-10-02 20:48:54.276
cmg9w1d2q00a39ifnzyeixf3o	Shoulder rotations	Shoulder mobility exercise	Shoulders	Bodyweight	Beginner	Warm-up	Rotate shoulders forward and backward in circular motion	Move slowly and controlled	\N	\N	t	2025-10-02 20:48:54.386	2025-10-02 20:48:54.386
cmg9w1d5q00a49ifnans426vk	Scapular retractions	Shoulder blade activation exercise	Back	Bodyweight	Beginner	Warm-up	Squeeze shoulder blades together and back	Focus on bringing shoulder blades together	\N	\N	t	2025-10-02 20:48:54.495	2025-10-02 20:48:54.495
cmg9w1d8x00a59ifn7gi9qo7h	Torso twists	Spinal rotation warm-up	Core	Bodyweight	Beginner	Warm-up	Stand with feet hip-width apart, rotate torso side to side	Keep hips facing forward, rotate from the spine	\N	\N	t	2025-10-02 20:48:54.609	2025-10-02 20:48:54.609
cmg9w1dc900a69ifn3nlsvb8w	Light lat pull-down	Light back activation exercise	Back	Cable	Beginner	Activation	Light weight lat pulldown focusing on activation	Keep movements controlled, focus on activation	\N	\N	t	2025-10-02 20:48:54.73	2025-10-02 20:48:54.73
cmg9w1df700a79ifnkx8y3uon	Triceps kickbacks	Triceps isolation exercise	Triceps	Dumbbell	Beginner	Activation	Bend over, extend arms back, squeeze triceps	Keep elbows at sides, don't swing the weight	\N	\N	t	2025-10-02 20:48:54.835	2025-10-02 20:48:54.835
cmg9w1di800a89ifnu83ecc5b	Triceps rope pushdown	Triceps isolation with rope attachment	Triceps	Cable	Beginner	Strength	Stand at cable machine with rope, push down extending arms	Keep elbows at sides, don't swing the weight	\N	\N	t	2025-10-02 20:48:54.944	2025-10-02 20:48:54.944
cmg9w1dle00a99ifnkbyoends	Clamshell with band	Hip and glute activation with resistance band	Glutes	Resistance Band	Beginner	Activation	Lie on side with band around knees, lift top knee up	Don't let hips roll back, focus on glute activation	\N	\N	t	2025-10-02 20:48:55.058	2025-10-02 20:48:55.058
cmg9w1doo00aa9ifnzrftusfj	Hip abduction with band	Hip abductor activation with band	Hip Abductors	Resistance Band	Beginner	Activation	Place band around legs, abduct legs against resistance	Keep tension on band, control the movement	\N	\N	t	2025-10-02 20:48:55.176	2025-10-02 20:48:55.176
cmg9w1dru00ab9ifnahyeyule	Single-leg glute bridge	Unilateral glute bridge exercise	Glutes	Bodyweight	Intermediate	Activation	Lie on back, lift one leg, bridge up with other leg	Keep core engaged, don't let hips drop	\N	\N	t	2025-10-02 20:48:55.291	2025-10-02 20:48:55.291
cmg9w1duq00ac9ifne6dqfjfn	Chest openers	Chest and shoulder mobility exercise	Chest	Bodyweight	Beginner	Warm-up	Extend arms to sides, bring them forward and back	Feel stretch across chest	\N	\N	t	2025-10-02 20:48:55.394	2025-10-02 20:48:55.394
cmg9w1dxm00ad9ifnob8cgj2y	Light dumbbell curls	Light bicep activation exercise	Biceps	Dumbbell	Beginner	Activation	Hold light dumbbells, curl up to shoulders	Keep movements controlled, focus on activation	\N	\N	t	2025-10-02 20:48:55.498	2025-10-02 20:48:55.498
cmg9w1e0z00ae9ifnz182lpvq	Weighted crunch	Abdominal exercise with weight	Abs	Dumbbell	Intermediate	Strength	Hold weight to chest, perform crunches	Keep lower back pressed to ground	\N	\N	t	2025-10-02 20:48:55.619	2025-10-02 20:48:55.619
cmg9w39ch00e69ifns1p9g065	Treadmill	Cardio exercise on treadmill	Full Body	Treadmill	Beginner	Cardio	Walk or run on treadmill at light pace	Maintain steady pace, focus on breathing	\N	\N	t	2025-10-02 20:50:22.801	2025-10-02 20:50:22.801
cmg9w39ft00e79ifns7lqnjlv	Shoulder circles	Shoulder mobility warm-up exercise	Shoulders	Bodyweight	Beginner	Warm-up	Rotate shoulders forward and backward in circular motion	Move slowly and controlled	\N	\N	t	2025-10-02 20:50:22.985	2025-10-02 20:50:22.985
cmg9w39j000e89ifnsfrng233	Trunk rotations	Spinal rotation warm-up exercise	Core	Bodyweight	Beginner	Warm-up	Stand with feet hip-width apart, rotate torso side to side	Keep hips facing forward, rotate from the spine	\N	\N	t	2025-10-02 20:50:23.1	2025-10-02 20:50:23.1
cmg9w39m000e99ifnmbas8z3r	Bent-over row	Back strengthening exercise	Back	Dumbbell	Intermediate	Strength	Bend over, row dumbbells to sides, squeeze shoulder blades together	Keep core engaged, don't round back	\N	\N	t	2025-10-02 20:50:23.209	2025-10-02 20:50:23.209
cmg9w39p100ea9ifn6ms6m3e7	Triceps extensions	Triceps isolation exercise	Triceps	Dumbbell	Beginner	Strength	Hold dumbbell overhead, lower behind head, extend back up	Keep elbows pointing forward, don't flare them out	\N	\N	t	2025-10-02 20:50:23.318	2025-10-02 20:50:23.318
cmg9w39sg00eb9ifnucmuywuo	Stretch legs	Leg stretching exercise	Legs	Bodyweight	Beginner	Stretching	Stretch hamstrings, quads, and calves	Hold each stretch for 30-60 seconds	\N	\N	t	2025-10-02 20:50:23.441	2025-10-02 20:50:23.441
cmg9w39vc00ec9ifnmq7led3m	Stretch back	Back stretching exercise	Back	Bodyweight	Beginner	Stretching	Perform cat-cow or seated twist stretches	Move slowly and breathe deeply	\N	\N	t	2025-10-02 20:50:23.544	2025-10-02 20:50:23.544
cmg9w39ya00ed9ifn1bads3s2	Stretch chest & shoulders	Chest and shoulder stretching exercise	Chest	Bodyweight	Beginner	Stretching	Perform chest opener and shoulder stretches	Feel stretch across chest and shoulders	\N	\N	t	2025-10-02 20:50:23.651	2025-10-02 20:50:23.651
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.goals (id, title, description, target, current, deadline, completed, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ingredients (id, name, "nameRo", per, "perRo", calories, protein, carbs, fat, fiber, sugar, category, aliases, "isActive", "createdAt", "updatedAt") FROM stdin;
cmgbfa3r901am8igvkjnb2enr	Elk	\N	100g	\N	111	22	0	1.4	0	0	proteins	{Pure:Elk,TYPE:gram}	t	2025-10-03 22:35:21.093	2025-10-03 22:43:44.731
cmgbfa3w401an8igvaz6d5g3r	Wild Boar	\N	100g	\N	160	28	0	4.3	0	0	proteins	{"Pure:Wild Boar",TYPE:gram}	t	2025-10-03 22:35:21.268	2025-10-03 22:43:44.825
cmgbfeu1i01as8igvw2xrkqak	1 Peach	Piersică	1	\N	59	1.4	14	0.4	2.3	13	fruits	{PerPiece:Peach,TYPE:piece}	t	2025-10-03 22:39:01.783	2025-10-09 08:35:54.654
cmgbfeu6z01at8igvu4mip33i	1 Kiwi	Kiwi	1	\N	55	1	13	0.5	2.7	8	fruits	{PerPiece:Kiwi,TYPE:piece}	t	2025-10-03 22:39:01.979	2025-10-09 08:35:54.768
cmgbfeud701au8igv2965x0ye	1 Mango	Mango	1	\N	120	1.6	30	0.8	3.2	27	fruits	{PerPiece:Mango,TYPE:piece}	t	2025-10-03 22:39:02.204	2025-10-09 08:35:54.844
cmgbfeui801av8igvph1eosu4	1 Avocado	Avocado	1	\N	320	4	17	29	13	1.4	fruits	{PerPiece:Avocado,TYPE:piece}	t	2025-10-03 22:39:02.385	2025-10-09 08:35:54.93
cmgbfeupa01aw8igvt5g80r0m	1 Lemon	Lămâie	1	\N	17	0.6	5.4	0.2	1.6	1.5	fruits	{PerPiece:Lemon,TYPE:piece}	t	2025-10-03 22:39:02.639	2025-10-09 08:35:55.011
cmgbfeuui01ax8igvuq505n54	1 Lime	Lime	1	\N	20	0.5	7	0.1	1.9	1.1	fruits	{PerPiece:Lime,TYPE:piece}	t	2025-10-03 22:39:02.827	2025-10-09 08:35:55.089
cmgbfev0c01ay8igvacojuah5	1 Carrot	Morcov	1	\N	25	0.5	6	0.1	1.7	2.9	vegetables	{PerPiece:Carrot,TYPE:piece}	t	2025-10-03 22:39:03.036	2025-10-09 08:35:55.171
cmgbfevbn01b08igvwq383fhp	1 Cucumber	Castravete	1	\N	32	1.4	8	0.2	1	3.4	vegetables	{PerPiece:Cucumber,TYPE:piece}	t	2025-10-03 22:39:03.444	2025-10-09 08:35:55.256
cmgbfevil01b18igv6jo0rzqg	1 Bell Pepper	Ardei Gras	1	\N	24	1.1	5.5	0.2	1.8	2.9	vegetables	{"PerPiece:Bell Pepper",TYPE:piece}	t	2025-10-03 22:39:03.694	2025-10-09 08:35:55.335
cmgbfevnl01b28igvwoc5cuh1	1 Onion	Ceapă	1	\N	44	1.2	10	0.1	1.9	4.6	vegetables	{PerPiece:Onion,TYPE:piece}	t	2025-10-03 22:39:03.873	2025-10-09 08:35:55.415
cmgbfevth01b38igvwwmex1xp	1 Sweet Potato	Cartof Dulce	1	\N	112	2.1	26	0.1	3.9	5.5	vegetables	{"PerPiece:Sweet Potato",TYPE:piece}	t	2025-10-03 22:39:04.086	2025-10-09 08:35:55.491
cmgbfevz801b48igvg1zcmpgz	1 Potato	Cartof	1	\N	133	3.5	30	0.2	3.8	1.4	vegetables	{PerPiece:Potato,TYPE:piece}	t	2025-10-03 22:39:04.293	2025-10-09 08:35:55.587
cmgbfew4w01b58igv6vi31x7s	1 Zucchini	Dovlecel	1	\N	33	2.4	6	0.6	2	4.9	vegetables	{PerPiece:Zucchini,TYPE:piece}	t	2025-10-03 22:39:04.496	2025-10-09 08:35:55.665
cmgbfewbi01b68igvj3ui4689	1 Eggplant	Vânătă	1	\N	21	0.8	5	0.2	2.5	2.9	vegetables	{PerPiece:Eggplant,TYPE:piece}	t	2025-10-03 22:39:04.735	2025-10-09 08:35:55.745
cmgbfewgp01b78igv3zsoydrf	1 Egg	Ou	1	\N	78	6.5	0.6	5.5	0	0.6	proteins	{PerPiece:Eggs,TYPE:piece}	t	2025-10-03 22:39:04.921	2025-10-09 08:35:55.829
cmgbfewmg01b88igvbx8uxvw9	1 Chicken Breast	Piept de Pui	1	\N	330	62	0	7.2	0	0	proteins	{"PerPiece:Chicken Breast",TYPE:piece}	t	2025-10-03 22:39:05.129	2025-10-09 08:35:55.903
cmgbfewv901b98igv8rvg2s3r	1 Chicken Thigh	Pulpă de Pui	1	\N	209	26	0	10	0	0	proteins	{"PerPiece:Chicken Thigh",TYPE:piece}	t	2025-10-03 22:39:05.445	2025-10-09 08:35:55.985
cmgbfex0201ba8igvx89i0edu	1 Chicken Wing	Aripioare de Pui	1	\N	183	16	0	13	0	0	proteins	{"PerPiece:Chicken Wing",TYPE:piece}	t	2025-10-03 22:39:05.618	2025-10-09 08:35:56.066
cmgbfexci01bc8igvvdm2amhq	1 Cod Fillet	File de Cod	1	\N	123	27	0	1.1	0	0	proteins	{PerPiece:Cod,TYPE:piece}	t	2025-10-03 22:39:06.067	2025-10-09 08:35:56.165
cmgbfexj101bd8igve0tcv19m	1 Pork Chop	Cotlet de Porc	1	\N	484	55	0	28	0	0	proteins	{"PerPiece:Pork Chop",TYPE:piece}	t	2025-10-03 22:39:06.302	2025-10-09 08:35:56.241
cmgbfexoi01be8igvuow7a57d	1 Beef Steak	Friptură de Vită	1	\N	500	52	0	30	0	0	proteins	{"PerPiece:Beef Steak",TYPE:piece}	t	2025-10-03 22:39:06.498	2025-10-09 08:35:56.343
cmgbfey5n01bg8igvsoqp4dzj	1 Slice Cheese	Brânză	1	\N	113	7	0.4	9	0	0.1	dairy	{"PerPiece:Cheddar Cheese",TYPE:slice}	t	2025-10-03 22:39:07.116	2025-10-09 08:35:56.425
cmgbfeycf01bh8igviav7bro0	1 Slice Mozzarella	Mozzarella	1	\N	78	6	0.6	6	0	0.3	dairy	{PerPiece:Mozzarella,TYPE:slice}	t	2025-10-03 22:39:07.359	2025-10-09 08:35:56.502
cmgbfeyhr01bi8igvii58lpcj	1 Cup Milk	Lapte	1	\N	103	8	12	2.4	0	12	dairy	{PerPiece:Milk,TYPE:cup}	t	2025-10-03 22:39:07.552	2025-10-09 08:35:56.589
cmgbfeytn01bk8igvam9vdygu	1 Slice White Bread	Pâine Albă	1	\N	66	2.3	12	0.8	0.7	1.4	carbohydrates	{"PerPiece:White Bread",TYPE:slice}	t	2025-10-03 22:39:07.98	2025-10-09 08:35:56.747
cmgbfeyyn01bl8igvuzmjc8ut	1 Slice Whole Wheat Bread	Pâine Integrală	1	\N	62	3.3	10	1.1	1.5	1.1	carbohydrates	{"PerPiece:Whole Wheat Bread",TYPE:slice}	t	2025-10-03 22:39:08.159	2025-10-09 08:35:56.831
cmgbfez5v01bm8igvtk5jfxxz	1 Cup Cooked Rice	Orez Fiert	1	\N	205	4.3	44	0.5	0.6	0.2	carbohydrates	{"PerPiece:White Rice",TYPE:cup}	t	2025-10-03 22:39:08.42	2025-10-09 08:35:56.911
cmgbfezap01bn8igvsqgm657p	1 Cup Cooked Brown Rice	Orez Brun Fiert	1	\N	216	5	45	1.8	3.5	0.8	carbohydrates	{"PerPiece:Brown Rice",TYPE:cup}	t	2025-10-03 22:39:08.593	2025-10-09 08:35:57.004
cmgbfezfe01bo8igvj8nz1iis	1 Cup Cooked Pasta	Paste Fierte	1	\N	183	7	35	1.5	2.5	0.8	carbohydrates	{PerPiece:Pasta,TYPE:cup}	t	2025-10-03 22:39:08.762	2025-10-09 08:35:57.088
cmgbfezmh01bp8igvus8kh0r8	1 Cup Oats	Ovăz	1	\N	315	14	54	5.6	8.6	0.4	carbohydrates	{PerPiece:Oats,TYPE:cup}	t	2025-10-03 22:39:09.017	2025-10-09 08:35:57.167
cmgbfezrt01bq8igv6ouaec7u	1 Cup Quinoa	Quinoa	1	\N	222	8	41	3.5	5.2	1.7	carbohydrates	{PerPiece:Quinoa,TYPE:cup}	t	2025-10-03 22:39:09.21	2025-10-09 08:35:57.254
cmgbfetk801ap8igvx0ada7pw	1 Banana	Banană	1	\N	105	1.3	27	0.4	3.1	14	fruits	{PerPiece:Banana,TYPE:piece}	t	2025-10-03 22:39:01.16	2025-10-09 08:35:57.336
cmgbfetp401aq8igvv96kj3s4	1 Orange	Portocală	1	\N	66	1.3	16.5	0.1	3.4	13	fruits	{PerPiece:Orange,TYPE:piece}	t	2025-10-03 22:39:01.336	2025-10-09 08:35:57.423
cmgbfetwb01ar8igv6jokxgr2	1 Pear	Pară	1	\N	95	0.7	25	0.2	5.1	16	fruits	{PerPiece:Pear,TYPE:piece}	t	2025-10-03 22:39:01.596	2025-10-09 08:35:54.572
cmgbfet9q01ao8igv9u7u3r3s	1 Apple	Măr	1	\N	95	0.5	25	0.4	4.4	19	fruits	{PerPiece:Apple,TYPE:piece}	t	2025-10-03 22:39:00.783	2025-10-09 08:35:57.504
cmgbfey0i01bf8igvrzl4ex6k	1 Turkey Breast	Piept de Curcan	1	\N	203	45	0	1.5	0	0	proteins	{"PerPiece:Turkey Breast",TYPE:piece}	t	2025-10-03 22:39:06.931	2025-10-09 08:35:57.581
cmgbff03w01bs8igvihvb8a56	1 Handful Walnuts	Nuci	1	\N	183	4.3	3.8	18	1.9	0.7	nuts-seeds	{PerPiece:Walnuts,TYPE:handful}	t	2025-10-03 22:39:09.645	2025-10-09 08:35:57.669
cmgbff08i01bt8igv9ajrg6i9	1 Handful Cashews	Caju	1	\N	155	5.1	8.5	12	0.9	1.7	nuts-seeds	{PerPiece:Cashews,TYPE:handful}	t	2025-10-03 22:39:09.81	2025-10-09 08:35:57.769
cmgbff0fj01bu8igvjnig0pdr	1 Tablespoon Peanut Butter	Unt de Arahide	1	\N	94	4	3.2	8	1.4	1.5	healthy-fats	{"PerPiece:Peanut Butter",TYPE:tablespoon}	t	2025-10-03 22:39:10.064	2025-10-09 08:35:57.848
cmgbff0kr01bv8igv4c0ryomj	1 Tablespoon Olive Oil	Ulei de Măsline	1	\N	124	0	0	14	0	0	healthy-fats	{"PerPiece:Olive Oil",TYPE:tablespoon}	t	2025-10-03 22:39:10.252	2025-10-09 08:35:57.95
cmgbfa17901a78igvkr0xhp35	Carp	\N	100g	\N	127	18	0	5.6	0	0	proteins	{Pure:Carp,TYPE:gram}	t	2025-10-03 22:35:17.781	2025-10-03 22:44:00.849
cmgbfa2yo01ah8igvr8fiht3g	Crayfish	\N	100g	\N	82	16	0	1.2	0	0	proteins	{Pure:Crayfish,TYPE:gram}	t	2025-10-03 22:35:20.064	2025-10-03 22:44:01.763
cmgbf5ghc015w8igv3bln5ooa	Banana	Banană	100g	\N	89	1.1	22.8	0.3	2.6	12.2	fruits	{Pure:Banana,TYPE:gram}	t	2025-10-03 22:31:44.305	2025-10-09 08:03:09.316
cmgbf5i63016f8igv6wor3yvl	Carrot	Morcov	100g	\N	41	0.9	9.6	0.2	2.8	4.7	vegetables	{Pure:Carrot,TYPE:gram}	t	2025-10-03 22:31:46.491	2025-10-09 08:03:09.411
cmgbf5j1s016q8igvpt1mmlhp	Eggplant	Vânătă	100g	\N	25	1	6	0.2	3	3.5	vegetables	{Pure:Eggplant,TYPE:gram}	t	2025-10-03 22:31:47.633	2025-10-09 08:03:09.497
cmgbf5ktt017a8igvd05un12c	Cottage Cheese	Brânză de Vaci	100g	\N	98	11.1	3.4	4.3	0	2.7	dairy	{"Pure:Cottage Cheese",TYPE:gram}	t	2025-10-03 22:31:49.937	2025-10-09 08:03:09.59
cmgbf5lqo017l8igvlv95h82q	Whole Wheat Pasta	Paste Integrale	100g	\N	124	5	25	1.1	3.2	0.6	carbohydrates	{"Pure:Whole Wheat Pasta",TYPE:gram}	t	2025-10-03 22:31:51.12	2025-10-09 08:03:09.68
cmgbf5ni201878igvcqw98b27	Olive Oil	Ulei de Măsline	100g	\N	884	0	0	100	0	0	healthy-fats	{"Pure:Olive Oil",TYPE:gram}	t	2025-10-03 22:31:53.402	2025-10-09 08:03:09.765
cmgbfev6b01az8igviifdjem6	1 Tomato	Roșie	1	\N	22	1.1	4.8	0.2	1.5	3.2	vegetables	{PerPiece:Tomato,TYPE:piece}	t	2025-10-03 22:39:03.252	2025-10-09 08:35:58.03
cmgbfex6w01bb8igv0jrx6qqy	1 Salmon Fillet	File de Somon	1	\N	312	38	0	19	0	0	proteins	{PerPiece:Salmon,TYPE:piece}	t	2025-10-03 22:39:05.865	2025-10-09 08:35:58.105
cmgbfezyk01br8igvg8avgklk	1 Handful Almonds	Migdale	1	\N	162	6	6	14	3.5	1.2	nuts-seeds	{PerPiece:Almonds,TYPE:handful}	t	2025-10-03 22:39:09.452	2025-10-09 08:35:58.18
cmgbf5jxc01718igv3b7s681b	Lamb	Miel	100g	\N	294	25	0	21	0	0	proteins	{Pure:Lamb,TYPE:gram}	t	2025-10-03 22:31:48.769	2025-10-09 08:43:24.256
cmgbf9tr8018x8igvqq3ykm8o	Sirloin Steak	Mușchi de Vită	100g	\N	250	26	0	15	0	0	proteins	{"Pure:Sirloin Steak",TYPE:gram}	t	2025-10-03 22:35:08.133	2025-10-09 08:43:24.4
cmgbf9vom01988igvwekh0nwv	Pork Ribs	Coaste de Porc	100g	\N	242	27.3	0	13.9	0	0	proteins	{"Pure:Pork Ribs",TYPE:gram}	t	2025-10-03 22:35:10.631	2025-10-09 08:43:24.532
cmgbf9wjt019d8igvkt39pg67	Chicken Drumstick	Pulpă de Pui	100g	\N	172	28	0	5	0	0	proteins	{"Pure:Chicken Drumstick",TYPE:gram}	t	2025-10-03 22:35:11.753	2025-10-09 08:43:24.62
cmgbf9xyy019m8igv2fy2y827	Ground Lamb	Carne Tocată de Miel	100g	\N	294	25	0	21	0	0	proteins	{"Pure:Ground Lamb",TYPE:gram}	t	2025-10-03 22:35:13.595	2025-10-09 08:43:24.722
cmgbf9znv019x8igvf5p7gv5f	Trout	Păstrăv	100g	\N	119	20	0	3.5	0	0	proteins	{Pure:Trout,TYPE:gram}	t	2025-10-03 22:35:15.788	2025-10-09 08:43:24.813
cmgbf5hcl01668igve722zbu4	Cherry	Cireașă	100g	\N	63	1.1	16	0.2	2.1	12.8	fruits	{Pure:Cherry,TYPE:gram}	t	2025-10-03 22:31:45.429	2025-10-09 08:47:37.577
cmgbf5mrh017y8igv3naadw7n	Pistachios	Fistic	100g	\N	560	20	27	45	10	7.7	nuts-seeds	{Pure:Pistachios,TYPE:gram}	t	2025-10-03 22:31:52.445	2025-10-09 08:47:37.689
cmgbf5nwr018c8igv7vaxmroy	Tahini	Tahini	100g	\N	595	17	21	54	9	0.5	healthy-fats	{Pure:Tahini,TYPE:gram}	t	2025-10-03 22:31:53.931	2025-10-09 08:47:37.781
cmgbf5ov9018o8igvxsanyudm	Rosemary	Rozmarin	100g	\N	131	3.3	21	5.9	14	0	other	{Pure:Rosemary,TYPE:gram}	t	2025-10-03 22:31:55.173	2025-10-09 08:47:37.931
cmgdx5a0100257sfkxb7tug2x	Raspberries	Zmeură	100g	\N	52	1.2	11.9	0.7	6.5	4.4	fruits	{Pure:Fruits,TYPE:gram}	t	2025-10-05 16:31:01.345	2025-10-09 08:03:09.854
cmgdx7ow300267sfkl6m7qfaf	Protein Powder	Pudră Proteică	1 scoop (15g)	\N	60	15	1	0.5	0	0	proteins	{Pure:Proteins,TYPE:scoop}	t	2025-10-05 16:32:53.955	2025-10-09 08:03:09.937
cmgbf5ik7016k8igvcr9zcjbl	Garlic	Usturoi	100g	\N	149	6.4	33.1	0.5	2.1	1	vegetables	{Pure:Garlic,TYPE:gram}	t	2025-10-03 22:31:46.999	2025-10-09 08:03:12.108
cmgbf5kqi01798igvv7l11gk0	Greek Yogurt	Iaurt Grecesc	100g	\N	59	10	3.6	0.4	0	3.6	dairy	{"Pure:Greek Yogurt",TYPE:gram}	t	2025-10-03 22:31:49.818	2025-10-09 08:03:13.674
cmgbf5ncp01858igvhrd9w7qp	Flax Seeds	Semințe de In	100g	\N	534	18.3	28.9	42.2	27.3	1.6	nuts-seeds	{"Pure:Flax Seeds",TYPE:gram}	t	2025-10-03 22:31:53.21	2025-10-09 08:03:15.23
cmgbf5oz2018p8igvr0vfzd9j	Cinnamon	Scorțișoară	100g	\N	247	4	80.6	1.2	53.1	2.2	other	{Pure:Cinnamon,TYPE:gram}	t	2025-10-03 22:31:55.31	2025-10-09 08:03:16.079
cmgdxdtg600277sfkmczwvpn3	Baking Powder	Praf de Copt	1 tsp (4g)	\N	2	0	1	0	0	0	other	{Pure:Other,TYPE:tsp}	t	2025-10-05 16:37:39.798	2025-10-09 08:03:10.033
cmgdxdyl400287sfkijj00pag	Blueberries	Afine	100g	\N	57	0.7	14.5	0.3	2.4	10	fruits	{Pure:Fruits,TYPE:gram}	t	2025-10-05 16:37:46.456	2025-10-09 08:03:10.118
cmgdxe3f500297sfk7gxjxpm2	Strawberries	Căpșuni	100g	\N	32	0.7	7.7	0.3	2	4.9	fruits	{Pure:Fruits,TYPE:gram}	t	2025-10-05 16:37:52.721	2025-10-09 08:03:10.202
cmgbfeymh01bj8igvnn7rewjm	1 Cup Greek Yogurt	Iaurt Grecesc	1	\N	100	17	6	0.7	0	6	dairy	{"PerPiece:Greek Yogurt",TYPE:cup}	t	2025-10-03 22:39:07.721	2025-10-09 08:35:56.668
cmgdxe8aw002a7sfkfwiq36r7	Agave Syrup	Sirop de Agave	1 tsp (7g)	\N	20	0	5	0	0	5	other	{Pure:Other,TYPE:tsp}	t	2025-10-05 16:37:59.048	2025-10-09 08:47:38.02
cmge1jq1s002r87gynqbbrjxz	1 tsp Coconut Oil	Ulei de Cocos	1 tsp (4.5g)	\N	39	0	0	5	0	0	healthy-fats	{"Pure:Coconut Oil",TYPE:tsp}	t	2025-10-05 18:34:13.793	2025-10-09 08:35:58.262
cmgbf9yfs019p8igvliti5peu	Ground Turkey	Carne Tocată de Curcan	100g	\N	189	29	0	7	0	0	proteins	{"Pure:Ground Turkey",TYPE:gram}	t	2025-10-03 22:35:14.201	2025-10-09 08:43:26.585
cmgbf5nff01868igv4ufen48r	Sesame Seeds	Semințe de Susan	100g	\N	573	18	23	50	12	0	nuts-seeds	{"Pure:Sesame Seeds",TYPE:gram}	t	2025-10-03 22:31:53.307	2025-10-09 08:47:39.563
cmgbf5o8l018g8igvbpteyvzh	Black Pepper	Piper Negru	100g	\N	251	10	64	3.3	25	0.6	other	{"Pure:Black Pepper",TYPE:gram}	t	2025-10-03 22:31:54.357	2025-10-09 08:47:39.745
cmgbf5ob8018h8igv9kfmzqdp	Garlic Powder	Pudră de Usturoi	100g	\N	331	16.6	72.7	0.7	9	2.4	other	{"Pure:Garlic Powder",TYPE:gram}	t	2025-10-03 22:31:54.453	2025-10-09 08:47:39.839
cmge2u46d003287gywaub13sq	Almond milk	Lapte de Migdale	100ml	\N	17	0.6	0.5	1.5	0	0	dairy	{"Pure:Almond milk"}	t	2025-10-05 19:10:18.278	2025-10-09 08:47:38.121
cmgbf5mts017z8igvr70e40ly	Pecans	Nuci Pecan	100g	\N	691	9.2	13.9	72	9.6	4	nuts-seeds	{Pure:Pecans,TYPE:gram}	t	2025-10-03 22:31:52.528	2025-10-09 08:47:39.37
cmgbf5my901808igv4a4ohtl9	Hazelnuts	Alune	100g	\N	628	15	16.7	60.8	9.7	4.3	nuts-seeds	{Pure:Hazelnuts,TYPE:gram}	t	2025-10-03 22:31:52.69	2025-10-09 08:47:39.473
cmgh1lg99006m89gxhrqf9vf9	Test chiel	\N	100g	\N	30	30	0	0	0	0	other	{"Pure:Test chiel"}	t	2025-10-07 20:58:52.942	2025-10-07 20:58:52.942
cmgh1z1g6006n89gxyv0eysti	Salad	Salată	100g	\N	15	1.4	2.9	0	0	0	vegetables	{Pure:Salad}	t	2025-10-07 21:09:26.935	2025-10-09 08:47:38.23
cmgh2a02h006o89gxm6nq7wof	Tomato sauce	Sos de Roșii	100g	\N	40	1.5	8	0.2	0	0	other	{"Pure:Tomato sauce"}	t	2025-10-07 21:17:58.361	2025-10-09 08:03:10.288
cmgh2qo9l006p89gxswga5zs1	Coconut flakes	Fulgi de Cocos	100g	\N	660	7	25	65	0	0	other	{"Pure:Coconut flakes"}	t	2025-10-07 21:30:56.217	2025-10-09 08:48:40.906
cmgh55yt7006r89gxvvpxdfo2	Mashed potato	Piure de Cartofi	100g	\N	90	2	20	0.5	0	0	other	{"Pure:Mashed potato"}	t	2025-10-07 22:38:48.956	2025-10-09 08:48:41.025
cmgh5qg91006s89gxiy8sei1d	Rice cake	Tort de Orez	1	\N	35	0.7	7.5	0.3	0	0	other	{"Pure:Rice cake"}	t	2025-10-07 22:54:44.677	2025-10-09 08:48:41.12
cmgh5t3nr006t89gxod87g1o4	Dry Couscous	Cuscus Uscat	100g	\N	112	12	72	0.6	0	0	other	{"Pure:Dry Couscous"}	t	2025-10-07 22:56:48.328	2025-10-09 08:48:41.213
cmgh5w459006u89gxq5it4ynd	Cooked beans	Fasole Fiartă	100g	\N	127	8.7	22.8	0.5	0	0	other	{"Pure:Cooked beans"}	t	2025-10-07 22:59:08.925	2025-10-09 08:48:41.336
cmgh5xh4m006v89gxgvtayhwm	Dry beans	Fasole Uscată	100g	\N	330	22	60	2	16	0	other	{"Pure:Dry beans"}	t	2025-10-07 23:00:12.406	2025-10-09 08:48:41.424
cmgh6faoa006w89gxqq4i11ic	Corn	Porumb	100g	\N	96	3.4	21	1.5	0	0	other	{Pure:Corn}	t	2025-10-07 23:14:03.85	2025-10-09 08:03:10.376
cmgbf5gad015v8igvksxjfuwd	Apple	Măr	100g	\N	52	0.3	13.8	0.2	2.4	10.4	fruits	{Pure:Apple,TYPE:gram}	t	2025-10-03 22:31:44.053	2025-10-09 08:03:10.461
cmgbf5gn2015y8igvp5lz9okt	Strawberry	Căpșună	100g	\N	32	0.7	7.7	0.3	2	4.9	fruits	{Pure:Strawberry,TYPE:gram}	t	2025-10-03 22:31:44.511	2025-10-09 08:03:10.631
cmgbf5gys01618igvgbq4diw9	Lemon	Lămâie	100g	\N	29	1.1	9.3	0.3	2.8	2.5	fruits	{Pure:Lemon,TYPE:gram}	t	2025-10-03 22:31:44.932	2025-10-09 08:03:10.72
cmgbf5gwa01608igv99ufujmb	Grape	Strugure	100g	\N	67	0.6	17	0.4	0.9	16	fruits	{Pure:Grape,TYPE:gram}	t	2025-10-03 22:31:44.842	2025-10-09 08:47:38.446
cmgbf5hl501698igvynw4l7jj	Cantaloupe	Pepene Cantaloupe	100g	\N	34	0.8	8.2	0.2	0.9	7.9	fruits	{Pure:Cantaloupe,TYPE:gram}	t	2025-10-03 22:31:45.737	2025-10-09 08:47:38.538
cmgbf5h1f01628igvbwyin4vl	Lime	Lime	100g	\N	30	0.7	10.5	0.2	2.8	1.7	fruits	{Pure:Lime,TYPE:gram}	t	2025-10-03 22:31:45.027	2025-10-09 08:03:10.804
cmgbf5h4101638igvc7vzzfoy	Kiwi	Kiwi	100g	\N	61	1.1	14.7	0.5	3	9	fruits	{Pure:Kiwi,TYPE:gram}	t	2025-10-03 22:31:45.121	2025-10-09 08:03:10.92
cmgbf5h6k01648igv1jggzx0w	Pear	Pară	100g	\N	57	0.4	15.2	0.1	3.1	9.8	fruits	{Pure:Pear,TYPE:gram}	t	2025-10-03 22:31:45.212	2025-10-09 08:03:11.004
cmgbf5ha801658igvije2rlgt	Peach	Piersică	100g	\N	39	0.9	9.5	0.3	1.5	8.4	fruits	{Pure:Peach,TYPE:gram}	t	2025-10-03 22:31:45.344	2025-10-09 08:03:11.085
cmgbf5hfn01678igvkmlkko35	Plum	Prună	100g	\N	46	0.7	11.4	0.3	1.4	9.9	fruits	{Pure:Plum,TYPE:gram}	t	2025-10-03 22:31:45.539	2025-10-09 08:03:11.172
cmgbf5hi601688igvco2w9ua6	Watermelon	Pepene Verde	100g	\N	30	0.6	7.6	0.2	0.4	6.2	fruits	{Pure:Watermelon,TYPE:gram}	t	2025-10-03 22:31:45.631	2025-10-09 08:03:11.255
cmgbf5hou016a8igvv5p8cmob	Mango	Mango	100g	\N	60	0.8	15	0.4	1.6	13.7	fruits	{Pure:Mango,TYPE:gram}	t	2025-10-03 22:31:45.871	2025-10-09 08:03:11.336
cmgbf5jb2016t8igvawi7hj19	Kale	Varză Kale	100g	\N	49	4.3	8.8	0.9	3.6	2.3	vegetables	{Pure:Kale,TYPE:gram}	t	2025-10-03 22:31:47.967	2025-10-09 08:47:38.664
cmgbf5hui016b8igvxxokr18e	Pineapple	Ananas	100g	\N	50	0.5	13.1	0.1	1.4	9.9	fruits	{Pure:Pineapple,TYPE:gram}	t	2025-10-03 22:31:46.074	2025-10-09 08:03:11.428
cmgbf5hwz016c8igv0rqomyyz	Avocado	Avocado	100g	\N	160	2	8.5	14.7	6.7	0.7	fruits	{Pure:Avocado,TYPE:gram}	t	2025-10-03 22:31:46.163	2025-10-09 08:03:11.512
cmgbf5hzc016d8igvygu6cm2l	Broccoli	Broccoli	100g	\N	34	2.8	6.6	0.4	2.6	1.5	vegetables	{Pure:Broccoli,TYPE:gram}	t	2025-10-03 22:31:46.249	2025-10-09 08:03:11.595
cmgbf5i3r016e8igvfc3sfn5n	Spinach	Spanac	100g	\N	23	2.9	3.6	0.4	2.2	0.4	vegetables	{Pure:Spinach,TYPE:gram}	t	2025-10-03 22:31:46.407	2025-10-09 08:03:11.685
cmgbf5i8q016g8igv11v4u9e7	Tomato	Roșie	100g	\N	18	0.9	3.9	0.2	1.2	2.6	vegetables	{Pure:Tomato,TYPE:gram}	t	2025-10-03 22:31:46.587	2025-10-09 08:03:11.771
cmgbf5ib4016h8igv77rvjpu4	Cucumber	Castravete	100g	\N	16	0.7	4	0.1	0.5	1.7	vegetables	{Pure:Cucumber,TYPE:gram}	t	2025-10-03 22:31:46.672	2025-10-09 08:03:11.857
cmgbf5if0016i8igvg6g4e698	Bell Pepper	Ardei Gras	100g	\N	20	0.9	4.6	0.2	1.5	2.4	vegetables	{"Pure:Bell Pepper",TYPE:gram}	t	2025-10-03 22:31:46.812	2025-10-09 08:03:11.942
cmgbf5ihw016j8igv1on3vlk2	Onion	Ceapă	100g	\N	40	1.1	9.3	0.1	1.7	4.2	vegetables	{Pure:Onion,TYPE:gram}	t	2025-10-03 22:31:46.916	2025-10-09 08:03:12.025
cmgbf5ind016l8igv1a70d7no	Lettuce	Salată Verde	100g	\N	15	1.4	2.9	0.2	1.3	0.8	vegetables	{Pure:Lettuce,TYPE:gram}	t	2025-10-03 22:31:47.113	2025-10-09 08:03:12.208
cmgbf5ipn016m8igv00tm0q6u	Asparagus	Sparanghel	100g	\N	20	2.2	4	0.1	2.1	0	vegetables	{Pure:Asparagus,TYPE:gram}	t	2025-10-03 22:31:47.196	2025-10-09 08:03:12.295
cmgbf5irz016n8igv5k7s9t64	Green Beans	Fasole Verde	100g	\N	31	1.8	7	0.1	2.7	0	vegetables	{"Pure:Green Beans",TYPE:gram}	t	2025-10-03 22:31:47.279	2025-10-09 08:03:12.387
cmgbf5iwj016o8igvg872zt5s	Mushrooms	Ciuperci	100g	\N	22	3.1	3.3	0.3	1	0	vegetables	{Pure:Mushrooms,TYPE:gram}	t	2025-10-03 22:31:47.444	2025-10-09 08:03:12.464
cmgbf5iyw016p8igv48mjh4ih	Zucchini	Dovlecel	100g	\N	17	1.2	3.1	0.3	1	2.5	vegetables	{Pure:Zucchini,TYPE:gram}	t	2025-10-03 22:31:47.528	2025-10-09 08:03:12.554
cmgbf5j44016r8igv0lwb6seb	Cauliflower	Conopidă	100g	\N	25	1.9	5	0.3	2	1.9	vegetables	{Pure:Cauliflower,TYPE:gram}	t	2025-10-03 22:31:47.716	2025-10-09 08:03:12.642
cmgbf5j7n016s8igvlk4z8mrq	Cabbage	Varză	100g	\N	25	1.3	5.8	0.1	2.5	3.2	vegetables	{Pure:Cabbage,TYPE:gram}	t	2025-10-03 22:31:47.843	2025-10-09 08:03:12.726
cmgbf5jda016u8igvzgck353p	Sweet Potato	Cartof Dulce	100g	\N	86	1.6	20.1	0.1	3	4.2	vegetables	{"Pure:Sweet Potato",TYPE:gram}	t	2025-10-03 22:31:48.047	2025-10-09 08:03:12.813
cmgbf5jgf016v8igv5viv7qkz	Chicken Breast	Piept de Pui	100g	\N	165	31	0	3.6	0	0	proteins	{"Pure:Chicken Breast",TYPE:gram}	t	2025-10-03 22:31:48.16	2025-10-09 08:03:12.895
cmgbf5jiw016w8igv985rdgdo	Beef	Carne de Vită	100g	\N	250	26	0	15	0	0	proteins	{Pure:Beef,TYPE:gram}	t	2025-10-03 22:31:48.248	2025-10-09 08:03:12.985
cmgbf5jl0016x8igvpoesllv8	Salmon	Somon	100g	\N	208	25.4	0	12.4	0	0	proteins	{Pure:Salmon,TYPE:gram}	t	2025-10-03 22:31:48.324	2025-10-09 08:03:13.073
cmgbf5jpp016y8igvs4jl1qkc	Tuna	Ton	100g	\N	132	28	0	1.3	0	0	proteins	{Pure:Tuna,TYPE:gram}	t	2025-10-03 22:31:48.493	2025-10-09 08:03:13.157
cmgbf5js4016z8igvh2ey21of	Turkey	Curcan	100g	\N	189	29	0	7	0	0	proteins	{Pure:Turkey,TYPE:gram}	t	2025-10-03 22:31:48.58	2025-10-09 08:03:13.245
cmgbf5jv401708igv12wiy23y	Pork	Porc	100g	\N	242	27.3	0	13.9	0	0	proteins	{Pure:Pork,TYPE:gram}	t	2025-10-03 22:31:48.688	2025-10-09 08:03:13.331
cmgbf5gpe015z8igvtgxut6fq	Blueberry	Afină	100g	\N	57	0.7	14.5	0.3	2.4	10	fruits	{Pure:Blueberry,TYPE:gram}	t	2025-10-03 22:31:44.594	2025-10-09 08:47:38.346
cmgbf5gk5015x8igval4ozi3v	Orange	Portocală	100g	\N	47	0.9	11.8	0.1	2.4	9.4	fruits	{Pure:Orange,TYPE:gram}	t	2025-10-03 22:31:44.406	2025-10-09 08:03:10.544
cmgbf5k4f01738igv9bg7jnpm	Egg Whites	Albuș	100g	\N	52	10.9	0.7	0.2	0	0.7	proteins	{"Pure:Egg Whites",TYPE:gram}	t	2025-10-03 22:31:49.023	2025-10-09 08:03:13.507
cmgbf5ko601788igv4oj8j1yy	Milk	Lapte	100g	\N	42	3.4	5	1	0	5	dairy	{Pure:Milk,TYPE:gram}	t	2025-10-03 22:31:49.735	2025-10-09 08:03:13.588
cmgbf5k9n01758igva8w5olba	Shrimp	Creveți	100g	\N	99	24	0	0.3	0	0	proteins	{Pure:Shrimp,TYPE:gram}	t	2025-10-03 22:31:49.211	2025-10-09 08:43:25.043
cmgbf5lya017o8igvoceezzrx	Basmati Rice	Orez Basmati	100g	\N	130	2.7	28	0.3	0.4	0.1	carbohydrates	{"Pure:Basmati Rice",TYPE:gram}	t	2025-10-03 22:31:51.394	2025-10-09 08:43:25.137
cmgbf5kcn01768igvsm6emxbc	Crab	\N	100g	\N	97	20	0	1.5	0	0	proteins	{Pure:Crab,TYPE:gram}	t	2025-10-03 22:31:49.319	2025-10-03 22:43:49.445
cmgbf5kf701778igvidgugupg	Lobster	\N	100g	\N	89	19	0	0.9	0	0	proteins	{Pure:Lobster,TYPE:gram}	t	2025-10-03 22:31:49.412	2025-10-03 22:43:49.524
cmgbf5kzp017c8igv7lpg6oqf	Mozzarella	Mozzarella	100g	\N	280	22	2.2	22	0	1	dairy	{Pure:Mozzarella,TYPE:gram}	t	2025-10-03 22:31:50.149	2025-10-09 08:03:13.758
cmgbf5l2q017d8igvuchn7lwk	Feta Cheese	Brânză Feta	100g	\N	264	14	4.1	21	0	4.1	dairy	{"Pure:Feta Cheese",TYPE:gram}	t	2025-10-03 22:31:50.258	2025-10-09 08:03:13.841
cmgbf5l55017e8igvwl17n7y0	Parmesan	Parmezan	100g	\N	431	38	4.1	29	0	0.9	dairy	{Pure:Parmesan,TYPE:gram}	t	2025-10-03 22:31:50.345	2025-10-09 08:47:38.858
cmgbf5l7d017f8igvuvs0btbr	Butter	Unt	100g	\N	717	0.9	0.1	81	0	0.1	dairy	{Pure:Butter,TYPE:gram}	t	2025-10-03 22:31:50.425	2025-10-09 08:03:13.928
cmgbf5ljc017j8igvp7v9hmpk	Whole Wheat Bread	Pâine Integrală	100g	\N	247	13	41	4.2	6	4.3	carbohydrates	{"Pure:Whole Wheat Bread",TYPE:gram}	t	2025-10-03 22:31:50.856	2025-10-09 08:03:14.014
cmgbf5lc6017g8igv1000xe28	Cream Cheese	Brânză Cremă	100g	\N	342	6	4.1	34	0	3.2	dairy	{"Pure:Cream Cheese",TYPE:gram}	t	2025-10-03 22:31:50.599	2025-10-09 08:47:38.972
cmgbf5lmt017k8igv7jor2b3b	Pasta	Paste	100g	\N	131	5	25	1.1	1.8	0.6	carbohydrates	{Pure:Pasta,TYPE:gram}	t	2025-10-03 22:31:50.982	2025-10-09 08:03:14.105
cmgbf5len017h8igvgg6czxkg	Ricotta	Ricotta	100g	\N	174	11	3	13	0	0.3	dairy	{Pure:Ricotta,TYPE:gram}	t	2025-10-03 22:31:50.687	2025-10-09 08:47:39.281
cmgbf5k6q01748igvcfwimqs2	Cod	Cod	100g	\N	82	18	0	0.7	0	0	proteins	{Pure:Cod,TYPE:gram}	t	2025-10-03 22:31:49.107	2025-10-09 08:43:24.944
cmgbf5lsv017m8igvvmlnnmn5	White Rice	Orez Alb	100g	\N	130	2.7	28	0.3	0.4	0.1	carbohydrates	{"Pure:White Rice",TYPE:gram}	t	2025-10-03 22:31:51.2	2025-10-09 08:03:14.197
cmgbf5lvq017n8igvs88y9bew	Brown Rice	Orez Brun	100g	\N	111	2.6	23	0.9	1.8	0.4	carbohydrates	{"Pure:Brown Rice",TYPE:gram}	t	2025-10-03 22:31:51.302	2025-10-09 08:03:14.283
cmgbf5m0k017p8igvoip73ibx	Quinoa	Quinoa	100g	\N	120	4.4	22	1.9	2.8	0.9	carbohydrates	{Pure:Quinoa,TYPE:gram}	t	2025-10-03 22:31:51.476	2025-10-09 08:03:14.378
cmgbf5m55017q8igvy7wc0y0v	Oats	Ovăz	100g	\N	389	16.9	66.3	6.9	10.6	0.5	carbohydrates	{Pure:Oats,TYPE:gram}	t	2025-10-03 22:31:51.642	2025-10-09 08:03:14.459
cmgbf5md1017t8igvvx7h8nfg	Bulgur	Bulgur	100g	\N	83	3.1	19	0.2	4.5	0	carbohydrates	{Pure:Bulgur,TYPE:gram}	t	2025-10-03 22:31:51.926	2025-10-09 08:43:25.235
cmgbf5m7h017r8igvaw5uouch	Potato	Cartof	100g	\N	77	2	17.5	0.1	2.2	0.8	carbohydrates	{Pure:Potato,TYPE:gram}	t	2025-10-03 22:31:51.726	2025-10-09 08:03:14.542
cmgbf5mjo017v8igvdbpxa1qi	Almonds	Migdale	100g	\N	579	21.2	21.6	49.9	12.5	4.4	nuts-seeds	{Pure:Almonds,TYPE:gram}	t	2025-10-03 22:31:52.165	2025-10-09 08:03:14.63
cmgbf5mlz017w8igv9fvdnewz	Walnuts	Nuci	100g	\N	654	15.2	13.7	65.2	6.7	2.6	nuts-seeds	{Pure:Walnuts,TYPE:gram}	t	2025-10-03 22:31:52.247	2025-10-09 08:03:14.718
cmgbf5mg1017u8igvdbvn593j	Barley	Orz	100g	\N	352	12	73	2.3	17	0.8	carbohydrates	{Pure:Barley,TYPE:gram}	t	2025-10-03 22:31:52.033	2025-10-09 08:43:25.325
cmgbf5kxa017b8igv2gv8aqbz	Cheddar Cheese	Brânză Cheddar	100g	\N	403	25	1.3	33	0	0.5	dairy	{"Pure:Cheddar Cheese",TYPE:gram}	t	2025-10-03 22:31:50.062	2025-10-09 08:47:38.762
cmgbf5mow017x8igveufng70b	Cashews	Caju	100g	\N	553	18.2	30.2	43.8	3.3	5.9	nuts-seeds	{Pure:Cashews,TYPE:gram}	t	2025-10-03 22:31:52.353	2025-10-09 08:03:14.797
cmgbf5n0q01818igvalzoq760	Peanuts	Arahide	100g	\N	567	26	16	49	8.5	4.7	nuts-seeds	{Pure:Peanuts,TYPE:gram}	t	2025-10-03 22:31:52.779	2025-10-09 08:03:14.879
cmgbf5n3e01828igv6dye82ba	Sunflower Seeds	Semințe de Floarea Soarelui	100g	\N	584	21	20	51	9	0	nuts-seeds	{"Pure:Sunflower Seeds",TYPE:gram}	t	2025-10-03 22:31:52.874	2025-10-09 08:03:14.974
cmgbf5n5o01838igvez6o0fny	Pumpkin Seeds	Semințe de Dovleac	100g	\N	559	30	11	49	6	0	nuts-seeds	{"Pure:Pumpkin Seeds",TYPE:gram}	t	2025-10-03 22:31:52.956	2025-10-09 08:03:15.06
cmgbf5n8w01848igvze4j6av8	Chia Seeds	Semințe de Chia	100g	\N	486	17	42	31	34	0	nuts-seeds	{"Pure:Chia Seeds",TYPE:gram}	t	2025-10-03 22:31:53.072	2025-10-09 08:03:15.145
cmgbf5lh5017i8igvv62s2g2a	White Bread	Pâine Albă	100g	\N	265	9	49	3.2	2.7	5.7	carbohydrates	{"Pure:White Bread",TYPE:gram}	t	2025-10-03 22:31:50.777	2025-10-09 08:35:58.34
cmgbf5k0k01728igvvyj838u6	Eggs	Ouă	100g	\N	155	13	1.1	11	0	1.1	proteins	{Pure:Eggs,TYPE:gram}	t	2025-10-03 22:31:48.884	2025-10-09 08:03:13.416
cmgbf5nra018a8igv39uhyl0g	Almond Butter	Unt de Migdale	100g	\N	614	21.2	18.8	55.5	10.3	4.4	healthy-fats	{"Pure:Almond Butter",TYPE:gram}	t	2025-10-03 22:31:53.735	2025-10-09 08:03:15.549
cmgbf5odl018i8igvsx6xw9mp	Onion Powder	Pudră de Ceapă	100g	\N	341	10	79	1	15	38	other	{"Pure:Onion Powder",TYPE:gram}	t	2025-10-03 22:31:54.537	2025-10-09 08:47:39.977
cmgbf5nti018b8igvzs70hvt9	Peanut Butter	Unt de Arahide	100g	\N	588	25.1	20	50.4	8.5	9.2	healthy-fats	{"Pure:Peanut Butter",TYPE:gram}	t	2025-10-03 22:31:53.814	2025-10-09 08:03:15.643
cmgbf5nz2018d8igvpx48d6zr	Honey	Miere	100g	\N	304	0.3	82.4	0	0.2	82.1	other	{Pure:Honey,TYPE:gram}	t	2025-10-03 22:31:54.015	2025-10-09 08:03:15.737
cmgbf5o2i018e8igv13hx2z99	Maple Syrup	Sirop de Arțar	100g	\N	260	0	67	0	0	67	other	{"Pure:Maple Syrup",TYPE:gram}	t	2025-10-03 22:31:54.138	2025-10-09 08:03:15.82
cmgbf5o5x018f8igvq01av7e5	Salt	Sare	100g	\N	0	0	0	0	0	0	other	{Pure:Salt,TYPE:gram}	t	2025-10-03 22:31:54.262	2025-10-09 08:03:15.916
cmgbf5ofu018j8igvc3dm9dgx	Paprika	Boia	100g	\N	282	14	54	13	35	10	other	{Pure:Paprika,TYPE:gram}	t	2025-10-03 22:31:54.619	2025-10-09 08:03:15.996
cmgbf5okb018k8igvey0y9mjf	Cumin	Chimion	100g	\N	375	18	44	22	11	2.3	other	{Pure:Cumin,TYPE:gram}	t	2025-10-03 22:31:54.779	2025-10-09 08:47:40.072
cmgbf5omp018l8igvnnkf9rz1	Oregano	Oregano	100g	\N	265	9	69	4.3	43	4.1	other	{Pure:Oregano,TYPE:gram}	t	2025-10-03 22:31:54.866	2025-10-09 08:47:40.184
cmgbf5opu018m8igv9e6i0ebb	Basil	Busuioc	100g	\N	22	3.2	2.6	0.6	1.6	0.3	other	{Pure:Basil,TYPE:gram}	t	2025-10-03 22:31:54.978	2025-10-09 08:47:40.302
cmgbf5p6p018s8igv6lmtavw3	Vinegar	Oțet	100g	\N	19	0	0.9	0	0	0.4	other	{Pure:Vinegar,TYPE:gram}	t	2025-10-03 22:31:55.586	2025-10-09 08:03:16.172
cmgbf5os3018n8igv8h523gi4	Thyme	Cimbru	100g	\N	101	5.6	24	1.7	14	0	other	{Pure:Thyme,TYPE:gram}	t	2025-10-03 22:31:55.06	2025-10-09 08:47:40.395
cmgbf5p1a018q8igv5yqw4rk3	Ginger	Ghimbir	100g	\N	80	1.8	18	0.8	2	1.7	other	{Pure:Ginger,TYPE:gram}	t	2025-10-03 22:31:55.391	2025-10-09 08:47:40.496
cmgbf5p49018r8igvd3x0ivon	Turmeric	Curcuma	100g	\N	354	8	65	10	21	3.2	other	{Pure:Turmeric,TYPE:gram}	t	2025-10-03 22:31:55.497	2025-10-09 08:47:40.625
cmgbf5p99018t8igvuzpjcv7b	Lemon Juice	Suc de Lămâie	100g	\N	22	0.4	7	0.2	0.3	0	other	{"Pure:Lemon Juice",TYPE:gram}	t	2025-10-03 22:31:55.677	2025-10-09 08:47:40.747
cmgbf9tgj018v8igvypndnf1j	Beef Steak	Friptură de Vită	100g	\N	250	26	0	15	0	0	proteins	{"Pure:Beef Steak",TYPE:gram}	t	2025-10-03 22:35:07.748	2025-10-09 08:03:16.259
cmgbf5pdm018u8igvahvn9pmp	Lime Juice	Suc de Lime	100g	\N	25	0.4	8.4	0.1	0.2	0	other	{"Pure:Lime Juice",TYPE:gram}	t	2025-10-03 22:31:55.835	2025-10-09 08:47:40.873
cmgbf9u22018z8igvpdnfn518	Ground Beef	Carne Tocată de Vită	100g	\N	254	25	0	16	0	0	proteins	{"Pure:Ground Beef",TYPE:gram}	t	2025-10-03 22:35:08.522	2025-10-09 08:03:16.341
cmgbf9uqa01938igvrbx1y9lb	Pork Chop	Cotlet de Porc	100g	\N	242	27.3	0	13.9	0	0	proteins	{"Pure:Pork Chop",TYPE:gram}	t	2025-10-03 22:35:09.394	2025-10-09 08:35:58.426
cmgbf9txb018y8igvwv6za9qt	Tenderloin	Mușchi File	100g	\N	250	26	0	15	0	0	proteins	{Pure:Tenderloin,TYPE:gram}	t	2025-10-03 22:35:08.352	2025-10-09 08:43:25.508
cmgbf9u9301908igvwrnk8adn	Beef Chuck	Pulpă de Vită	100g	\N	250	26	0	15	0	0	proteins	{"Pure:Beef Chuck",TYPE:gram}	t	2025-10-03 22:35:08.775	2025-10-09 08:43:25.606
cmgbf9wah019b8igve2tpm0s3	Chicken Thigh	Pulpă de Pui	100g	\N	209	26	0	10	0	0	proteins	{"Pure:Chicken Thigh",TYPE:gram}	t	2025-10-03 22:35:11.418	2025-10-09 08:35:58.501
cmgbf9vd801968igvryvzmzkz	Pork Belly	Slănină	100g	\N	518	9	0	53	0	0	proteins	{"Pure:Pork Belly",TYPE:gram}	t	2025-10-03 22:35:10.221	2025-10-09 08:43:25.69
cmgbf9udv01918igv0qibbs9q	Beef Brisket	\N	100g	\N	250	26	0	15	0	0	proteins	{"Pure:Beef Brisket",TYPE:gram}	t	2025-10-03 22:35:08.948	2025-10-03 22:43:55.822
cmgbf9uk401928igvtx1wbig4	Beef Short Ribs	\N	100g	\N	250	26	0	15	0	0	proteins	{"Pure:Beef Short Ribs",TYPE:gram}	t	2025-10-03 22:35:09.172	2025-10-03 22:43:55.903
cmgbf9wf8019c8igv35fgsl5n	Chicken Wing	Aripioare de Pui	100g	\N	203	18	0	14	0	0	proteins	{"Pure:Chicken Wing",TYPE:gram}	t	2025-10-03 22:35:11.588	2025-10-09 08:35:58.577
cmgbf9uv601948igvbvcodjtm	Pork Tenderloin	\N	100g	\N	143	26	0	3	0	0	proteins	{"Pure:Pork Tenderloin",TYPE:gram}	t	2025-10-03 22:35:09.57	2025-10-03 22:43:56.072
cmgbf9uzr01958igvwgc0cfcv	Pork Shoulder	\N	100g	\N	242	27.3	0	13.9	0	0	proteins	{"Pure:Pork Shoulder",TYPE:gram}	t	2025-10-03 22:35:09.736	2025-10-03 22:43:56.153
cmgbf9vjl01978igvtp8afw5z	Ground Pork	Carne Tocată de Porc	100g	\N	242	27.3	0	13.9	0	0	proteins	{"Pure:Ground Pork",TYPE:gram}	t	2025-10-03 22:35:10.449	2025-10-09 08:43:25.777
cmgbf9vw501998igvsnozazko	Bacon	Bacon	100g	\N	541	37	1.4	42	0	0	proteins	{Pure:Bacon,TYPE:gram}	t	2025-10-03 22:35:10.901	2025-10-09 08:43:25.869
cmgbf9w1r019a8igvialdfnoy	Ham	Șuncă	100g	\N	145	18	1.5	7	0	0	proteins	{Pure:Ham,TYPE:gram}	t	2025-10-03 22:35:11.103	2025-10-09 08:43:25.965
cmgbf5nms01898igvpnryx2dt	Avocado Oil	Ulei de Avocado	100g	\N	884	0	0	100	0	0	healthy-fats	{"Pure:Avocado Oil",TYPE:gram}	t	2025-10-03 22:31:53.573	2025-10-09 08:47:39.655
cmgbf9tlb018w8igvio3pcvdl	Ribeye Steak	Antricot	100g	\N	291	25	0	20	0	0	proteins	{"Pure:Ribeye Steak",TYPE:gram}	t	2025-10-03 22:35:07.919	2025-10-09 08:43:25.416
cmgbf5nki01888igvlx9t56nc	Coconut Oil	Ulei de Cocos	100g	\N	862	0	0	100	0	0	healthy-fats	{"Pure:Coconut Oil",TYPE:gram}	t	2025-10-03 22:31:53.49	2025-10-09 08:03:15.33
cmgbf9wvf019f8igvs1ycu51s	Ground Chicken	Carne Tocată de Pui	100g	\N	143	27	0	3	0	0	proteins	{"Pure:Ground Chicken",TYPE:gram}	t	2025-10-03 22:35:12.171	2025-10-09 08:43:26.185
cmgbf9xhy019j8igvv9ifi80q	Lamb Chop	Cotlet de Miel	100g	\N	294	25	0	21	0	0	proteins	{"Pure:Lamb Chop",TYPE:gram}	t	2025-10-03 22:35:12.982	2025-10-09 08:43:26.274
cmgbf9x34019g8igvj3s4yf2t	Chicken Liver	\N	100g	\N	116	17	0.7	4.8	0	0	proteins	{"Pure:Chicken Liver",TYPE:gram}	t	2025-10-03 22:35:12.448	2025-10-03 22:43:57.462
cmgbf9x7l019h8igvlinly454	Duck	\N	100g	\N	337	19	0	28	0	0	proteins	{Pure:Duck,TYPE:gram}	t	2025-10-03 22:35:12.609	2025-10-03 22:43:57.544
cmgbf9xcb019i8igvx7wt4pe2	Goose	\N	100g	\N	161	22	0	7	0	0	proteins	{Pure:Goose,TYPE:gram}	t	2025-10-03 22:35:12.779	2025-10-03 22:43:57.95
cmgbf9y3f019n8igvocxh8pfv	Turkey Thigh	Pulpă de Curcan	100g	\N	189	29	0	7	0	0	proteins	{"Pure:Turkey Thigh",TYPE:gram}	t	2025-10-03 22:35:13.756	2025-10-09 08:43:26.374
cmgbf9xmb019k8igvprkgevnz	Lamb Leg	\N	100g	\N	294	25	0	21	0	0	proteins	{"Pure:Lamb Leg",TYPE:gram}	t	2025-10-03 22:35:13.14	2025-10-03 22:43:58.113
cmgbf9xsv019l8igv02a4uwz3	Lamb Shoulder	\N	100g	\N	294	25	0	21	0	0	proteins	{"Pure:Lamb Shoulder",TYPE:gram}	t	2025-10-03 22:35:13.376	2025-10-03 22:43:58.186
cmgbf9yaz019o8igv2qgv4nlw	Turkey Wing	Aripioare de Curcan	100g	\N	189	29	0	7	0	0	proteins	{"Pure:Turkey Wing",TYPE:gram}	t	2025-10-03 22:35:14.027	2025-10-09 08:43:26.468
cmgbf9z6h019u8igv8v21ykv2	Mackerel	Macrou	100g	\N	205	19	0	14	0	0	proteins	{Pure:Mackerel,TYPE:gram}	t	2025-10-03 22:35:15.161	2025-10-09 08:43:26.715
cmgbf9zaw019v8igv9ulqnxqx	Sardines	Sardine	100g	\N	208	25	0	11	0	0	proteins	{Pure:Sardines,TYPE:gram}	t	2025-10-03 22:35:15.321	2025-10-09 08:43:26.848
cmgbf9yru019r8igvv90f8uwz	Cod Fillet	File de Cod	100g	\N	82	18	0	0.7	0	0	proteins	{"Pure:Cod Fillet",TYPE:gram}	t	2025-10-03 22:35:14.635	2025-10-09 08:35:58.662
cmgbf9wqy019e8igvpck21vxa	Chicken Leg	Pulpă de Pui	100g	\N	172	28	0	5	0	0	proteins	{"Pure:Chicken Leg",TYPE:gram}	t	2025-10-03 22:35:12.01	2025-10-09 08:43:26.092
cmgbf9ywo019s8igvesor9aca	Haddock	\N	100g	\N	90	20	0	0.6	0	0	proteins	{Pure:Haddock,TYPE:gram}	t	2025-10-03 22:35:14.808	2025-10-03 22:43:58.967
cmgbf9z18019t8igvecaex6cl	Halibut	\N	100g	\N	111	23	0	1.3	0	0	proteins	{Pure:Halibut,TYPE:gram}	t	2025-10-03 22:35:14.973	2025-10-03 22:43:59.046
cmgbf9zis019w8igvjq5bsf68	Anchovies	\N	100g	\N	131	20	0	4.8	0	0	proteins	{Pure:Anchovies,TYPE:gram}	t	2025-10-03 22:35:15.604	2025-10-03 22:43:59.307
cmgbf9zsg019y8igvgz16csag	Bass	\N	100g	\N	97	18	0	2	0	0	proteins	{Pure:Bass,TYPE:gram}	t	2025-10-03 22:35:15.952	2025-10-03 22:43:59.49
cmgbf9zze019z8igvna6eu4lh	Snapper	\N	100g	\N	100	20	0	1.3	0	0	proteins	{Pure:Snapper,TYPE:gram}	t	2025-10-03 22:35:16.202	2025-10-03 22:43:59.573
cmgbfa04601a08igvugqhbflt	Grouper	\N	100g	\N	92	19	0	1.2	0	0	proteins	{Pure:Grouper,TYPE:gram}	t	2025-10-03 22:35:16.374	2025-10-03 22:43:59.657
cmgbfa0bo01a18igvnk11nvai	Mahi Mahi	\N	100g	\N	85	18	0	0.7	0	0	proteins	{"Pure:Mahi Mahi",TYPE:gram}	t	2025-10-03 22:35:16.644	2025-10-03 22:44:00.245
cmgbfa0g301a28igvzotorb7c	Swordfish	\N	100g	\N	144	23	0	4.9	0	0	proteins	{Pure:Swordfish,TYPE:gram}	t	2025-10-03 22:35:16.804	2025-10-03 22:44:00.334
cmgbfa0ko01a38igvllllkjom	Tilapia	\N	100g	\N	96	20	0	1.7	0	0	proteins	{Pure:Tilapia,TYPE:gram}	t	2025-10-03 22:35:16.969	2025-10-03 22:44:00.453
cmgbfa0qb01a48igv9hck25qk	Catfish	\N	100g	\N	95	18	0	2.3	0	0	proteins	{Pure:Catfish,TYPE:gram}	t	2025-10-03 22:35:17.171	2025-10-03 22:44:00.539
cmgbfa0v501a58igvss6a8u9t	Perch	\N	100g	\N	91	19	0	0.9	0	0	proteins	{Pure:Perch,TYPE:gram}	t	2025-10-03 22:35:17.345	2025-10-03 22:44:00.617
cmgbfa11701a68igvu2mwt4nu	Pike	\N	100g	\N	88	19	0	0.7	0	0	proteins	{Pure:Pike,TYPE:gram}	t	2025-10-03 22:35:17.564	2025-10-03 22:44:00.699
cmgbfa1bq01a88igvttc8tzxe	Herring	\N	100g	\N	158	18	0	9	0	0	proteins	{Pure:Herring,TYPE:gram}	t	2025-10-03 22:35:17.943	2025-10-03 22:44:00.978
cmgbfa1gb01a98igvwwyoe543	Pollock	\N	100g	\N	82	18	0	0.6	0	0	proteins	{Pure:Pollock,TYPE:gram}	t	2025-10-03 22:35:18.108	2025-10-03 22:44:01.063
cmgbfa1lp01aa8igvt0rt94vc	Whiting	\N	100g	\N	90	18	0	1.2	0	0	proteins	{Pure:Whiting,TYPE:gram}	t	2025-10-03 22:35:18.301	2025-10-03 22:44:01.14
cmgbfa1r201ab8igvcfa3i6jk	Mussels	\N	100g	\N	86	12	3.7	2.2	0	0	proteins	{Pure:Mussels,TYPE:gram}	t	2025-10-03 22:35:18.494	2025-10-03 22:44:01.224
cmgbfa1y301ac8igvgkksm0k0	Oysters	\N	100g	\N	68	7	4	2.5	0	0	proteins	{Pure:Oysters,TYPE:gram}	t	2025-10-03 22:35:18.748	2025-10-03 22:44:01.306
cmgbfa22s01ad8igvsf02v657	Scallops	\N	100g	\N	69	12	2.4	0.8	0	0	proteins	{Pure:Scallops,TYPE:gram}	t	2025-10-03 22:35:18.916	2025-10-03 22:44:01.389
cmgbfa27801ae8igvt5hendh0	Clams	\N	100g	\N	86	14	2.6	1.7	0	0	proteins	{Pure:Clams,TYPE:gram}	t	2025-10-03 22:35:19.076	2025-10-03 22:44:01.499
cmgbfa2cr01af8igv2ugxlxal	Squid	\N	100g	\N	92	16	3	1.4	0	0	proteins	{Pure:Squid,TYPE:gram}	t	2025-10-03 22:35:19.276	2025-10-03 22:44:01.586
cmgbfa2u101ag8igv8ckousta	Octopus	\N	100g	\N	82	15	2.2	1	0	0	proteins	{Pure:Octopus,TYPE:gram}	t	2025-10-03 22:35:19.897	2025-10-03 22:44:01.677
cmgbfa35t01ai8igv1r5zljdm	Lobster Tail	\N	100g	\N	89	19	0	0.9	0	0	proteins	{"Pure:Lobster Tail",TYPE:gram}	t	2025-10-03 22:35:20.321	2025-10-03 22:44:01.887
cmgbf9ylq019q8igv90qdog9i	Turkey Breast	Piept de Curcan	100g	\N	135	30	0	1	0	0	proteins	{"Pure:Turkey Breast",TYPE:gram}	t	2025-10-03 22:35:14.415	2025-10-09 08:03:16.43
cmgbfa3b301aj8igvt0wp55r0	Venison	\N	100g	\N	158	30	0	3.2	0	0	proteins	{Pure:Venison,TYPE:gram}	t	2025-10-03 22:35:20.512	2025-10-03 22:44:02.027
cmgbfa3gk01ak8igvts2yjvfo	Rabbit	\N	100g	\N	173	33	0	3.5	0	0	proteins	{Pure:Rabbit,TYPE:gram}	t	2025-10-03 22:35:20.709	2025-10-03 22:44:02.102
cmgbfa3mn01al8igvysr00om6	Bison	\N	100g	\N	143	28	0	2.4	0	0	proteins	{Pure:Bison,TYPE:gram}	t	2025-10-03 22:35:20.928	2025-10-03 22:44:02.187
\.


--
-- Data for Name: launch_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.launch_notifications (id, name, email, interests, "createdAt", "updatedAt") FROM stdin;
cmgi62fne0000ezec8na4jnvr	Chiel	chiel@improve.onl	{nutritionPlans,onlineCommunity,recipes}	2025-10-08 15:51:49.947	2025-10-08 16:35:02.41
\.


--
-- Data for Name: nutrition_calculations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.nutrition_calculations (id, "customerId", "customerName", gender, age, height, weight, "activityLevel", bmr, "maintenanceCalories", protein, carbs, fat, "createdAt") FROM stdin;
cmge2nyhz002y87gy50fkb5uq	cmg40s3t400016reaj691t59r	Dragomir Ana Maria	female	26	165	50	moderate	1240.25	1922.3875	110	250	53	2025-10-05 19:05:30.915
cmgh1b0m4006i89gxyzo0f7q2	cmg72xn1g003sfofh52suc9zq	Andreea Popescu 	female	27	161	65.25	moderate	1362.75	2112.2625	144	252	59	2025-10-07 20:50:46.043
cmgnjvdbi0003dybzaqkhbv6g	cmg3zc6kf0002c2fkaq5c5a96	Leca Georgiana	female	27	152	48	moderate	1134	1757.7	106	224	49	2025-10-12 10:17:05.705
cmgqoreqi0000jx0403y8kckp	cmgaxpzcq00039reajc2azfrb	Chiel	male	32	192	88	moderate	1925	2983.75	194	365	83	2025-10-14 14:57:17.57
cmgsftqbi0000l804mcb891v6	cmg8zzacg000093gx865cl2xm	Creata Alexandra 	female	26	163	57	moderate	1297.75	2011.5125	125	252	56	2025-10-15 20:22:41.698
\.


--
-- Data for Name: nutrition_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.nutrition_plans (id, name, goal, calories, protein, carbs, fat, meals, clients, status, description, "weekMenu", created, "lastUsed", "createdAt", "updatedAt", "userId") FROM stdin;
cmgh1c6jq006j89gxlq1h2eo8	Andreea Popescu  - Weight loss (Middle Carbs)	weight-loss	1612	101	181	54	6	0	active	Personalized nutrition plan for Andreea Popescu  based on calculation. Goal: Weight loss with middle carb approach (45% carbs, 25% protein, 30% fat).	{"friday": {"lunch": "120 cmgbf5lya017o8igvoceezzrx|Basmati Rice, 150 cmgbf5hzc016d8igvygu6cm2l|Broccoli, 130 cmgbf9wah019b8igve2tpm0s3|Chicken Thigh", "dinner": "150 cmgbf9u22018z8igvpdnfn518|Ground Beef, 100 cmgbf5ind016l8igv1a70d7no|Lettuce, 200 cmgbf5jda016u8igvzgck353p|Sweet Potato", "breakfast": "2 cmgbfewgp01b78igv3zsoydrf|1 Egg, 50 cmgbf5i3r016e8igvfc3sfn5n|Spinach, 50 cmgbf5i8q016g8igv11v4u9e7|Tomato, 50 cmgbf5hwz016c8igv0rqomyyz|Avocado, 1 cmgbfeyyn01bl8igvuzmjc8ut|1 Slice Whole Wheat Bread, 1 cmgbff0kr01bv8igv4c0ryomj|1 Tablespoon Olive Oil", "evening-snack": "", "morning-snack": "1 cmgbfetk801ap8igvx0ada7pw|1 Banana", "afternoon-snack": ""}, "monday": {"lunch": "100 cmgbf5jgf016v8igv5viv7qkz|Chicken Breast, 150 cmgbf5jda016u8igvzgck353p|Sweet Potato, 100 cmgh1z1g6006n89gxyv0eysti|Salad, 1 cmgbff0kr01bv8igv4c0ryomj|1 Tablespoon Olive Oil", "snack": "", "dinner": "200 cmgbf5lqo017l8igvlv95h82q|Whole Wheat Pasta, 70 cmgbf5jgf016v8igv5viv7qkz|Chicken Breast, 1 cmgbfev0c01ay8igvacojuah5|1 Carrot, 100 cmgh2a02h006o89gxm6nq7wof|Tomato sauce, 1 cmgbfevnl01b28igvwoc5cuh1|1 Onion, 1 cmgbff0kr01bv8igv4c0ryomj|1 Tablespoon Olive Oil", "breakfast": "2 cmgbfewgp01b78igv3zsoydrf|1 Egg, 38 cmgbf5hwz016c8igv0rqomyyz|Avocado, 1 cmgbfeyyn01bl8igvuzmjc8ut|1 Slice Whole Wheat Bread, 50 cmgbf5ktt017a8igvd05un12c|Cottage Cheese, 100 cmgbf5i8q016g8igv11v4u9e7|Tomato, 100 cmgbf5i3r016e8igvfc3sfn5n|Spinach", "evening-snack": "", "morning-snack": "", "afternoon-snack": "80 cmgbf5kqi01798igvv7l11gk0|Greek Yogurt, 50 cmgdx5a0100257sfkxb7tug2x|Raspberries"}, "sunday": {"lunch": "150 cmgbf9ylq019q8igv90qdog9i|Turkey Breast, 100 cmgbf5lsv017m8igvvmlnnmn5|White Rice, 100 cmgbf5hzc016d8igvygu6cm2l|Broccoli, 50 cmgbf5i63016f8igv6wor3yvl|Carrot, 50 cmgbf5ofu018j8igvc3dm9dgx|Paprika", "dinner": "200 cmgbf9yru019r8igvv90f8uwz|Cod Fillet, 100 cmgbf5iyw016p8igv48mjh4ih|Zucchini, 100 cmgbf5irz016n8igv5k7s9t64|Green Beans", "breakfast": "30 cmgbf5m55017q8igvy7wc0y0v|Oats, 200 cmge2u46d003287gywaub13sq|Almond milk, 50 cmgdxe3f500297sfk7gxjxpm2|Strawberries, 50 cmgdxdyl400287sfkijj00pag|Blueberries, 50 cmgdx5a0100257sfkxb7tug2x|Raspberries, 100 cmgbf5ghc015w8igv3bln5ooa|Banana, 10 cmgbf5nz2018d8igvpx48d6zr|Honey", "evening-snack": "", "morning-snack": "100 cmgbf5ktt017a8igvd05un12c|Cottage Cheese, 160 cmgbf5hwz016c8igv0rqomyyz|Avocado, 2 cmgh5qg91006s89gxiy8sei1d|Rice cake, 50 cmgbf5i8q016g8igv11v4u9e7|Tomato", "afternoon-snack": ""}, "tuesday": {"lunch": "130 cmgbf5jl0016x8igvpoesllv8|Salmon, 100 cmgbf5lsv017m8igvvmlnnmn5|White Rice, 100 cmgbf5hzc016d8igvygu6cm2l|Broccoli", "dinner": "100 cmgbf5js4016z8igvh2ey21of|Turkey, 100 cmgbf5ind016l8igv1a70d7no|Lettuce, 100 cmgbf5i8q016g8igv11v4u9e7|Tomato, 1 cmgbfevbn01b08igvwq383fhp|1 Cucumber, 170 cmgbf5m7h017r8igvaw5uouch|Potato", "breakfast": "30 cmgbf5m55017q8igvy7wc0y0v|Oats, 200 cmgbf5ko601788igv4oj8j1yy|Milk, 100 cmgbf5ghc015w8igv3bln5ooa|Banana, 50 cmgdxdyl400287sfkijj00pag|Blueberries, 10 cmgbf5mjo017v8igvdbpxa1qi|Almonds, 50 cmgdxe3f500297sfk7gxjxpm2|Strawberries, 10 cmgh2qo9l006p89gxswga5zs1|Coconut flakes", "evening-snack": "", "morning-snack": "80 cmgbf5ktt017a8igvd05un12c|Cottage Cheese, 90 cmgbf5hwz016c8igv0rqomyyz|Avocado, 1 cmgbfeytn01bk8igvam9vdygu|1 Slice White Bread", "afternoon-snack": ""}, "saturday": {"lunch": "100 cmgbf5jpp016y8igvs4jl1qkc|Tuna, 100 cmgbf5ind016l8igv1a70d7no|Lettuce, 80 cmgh6faoa006w89gxqq4i11ic|Corn, 100 cmgh5w459006u89gxq5it4ynd|Cooked beans, 50 cmgbf5ofu018j8igvc3dm9dgx|Paprika, 1 cmgbfevnl01b28igvwoc5cuh1|1 Onion", "dinner": "150 cmgbf9tlb018w8igvio3pcvdl|Ribeye Steak, 100 cmgbf5jda016u8igvzgck353p|Sweet Potato, 100 cmgbf5ind016l8igv1a70d7no|Lettuce, 1 cmgbff0kr01bv8igv4c0ryomj|1 Tablespoon Olive Oil", "breakfast": "50 cmgbf5ghc015w8igv3bln5ooa|Banana, 1 cmgbfewgp01b78igv3zsoydrf|1 Egg, 25 cmgbf5m55017q8igvy7wc0y0v|Oats, 15 cmgdx7ow300267sfkl6m7qfaf|Protein Powder, 10 cmgbf5k4f01738igv9bg7jnpm|Egg Whites, 1 cmgdxdtg600277sfkmczwvpn3|Baking Powder, 2 cmgbf5nki01888igvlx9t56nc|Coconut Oil, 25 cmgdxe3f500297sfk7gxjxpm2|Strawberries, 25 cmgdxdyl400287sfkijj00pag|Blueberries, 25 cmgdx5a0100257sfkxb7tug2x|Raspberries, 7 cmgdxe8aw002a7sfkfwiq36r7|Agave Syrup, 50 cmgbf5kqi01798igvv7l11gk0|Greek Yogurt", "evening-snack": "", "morning-snack": "", "afternoon-snack": "1 cmgbfetk801ap8igvx0ada7pw|1 Banana"}, "thursday": {"lunch": "80g Salmon, 200g Whole Wheat Pasta, 150g Broccoli", "dinner": {"ingredients": "80 cmgbf9yfs019p8igvliti5peu|Ground Turkey, 200 cmgh55yt7006r89gxvvpxdfo2|Mashed potato, 1 cmgbfevnl01b28igvwoc5cuh1|1 Onion, 2 cmgbfev0c01ay8igvacojuah5|1 Carrot", "cookingInstructions": ""}, "breakfast": "2 cmgbfewgp01b78igv3zsoydrf|1 Egg, 2 cmgbfey5n01bg8igvsoqp4dzj|1 Slice Cheese, 1 cmgbfeyyn01bl8igvuzmjc8ut|1 Slice Whole Wheat Bread", "evening-snack": "", "morning-snack": "", "afternoon-snack": "100 cmgbf5kqi01798igvv7l11gk0|Greek Yogurt, 50 cmgdxdyl400287sfkijj00pag|Blueberries, 50 cmgdxe3f500297sfk7gxjxpm2|Strawberries, 8 cmgbf5mjo017v8igvdbpxa1qi|Almonds"}, "wednesday": {"lunch": "100 cmgbf9wah019b8igve2tpm0s3|Chicken Thigh, 50 cmgbf5ind016l8igv1a70d7no|Lettuce, 50 cmgbf5ofu018j8igvc3dm9dgx|Paprika, 150 cmgbf5m7h017r8igvaw5uouch|Potato, 1 cmgbff0kr01bv8igv4c0ryomj|1 Tablespoon Olive Oil", "dinner": "100 cmgbf5jl0016x8igvpoesllv8|Salmon, 100 cmgbf5hzc016d8igvygu6cm2l|Broccoli, 150 cmgbf5jda016u8igvzgck353p|Sweet Potato", "breakfast": "50 cmgbf5ghc015w8igv3bln5ooa|Banana, 25 cmgbf5m55017q8igvy7wc0y0v|Oats, 15 cmgdx7ow300267sfkl6m7qfaf|Protein Powder, 10 cmgbf5k4f01738igv9bg7jnpm|Egg Whites, 1 cmgdxdtg600277sfkmczwvpn3|Baking Powder, 2 cmgbf5nki01888igvlx9t56nc|Coconut Oil, 25 cmgdxe3f500297sfk7gxjxpm2|Strawberries, 25 cmgdx5a0100257sfkxb7tug2x|Raspberries, 25 cmgdxdyl400287sfkijj00pag|Blueberries, 7 cmgdxe8aw002a7sfkfwiq36r7|Agave Syrup", "evening-snack": "", "morning-snack": "6 cmgbf5mjo017v8igvdbpxa1qi|Almonds, 200 cmgbf5kqi01798igvv7l11gk0|Greek Yogurt", "afternoon-snack": "1 cmgbfet9q01ao8igv9u7u3r3s|1 Apple"}}	2025-10-07 20:51:40.455	2025-10-07 20:51:40.455	2025-10-07 20:51:40.455	2025-10-08 22:54:03.144	\N
cmgnjxod20007dybzzwrut7mv	Leca Georgiana - Maintenance (Middle Carbs)	maintenance	1758	132	176	59	6	0	active	Personalized nutrition plan for Leca Georgiana based on calculation. Goal: Maintenance with middle carb approach (45% carbs, 25% protein, 30% fat).	{"friday": {"lunch": "130 g cmgbf5lmt017k8igv7jor2b3b|Pasta, 120 g cmgbf5jpp016y8igvs4jl1qkc|Tuna, 30 g cmgh5w459006u89gxq5it4ynd|Cooked beans, 50 g cmgbf5i8q016g8igv11v4u9e7|Tomato, 30 g cmgh6faoa006w89gxqq4i11ic|Corn, 10 g cmgbf5ni201878igvcqw98b27|Olive Oil", "dinner": "130 g cmgbf9ylq019q8igv90qdog9i|Turkey Breast, 120 g cmgbf5md1017t8igvvx7h8nfg|Bulgur, 100 g cmgbf5ind016l8igv1a70d7no|Lettuce, 10 g cmgbf5ni201878igvcqw98b27|Olive Oil, 50 g cmgbf5iyw016p8igv48mjh4ih|Zucchini, 30 g cmgbf5ofu018j8igvc3dm9dgx|Paprika, 100 g cmgbf5hwz016c8igv0rqomyyz|Avocado", "breakfast": "50 g cmgbf5ghc015w8igv3bln5ooa|Banana, 1 cmgbfewgp01b78igv3zsoydrf|1 Egg, 25 g cmgbf5m55017q8igvy7wc0y0v|Oats, 15 g cmgdx7ow300267sfkl6m7qfaf|Protein Powder, 10 g cmgbf5k4f01738igv9bg7jnpm|Egg Whites, 2 g cmgdxdtg600277sfkmczwvpn3|Baking Powder, 100 g cmgbf5kqi01798igvv7l11gk0|Greek Yogurt, 25 g cmgdxe3f500297sfk7gxjxpm2|Strawberries, 25 g cmgdx5a0100257sfkxb7tug2x|Raspberries, 25 g cmgdxdyl400287sfkijj00pag|Blueberries, 7 g cmgdxe8aw002a7sfkfwiq36r7|Agave Syrup, 10 g cmgbf5mjo017v8igvdbpxa1qi|Almonds", "evening-snack": "", "morning-snack": "1 cmgbfetk801ap8igvx0ada7pw|1 Banana", "afternoon-snack": ""}, "monday": {"lunch": "150 cmgbf5jgf016v8igv5viv7qkz|Chicken Breast, 200 cmgbf5jda016u8igvzgck353p|Sweet Potato, 100 cmgbf5ind016l8igv1a70d7no|Lettuce, 100 cmgbf5i8q016g8igv11v4u9e7|Tomato, 5 cmgbf5ni201878igvcqw98b27|Olive Oil, 80 cmgbf5hwz016c8igv0rqomyyz|Avocado", "dinner": "150 cmgbf5jl0016x8igvpoesllv8|Salmon, 120 cmgbf5lsv017m8igvvmlnnmn5|White Rice", "breakfast": "2 cmgbfewgp01b78igv3zsoydrf|1 Egg, 100 cmgbf5ktt017a8igvd05un12c|Cottage Cheese, 50 cmgbf5i8q016g8igv11v4u9e7|Tomato, 1 cmgbfeyyn01bl8igvuzmjc8ut|1 Slice Whole Wheat Bread", "evening-snack": "", "morning-snack": "1 cmgbfetk801ap8igvx0ada7pw|1 Banana", "afternoon-snack": "100 cmgbf5kqi01798igvv7l11gk0|Greek Yogurt, 100 cmgdxdyl400287sfkijj00pag|Blueberries, 8 cmgbf5mjo017v8igvdbpxa1qi|Almonds"}, "sunday": {"lunch": "160 g cmgbf9wvf019f8igvs1ycu51s|Ground Chicken, 50 g cmgbf5ihw016j8igv1on3vlk2|Onion, 50 g cmgbf5m7h017r8igvaw5uouch|Potato, 1 cmgbfev0c01ay8igvacojuah5|1 Carrot, 1 cmgbfewgp01b78igv3zsoydrf|1 Egg, 1 g cmgbf5o5x018f8igvq01av7e5|Salt, 170 g cmgh55yt7006r89gxvvpxdfo2|Mashed potato, 5 g cmgbf5l7d017f8igvuvs0btbr|Butter, 30 g cmgbf5ko601788igv4oj8j1yy|Milk", "dinner": "100 g cmgbf9tlb018w8igvio3pcvdl|Ribeye Steak, 150 g cmgbf5jda016u8igvzgck353p|Sweet Potato, 100 g cmgbf5ind016l8igv1a70d7no|Lettuce, 5 g cmgbf5ni201878igvcqw98b27|Olive Oil, 30 g cmgh2a02h006o89gxm6nq7wof|Tomato sauce, 1 cmgbfevbn01b08igvwq383fhp|1 Cucumber, 10 g cmgbf5l7d017f8igvuvs0btbr|Butter", "breakfast": "2 cmgbfewgp01b78igv3zsoydrf|1 Egg, 10 g cmgbf5l2q017d8igvuchn7lwk|Feta Cheese, 30 g cmgbf5i8q016g8igv11v4u9e7|Tomato, 2 cmgbfeyyn01bl8igvuzmjc8ut|1 Slice Whole Wheat Bread, 10 g cmgbf9vw501998igvsnozazko|Bacon", "evening-snack": "", "morning-snack": "100 g cmgbf5ghc015w8igv3bln5ooa|Banana", "afternoon-snack": "150 g cmgbf5kqi01798igvv7l11gk0|Greek Yogurt, 25 g cmgdxe3f500297sfk7gxjxpm2|Strawberries, 25 g cmgdxdyl400287sfkijj00pag|Blueberries, 25 g cmgdx5a0100257sfkxb7tug2x|Raspberries, 8 g cmgbf5n5o01838igvez6o0fny|Pumpkin Seeds"}, "tuesday": {"lunch": "150 cmgbf9wah019b8igve2tpm0s3|Chicken Thigh, 100 cmgbf5ind016l8igv1a70d7no|Lettuce, 1 cmgbff0kr01bv8igv4c0ryomj|1 Tablespoon Olive Oil, 50 cmgbf5ofu018j8igvc3dm9dgx|Paprika", "dinner": "170 cmgbf5jgf016v8igv5viv7qkz|Chicken Breast, 180 cmgbf5lmt017k8igv7jor2b3b|Pasta, 5 cmgbf5ni201878igvcqw98b27|Olive Oil, 100 cmgh2a02h006o89gxm6nq7wof|Tomato sauce, 1 cmgbfev0c01ay8igvacojuah5|1 Carrot, 1 cmgbfevnl01b28igvwoc5cuh1|1 Onion", "breakfast": "30 cmgbf5m55017q8igvy7wc0y0v|Oats, 250 cmge2u46d003287gywaub13sq|Almond milk, 10 cmgbf5mjo017v8igvdbpxa1qi|Almonds, 50 cmgdxdyl400287sfkijj00pag|Blueberries, 10 cmgbf5n5o01838igvez6o0fny|Pumpkin Seeds, 1 cmgbfetk801ap8igvx0ada7pw|1 Banana", "evening-snack": "", "morning-snack": "200 cmgbf5hui016b8igvxxokr18e|Pineapple", "afternoon-snack": ""}, "saturday": {"lunch": "200 g cmgbf5jgf016v8igv5viv7qkz|Chicken Breast, 120 g cmgbf5lsv017m8igvvmlnnmn5|White Rice, 100 g cmgbf5ind016l8igv1a70d7no|Lettuce, 5 g cmgbf5ni201878igvcqw98b27|Olive Oil, 1 cmgbfevbn01b08igvwq383fhp|1 Cucumber, 30 g cmgbf5i8q016g8igv11v4u9e7|Tomato", "dinner": "120 g cmgbf5lmt017k8igv7jor2b3b|Pasta, 70 g cmgbf9u22018z8igvpdnfn518|Ground Beef, 50 g cmgh2a02h006o89gxm6nq7wof|Tomato sauce, 1 cmgbfevnl01b28igvwoc5cuh1|1 Onion, 1 cmgbfev0c01ay8igvacojuah5|1 Carrot, 30 g cmgbf5ofu018j8igvc3dm9dgx|Paprika, 5 g cmgbf5ni201878igvcqw98b27|Olive Oil", "breakfast": "25 g cmgbf5m55017q8igvy7wc0y0v|Oats, 200 ml cmge2u46d003287gywaub13sq|Almond milk, 70 g cmgbf5ghc015w8igv3bln5ooa|Banana, 25 g cmgdxe3f500297sfk7gxjxpm2|Strawberries, 25 g cmgdxdyl400287sfkijj00pag|Blueberries, 25 g cmgdx5a0100257sfkxb7tug2x|Raspberries, 8 g cmgbf5mjo017v8igvdbpxa1qi|Almonds, 10 g cmgh2qo9l006p89gxswga5zs1|Coconut flakes", "evening-snack": "", "morning-snack": "", "afternoon-snack": "150 g cmgbf5ktt017a8igvd05un12c|Cottage Cheese, 40 g cmgbf5hwz016c8igv0rqomyyz|Avocado, 2 g cmgh5qg91006s89gxiy8sei1d|Rice cake"}, "thursday": {"lunch": "200 cmgbf9yru019r8igvv90f8uwz|Cod Fillet, 100 cmgbf5iyw016p8igv48mjh4ih|Zucchini, 150 cmgbf5lya017o8igvoceezzrx|Basmati Rice, 70 cmgbf5ofu018j8igvc3dm9dgx|Paprika", "dinner": "180 cmgbf9uv601948igvbvcodjtm|Pork Tenderloin, 180 cmgbf5m7h017r8igvaw5uouch|Potato, 8 cmgbf5ni201878igvcqw98b27|Olive Oil", "breakfast": "2 cmgbfewgp01b78igv3zsoydrf|1 Egg, 50 cmgbf5l2q017d8igvuchn7lwk|Feta Cheese, 1 cmgbfevbn01b08igvwq383fhp|1 Cucumber, 1 cmgbfeyyn01bl8igvuzmjc8ut|1 Slice Whole Wheat Bread, 100 cmgbf5hwz016c8igv0rqomyyz|Avocado", "evening-snack": "", "morning-snack": "1 cmgbfetk801ap8igvx0ada7pw|1 Banana", "afternoon-snack": ""}, "wednesday": {"lunch": "200 cmgbf9ylq019q8igv90qdog9i|Turkey Breast, 250 cmgbf5m7h017r8igvaw5uouch|Potato, 100 cmgbf5ind016l8igv1a70d7no|Lettuce, 10 cmgbf5ni201878igvcqw98b27|Olive Oil, 150 cmgbf5hzc016d8igvygu6cm2l|Broccoli", "dinner": "120 cmgbf9u22018z8igvpdnfn518|Ground Beef, 70 cmgbf5lh5017i8igvv62s2g2a|White Bread, 10 cmgbf5ind016l8igv1a70d7no|Lettuce, 30 cmgbf5i8q016g8igv11v4u9e7|Tomato, 20 cmgbf5kxa017b8igv2gv8aqbz|Cheddar Cheese, 10 cmgh2a02h006o89gxm6nq7wof|Tomato sauce, 200 cmgbf5jda016u8igvzgck353p|Sweet Potato", "breakfast": "2 cmgbfewgp01b78igv3zsoydrf|1 Egg, 20 cmgbf5kzp017c8igv7lpg6oqf|Mozzarella, 30 cmgbf5i3r016e8igvfc3sfn5n|Spinach, 50 cmgbf5i8q016g8igv11v4u9e7|Tomato, 30 cmgbf5hwz016c8igv0rqomyyz|Avocado, 2 cmgh5qg91006s89gxiy8sei1d|Rice cake", "evening-snack": "", "morning-snack": "", "afternoon-snack": "1 cmgbfet9q01ao8igv9u7u3r3s|1 Apple"}}	2025-10-12 10:18:53.463	2025-10-12 10:18:53.463	2025-10-12 10:18:53.463	2025-10-15 20:18:56.081	\N
cmgsfv1i10001l8047reh2gkl	Creata Alexandra  - Weight loss (Middle Carbs)	weight-loss	1512	113	151	50	6	0	active	Personalized nutrition plan for Creata Alexandra  based on calculation. Goal: Weight loss with middle carb approach (45% carbs, 25% protein, 30% fat).	{"friday": {"lunch": "100 g cmgbf5lmt017k8igv7jor2b3b|Pasta, 80 g cmgbf5jpp016y8igvs4jl1qkc|Tuna, 20 g cmgh5w459006u89gxq5it4ynd|Cooked beans, 50 g cmgbf5i8q016g8igv11v4u9e7|Tomato, 30 g cmgh6faoa006w89gxqq4i11ic|Corn, 5 g cmgbf5ni201878igvcqw98b27|Olive Oil", "dinner": "100 g cmgbf9ylq019q8igv90qdog9i|Turkey Breast, 70 g cmgbf5md1017t8igvvx7h8nfg|Bulgur, 100 g cmgbf5ind016l8igv1a70d7no|Lettuce, 10 g cmgbf5ni201878igvcqw98b27|Olive Oil, 50 g cmgbf5iyw016p8igv48mjh4ih|Zucchini, 30 g cmgbf5ofu018j8igvc3dm9dgx|Paprika, 90 g cmgbf5hwz016c8igv0rqomyyz|Avocado", "breakfast": "50 g cmgbf5ghc015w8igv3bln5ooa|Banana, 1 cmgbfewgp01b78igv3zsoydrf|1 Egg, 25 g cmgbf5m55017q8igvy7wc0y0v|Oats, 15 g cmgdx7ow300267sfkl6m7qfaf|Protein Powder, 10 g cmgbf5k4f01738igv9bg7jnpm|Egg Whites, 2 g cmgdxdtg600277sfkmczwvpn3|Baking Powder, 100 g cmgbf5kqi01798igvv7l11gk0|Greek Yogurt, 25 g cmgdxe3f500297sfk7gxjxpm2|Strawberries, 25 g cmgdx5a0100257sfkxb7tug2x|Raspberries, 25 g cmgdxdyl400287sfkijj00pag|Blueberries, 7 g cmgdxe8aw002a7sfkfwiq36r7|Agave Syrup, 10 g cmgbf5mjo017v8igvdbpxa1qi|Almonds", "evening-snack": "", "morning-snack": "1 cmgbfetk801ap8igvx0ada7pw|1 Banana", "afternoon-snack": ""}, "monday": {"lunch": "100 cmgbf5jgf016v8igv5viv7qkz|Chicken Breast, 200 cmgbf5jda016u8igvzgck353p|Sweet Potato, 100 cmgbf5ind016l8igv1a70d7no|Lettuce, 30 cmgbf5i8q016g8igv11v4u9e7|Tomato, 5 cmgbf5ni201878igvcqw98b27|Olive Oil, 50 cmgbf5hwz016c8igv0rqomyyz|Avocado", "dinner": "150 cmgbf5jl0016x8igvpoesllv8|Salmon, 120 cmgbf5lsv017m8igvvmlnnmn5|White Rice", "breakfast": "2 cmgbfewgp01b78igv3zsoydrf|1 Egg, 50 cmgbf5ktt017a8igvd05un12c|Cottage Cheese, 50 cmgbf5i8q016g8igv11v4u9e7|Tomato, 1 cmgbfeyyn01bl8igvuzmjc8ut|1 Slice Whole Wheat Bread", "evening-snack": "", "morning-snack": "1 cmgbfetk801ap8igvx0ada7pw|1 Banana", "afternoon-snack": "100 cmgbf5kqi01798igvv7l11gk0|Greek Yogurt, 100 cmgdxdyl400287sfkijj00pag|Blueberries, 8 cmgbf5mjo017v8igvdbpxa1qi|Almonds"}, "sunday": {"lunch": "100 g cmgbf9wvf019f8igvs1ycu51s|Ground Chicken, 50 g cmgbf5ihw016j8igv1on3vlk2|Onion, 50 g cmgbf5m7h017r8igvaw5uouch|Potato, 1 cmgbfev0c01ay8igvacojuah5|1 Carrot, 1 cmgbfewgp01b78igv3zsoydrf|1 Egg, 1 g cmgbf5o5x018f8igvq01av7e5|Salt, 150 g cmgh55yt7006r89gxvvpxdfo2|Mashed potato, 3 g cmgbf5l7d017f8igvuvs0btbr|Butter, 20 g cmgbf5ko601788igv4oj8j1yy|Milk", "dinner": "100 g cmgbf9tlb018w8igvio3pcvdl|Ribeye Steak, 150 g cmgbf5jda016u8igvzgck353p|Sweet Potato, 100 g cmgbf5ind016l8igv1a70d7no|Lettuce, 5 g cmgbf5ni201878igvcqw98b27|Olive Oil, 30 g cmgh2a02h006o89gxm6nq7wof|Tomato sauce, 1 cmgbfevbn01b08igvwq383fhp|1 Cucumber, 5 g cmgbf5l7d017f8igvuvs0btbr|Butter", "breakfast": "2 cmgbfewgp01b78igv3zsoydrf|1 Egg, 10 g cmgbf5l2q017d8igvuchn7lwk|Feta Cheese, 30 g cmgbf5i8q016g8igv11v4u9e7|Tomato, 2 cmgbfeyyn01bl8igvuzmjc8ut|1 Slice Whole Wheat Bread, 5 g cmgbf9vw501998igvsnozazko|Bacon", "evening-snack": "", "morning-snack": "100 g cmgbf5ghc015w8igv3bln5ooa|Banana", "afternoon-snack": "150 g cmgbf5kqi01798igvv7l11gk0|Greek Yogurt, 25 g cmgdxe3f500297sfk7gxjxpm2|Strawberries, 25 g cmgdxdyl400287sfkijj00pag|Blueberries, 25 g cmgdx5a0100257sfkxb7tug2x|Raspberries, 6 g cmgbf5n5o01838igvez6o0fny|Pumpkin Seeds"}, "tuesday": {"lunch": "100 g cmgbf9wah019b8igve2tpm0s3|Chicken Thigh, 50 g cmgbf5ofu018j8igvc3dm9dgx|Paprika, 100 g cmgbf5ind016l8igv1a70d7no|Lettuce, 5 g cmgbf5ni201878igvcqw98b27|Olive Oil", "dinner": "170 cmgbf5jgf016v8igv5viv7qkz|Chicken Breast, 150 cmgbf5lmt017k8igv7jor2b3b|Pasta, 5 cmgbf5ni201878igvcqw98b27|Olive Oil, 100 cmgh2a02h006o89gxm6nq7wof|Tomato sauce, 1 cmgbfev0c01ay8igvacojuah5|1 Carrot, 1 cmgbfevnl01b28igvwoc5cuh1|1 Onion", "breakfast": "30 cmgbf5m55017q8igvy7wc0y0v|Oats, 250 cmge2u46d003287gywaub13sq|Almond milk, 8 cmgbf5mjo017v8igvdbpxa1qi|Almonds, 50 cmgdxdyl400287sfkijj00pag|Blueberries, 6 cmgbf5n5o01838igvez6o0fny|Pumpkin Seeds, 1 cmgbfetk801ap8igvx0ada7pw|1 Banana", "evening-snack": "", "morning-snack": "100 cmgbf5hui016b8igvxxokr18e|Pineapple", "afternoon-snack": ""}, "saturday": {"lunch": "160 g cmgbf5jgf016v8igv5viv7qkz|Chicken Breast, 70 g cmgbf5lsv017m8igvvmlnnmn5|White Rice, 100 g cmgbf5ind016l8igv1a70d7no|Lettuce, 5 g cmgbf5ni201878igvcqw98b27|Olive Oil, 1 cmgbfevbn01b08igvwq383fhp|1 Cucumber, 30 g cmgbf5i8q016g8igv11v4u9e7|Tomato", "dinner": "100 g cmgbf5lmt017k8igv7jor2b3b|Pasta, 60 g cmgbf9u22018z8igvpdnfn518|Ground Beef, 50 g cmgh2a02h006o89gxm6nq7wof|Tomato sauce, 1 cmgbfevnl01b28igvwoc5cuh1|1 Onion, 1 cmgbfev0c01ay8igvacojuah5|1 Carrot, 30 g cmgbf5ofu018j8igvc3dm9dgx|Paprika, 3 g cmgbf5ni201878igvcqw98b27|Olive Oil", "breakfast": "25 g cmgbf5m55017q8igvy7wc0y0v|Oats, 200 ml cmge2u46d003287gywaub13sq|Almond milk, 70 g cmgbf5ghc015w8igv3bln5ooa|Banana, 25 g cmgdxe3f500297sfk7gxjxpm2|Strawberries, 25 g cmgdxdyl400287sfkijj00pag|Blueberries, 25 g cmgdx5a0100257sfkxb7tug2x|Raspberries, 8 g cmgbf5mjo017v8igvdbpxa1qi|Almonds, 10 g cmgh2qo9l006p89gxswga5zs1|Coconut flakes", "evening-snack": "", "morning-snack": "", "afternoon-snack": "150 g cmgbf5ktt017a8igvd05un12c|Cottage Cheese, 20 g cmgbf5hwz016c8igv0rqomyyz|Avocado, 2 g cmgh5qg91006s89gxiy8sei1d|Rice cake"}, "thursday": {"lunch": "150 cmgbf9yru019r8igvv90f8uwz|Cod Fillet, 100 cmgbf5iyw016p8igv48mjh4ih|Zucchini, 130 cmgbf5lya017o8igvoceezzrx|Basmati Rice, 70 cmgbf5ofu018j8igvc3dm9dgx|Paprika", "dinner": "180 cmgbf9uv601948igvbvcodjtm|Pork Tenderloin, 150 cmgbf5m7h017r8igvaw5uouch|Potato, 8 cmgbf5ni201878igvcqw98b27|Olive Oil", "breakfast": "2 cmgbfewgp01b78igv3zsoydrf|1 Egg, 20 cmgbf5l2q017d8igvuchn7lwk|Feta Cheese, 1 cmgbfevbn01b08igvwq383fhp|1 Cucumber, 1 cmgbfeyyn01bl8igvuzmjc8ut|1 Slice Whole Wheat Bread, 80 cmgbf5hwz016c8igv0rqomyyz|Avocado", "evening-snack": "", "morning-snack": "1 cmgbfetk801ap8igvx0ada7pw|1 Banana", "afternoon-snack": ""}, "wednesday": {"lunch": "150 cmgbf9ylq019q8igv90qdog9i|Turkey Breast, 150 cmgbf5m7h017r8igvaw5uouch|Potato, 100 cmgbf5ind016l8igv1a70d7no|Lettuce, 5 cmgbf5ni201878igvcqw98b27|Olive Oil, 150 cmgbf5hzc016d8igvygu6cm2l|Broccoli", "dinner": "120 cmgbf9u22018z8igvpdnfn518|Ground Beef, 70 cmgbf5lh5017i8igvv62s2g2a|White Bread, 10 cmgbf5ind016l8igv1a70d7no|Lettuce, 30 cmgbf5i8q016g8igv11v4u9e7|Tomato, 20 cmgbf5kxa017b8igv2gv8aqbz|Cheddar Cheese, 10 cmgh2a02h006o89gxm6nq7wof|Tomato sauce, 200 cmgbf5jda016u8igvzgck353p|Sweet Potato", "breakfast": "2 cmgbfewgp01b78igv3zsoydrf|1 Egg, 10 cmgbf5kzp017c8igv7lpg6oqf|Mozzarella, 30 cmgbf5i3r016e8igvfc3sfn5n|Spinach, 50 cmgbf5i8q016g8igv11v4u9e7|Tomato, 20 cmgbf5hwz016c8igv0rqomyyz|Avocado, 2 cmgh5qg91006s89gxiy8sei1d|Rice cake", "evening-snack": "", "morning-snack": "", "afternoon-snack": "1 cmgbfet9q01ao8igv9u7u3r3s|1 Apple"}}	2025-10-15 20:23:42.937	2025-10-15 20:23:42.937	2025-10-15 20:23:42.937	2025-10-15 21:00:36.969	\N
\.


--
-- Data for Name: online_coaching_registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.online_coaching_registrations (id, name, email, phone, program, status, "startDate", "endDate", notes, interests, "userId", "createdAt", "updatedAt") FROM stdin;
cmgi85muz0000d9fahro7nxvs	Test User	test@example.com	+40 123 456 789	Online Coaching	pending	\N	\N	Test registration created via script	{weight-loss,muscle-gain}	\N	2025-10-08 16:50:18.425	2025-10-08 16:50:18.425
cmgi8fo130001d9fa25p48hw5	Test User Direct	testdirect@example.com	+40 111 222 333	Online Coaching	pending	\N	\N	Test from direct API call	{weight-loss}	\N	2025-10-08 16:58:06.459	2025-10-08 16:58:06.459
cmgi8nl4b0002d9fauqqhoytm	Direct Test User	direct@test.com	+40 999 888 777	Online Coaching	pending	\N	\N	Direct database test	{weight-loss}	\N	2025-10-08 17:04:15.98	2025-10-08 17:04:15.98
cmgil3tgq0000endy1sads28i	Mihaela test	tets@test.com	\N	Online Coaching	pending	\N	\N	Interested in: nutritionPlans	{nutritionPlans}	\N	2025-10-08 22:52:48.747	2025-10-08 22:52:48.747
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, "customerId", amount, "paymentMethod", "paymentType", status, notes, "paymentDate", "createdAt", "updatedAt") FROM stdin;
cmg5onfuv0007cbgyvzcnrlx2	cmg3zc6kf0002c2fkaq5c5a96	400	cash	monthly	completed		2025-09-29 00:00:00	2025-09-29 22:11:02.725	2025-09-29 22:11:02.725
cmg6kue870001dbfk6sza2kuo	cmg51euw20006bpec53j1e4bb	400	cash	full	completed		2025-09-30 00:00:00	2025-09-30 13:12:14.925	2025-09-30 13:12:14.925
cmg8cbke500039cfhajebpdyt	cmg5e74vy00029iflewdnp226	100	cash	full	completed		2025-10-01 00:00:00	2025-10-01 18:49:11.868	2025-10-01 18:49:11.868
cmg8cc5ec00059cfhqyce66x3	cmg5e83lx00039iflnfnqz261	50	cash	full	completed		2025-10-01 00:00:00	2025-10-01 18:49:39.093	2025-10-01 18:49:39.093
cmgezpz500002amea343405bb	cmg72xn1g003sfofh52suc9zq	400	cash	monthly	completed		2025-10-06 00:00:00	2025-10-06 10:30:52.386	2025-10-06 10:30:52.386
cmgf1s9wo000u6ofae2m396g5	cmg40s3t400016reaj691t59r	400	cash	monthly	completed		2025-10-06 00:00:00	2025-10-06 11:28:38.89	2025-10-06 11:28:38.89
cmggx5zgj000d80eu1grx8104	cmgeu9tgh0000dfdld8yohhuy	680	cash	monthly	completed		2025-10-07 00:00:00	2025-10-07 18:54:52.807	2025-10-07 18:54:52.807
cmggy04is001980eu8fz8ytia	cmg8zzacg000093gx865cl2xm	400	cash	monthly	completed		2025-10-07 00:00:00	2025-10-07 19:18:19.042	2025-10-07 19:18:19.042
cmgqllad90001i504ofnmyw8v	cmgh0mdii006f89gxl5ejkg3d	500	cash	full	completed		2025-10-14 00:00:00	2025-10-14 13:28:33.21	2025-10-14 13:28:33.21
cmgqlncvj0003i504plwu22gz	cmgeufv4m0001dfdlqjcks11j	680	cash	monthly	completed		2025-10-14 00:00:00	2025-10-14 13:30:09.685	2025-10-14 13:30:09.685
\.


--
-- Data for Name: pricing_calculations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pricing_calculations (id, service, duration, frequency, discount, vat, "finalPrice", "includeNutritionPlan", "nutritionPlanCount", "customerId", "customerName", "createdAt") FROM stdin;
cmg3zlgk0005jc2fkeop38cld	Personal Training 1:1	12	3	20	21	1200	t	0	cmg3zc6kf0002c2fkaq5c5a96	Leca Georgiana	2025-09-28 17:41:53.809
cmg47g3eo0044ateb61zoyk5l	Personal Training 1:1	12	3	20	21	1200	f	0	cmg40s3t400016reaj691t59r	Dragomir Ana Maria	2025-09-28 21:21:40.356
cmg65zvhg0008cafp12j54k3t	Personal Training 1:1	4	3	20	21	400	f	0	cmg51euw20006bpec53j1e4bb	Georgiana Tomescu	2025-09-30 06:16:36.328
cmgb9dlx3000kapebvoekulf4	Personal Training 1:1	12	3	20	21	1200	f	0	cmg8zzacg000093gx865cl2xm	Creata Alexandra 	2025-10-03 19:50:06.903
cmgezm3ht0000ameau153y919	Personal Training 1:1	12	3	20	21	1200	f	0	cmg72xn1g003sfofh52suc9zq	Andreea Popescu 	2025-10-06 10:27:51.473
cmgf0bbhj00006ofaq5glymoi	Group Training	12	3	0	21	1640	t	1	cmgeu9tgh0000dfdld8yohhuy	Carmina Papa	2025-10-06 10:47:28.166
cmgf0bbwx00016ofaxtcb9buq	Group Training	12	3	0	21	1640	t	1	cmgeufv4m0001dfdlqjcks11j	Andreea Nuta	2025-10-06 10:47:28.785
cmgqljhfu0004l2045xx8i7wx	Personal Training 1:1	4	3	0	21	500	f	0	cmgh0mdii006f89gxl5ejkg3d	Valentina Milos	2025-10-14 13:27:08.979
\.


--
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipe_ingredients (id, "recipeId", name, quantity, unit, "exists", "availableInApi", "apiMatch", "createdAt", "updatedAt") FROM stdin;
cmge1h5xz002h87gyfpfo4h2w	cmgdvskmu00047sfkhe6d31wi	1 Banana	0.5	piece	t	f	\N	2025-10-05 18:32:14.424	2025-10-05 18:32:14.424
cmge1h5y0002i87gy9144n1sf	cmgdvskmu00047sfkhe6d31wi	1 Egg	1	piece	t	f	\N	2025-10-05 18:32:14.424	2025-10-05 18:32:14.424
cmge1h5y0002j87gyn7sbcaqr	cmgdvskmu00047sfkhe6d31wi	Oats	25	g	t	f	\N	2025-10-05 18:32:14.424	2025-10-05 18:32:14.424
cmge1h5y0002k87gy7mv4tkiq	cmgdvskmu00047sfkhe6d31wi	Protein Powder	1	scoop	t	f	\N	2025-10-05 18:32:14.424	2025-10-05 18:32:14.424
cmge1h5y0002l87gybbzapusc	cmgdvskmu00047sfkhe6d31wi	Egg Whites	10	ml	t	f	\N	2025-10-05 18:32:14.424	2025-10-05 18:32:14.424
cmge1h5y0002m87gynrd75jit	cmgdvskmu00047sfkhe6d31wi	Baking Powder	0.25	tsp	t	f	\N	2025-10-05 18:32:14.424	2025-10-05 18:32:14.424
cmge1h5y0002n87gy87k5qunp	cmgdvskmu00047sfkhe6d31wi	Coconut Oil	0.5	tsp	t	f	\N	2025-10-05 18:32:14.424	2025-10-05 18:32:14.424
cmge1h5y0002o87gy5zssou6o	cmgdvskmu00047sfkhe6d31wi	Strawberries	25	g	t	f	\N	2025-10-05 18:32:14.424	2025-10-05 18:32:14.424
cmge1h5y0002p87gybhxj2bo7	cmgdvskmu00047sfkhe6d31wi	Raspberries	25	g	t	f	\N	2025-10-05 18:32:14.424	2025-10-05 18:32:14.424
cmge1h5y0002q87gy2gx71fr9	cmgdvskmu00047sfkhe6d31wi	Blueberries	25	g	t	f	\N	2025-10-05 18:32:14.424	2025-10-05 18:32:14.424
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipes (id, name, description, "prepTime", servings, instructions, "totalCalories", "totalProtein", "totalCarbs", "totalFat", status, "createdAt", "updatedAt") FROM stdin;
cmgdvskmu00047sfkhe6d31wi	Protein Pancakes	High-protein pancakes perfect for breakfast	10	1	1. Blend the banana, egg, oats, protein powder, egg whites, and baking powder until smooth.\n2. Heat a non-stick pan lightly greased with coconut oil or spray.\n3. Pour small portions of the batter — about 5–6 pancakes.\n4. Cook over medium heat for 1–2 minutes on each side, until golden.\n5. Serve warm with your favorite toppings.	332.515	28.115	40.2725	8.77	active	2025-10-05 15:53:08.982	2025-10-05 18:32:13.893
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, name, "basePrice", description, "createdAt", "updatedAt") FROM stdin;
personal-training-1-1	Personal Training 1:1	50	1-on-1 personal training session	2025-09-28 17:34:41.077	2025-09-28 17:34:41.077
\.


--
-- Data for Name: todos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.todos (id, title, description, priority, deadline, completed, "completedAt", "createdAt", "updatedAt", "userId") FROM stdin;
cmg52jjig000798er406dbsej	Test todo	Test description	medium	\N	f	\N	2025-09-29 11:52:09.353	2025-09-29 11:52:09.353	cmg40s3t400016reaj691t59r
cmg52juqy000998erdou8yp7y	Test	Chiel	medium	\N	f	\N	2025-09-29 11:52:23.914	2025-09-29 11:52:23.914	cmg40s3t400016reaj691t59r
cmgf0s2lf000h6ofaqptrywt7	Make pictures for Andreea Popescu	\N	high	2025-10-08 00:00:00	t	2025-10-09 15:38:28.549	2025-10-06 11:00:29.859	2025-10-09 15:38:28.626	cmg3zc6f00001c2fk7xcz8z9m
cmg5clx8b0001anfkjcdpkljd	Nail girl and her friend add to client	\N	medium	\N	t	2025-09-29 17:23:02.364	2025-09-29 16:33:56.603	2025-09-29 17:23:02.425	cmg3zc6f00001c2fk7xcz8z9m
cmg5c0sid0001ali9s4c8xymc	Add owner to clients	\N	medium	\N	t	2025-09-29 17:23:12.462	2025-09-29 16:17:30.709	2025-09-29 17:23:12.521	cmg3zc6f00001c2fk7xcz8z9m
cmg553jop00038afko2eqnm7y	Nutrition plan Georgiana Tomescu	\N	high	2025-09-29 00:00:00	t	2025-09-30 04:19:47.751	2025-09-29 13:03:41.929	2025-09-30 04:19:47.81	cmg3zc6f00001c2fk7xcz8z9m
cmg552jme00018afke55xx8gb	Nutrition plan Georgiana Leca	\N	high	2025-09-29 00:00:00	t	2025-09-30 04:19:52.584	2025-09-29 13:02:55.191	2025-09-30 04:19:52.643	cmg3zc6f00001c2fk7xcz8z9m
cmg61s26k000187hodfcw9xgl	Change the break times	I want to change the times from 14:30 to 14:00 and from 19:30 to 19:00.so the lunch break is for 1:30 hour and the second break is for 2 hours	medium	2025-09-30 00:00:00	t	2025-09-30 13:35:52.483	2025-09-30 04:18:33.357	2025-09-30 13:35:52.874	cmg3zc6f00001c2fk7xcz8z9m
cmg5i9s6m000390h3uyf13prq	Pricing calculator group price	\N	medium	\N	t	2025-09-30 13:35:59.772	2025-09-29 19:12:27.887	2025-09-30 13:36:00.056	cmg3zc6f00001c2fk7xcz8z9m
cmg5cmhaa0003anfkuxsxioun	Chiel have to make dual training function	\N	medium	\N	t	2025-09-30 13:36:05.199	2025-09-29 16:34:22.594	2025-09-30 13:36:05.445	cmg3zc6f00001c2fk7xcz8z9m
cmg61t6hl000387hos3q84uyb	Changing the pricing for the abonament	Adding the price for abonament with trainer	medium	2025-09-30 00:00:00	t	2025-10-01 19:53:38.647	2025-09-30 04:19:25.593	2025-10-01 19:53:38.712	cmg3zc6f00001c2fk7xcz8z9m
cmgbww7t80001dnjiu8ur6qa2	Paper doctor course	\N	high	2025-10-09 00:00:00	f	\N	2025-10-04 06:48:26.252	2025-10-04 06:48:26.252	cmg3zc6f00001c2fk7xcz8z9m
cmgbx1u270003dnjiizslojwr	Auto translate ro	\N	medium	\N	f	\N	2025-10-04 06:52:48.367	2025-10-04 06:52:48.367	cmg3zc6f00001c2fk7xcz8z9m
cmgcv2be40002affkxgrqiswm	Put website live so you can hang poster in the gym	\N	medium	\N	f	\N	2025-10-04 22:44:57.773	2025-10-04 22:44:57.773	cmg3zc6f00001c2fk7xcz8z9m
cmgcv2vsu0004affkbbu0ka2d	Intake website shows all times avaible	\N	medium	\N	f	\N	2025-10-04 22:45:24.222	2025-10-04 22:45:24.222	cmg3zc6f00001c2fk7xcz8z9m
cmg5i8zaf000190h3srl6fte1	Flyer add group sessions	Maximum 4	medium	\N	t	2025-10-04 22:45:37.526	2025-09-29 19:11:50.439	2025-10-04 22:45:37.729	cmg3zc6f00001c2fk7xcz8z9m
cmg5cn3bd0005anfknqxv86th	Schedule 1 session: Training type add	\N	medium	\N	t	2025-10-04 22:45:47.032	2025-09-29 16:34:51.145	2025-10-04 22:45:47.245	cmg3zc6f00001c2fk7xcz8z9m
cmgf0tizd000j6ofawrx7xjgb	Show the right training in schedule, standing now Training but must be workout from that day	\N	medium	\N	f	\N	2025-10-06 11:01:37.753	2025-10-06 11:01:37.753	cmg3zc6f00001c2fk7xcz8z9m
cmghxldnt0001c2edb16fyp2x	Sa schimb pauza	Valentina 13:00 -14:00\nMarti miercuri joi	high	2025-10-08 00:00:00	f	\N	2025-10-08 11:54:37.289	2025-10-08 11:54:37.289	cmg3zc6f00001c2fk7xcz8z9m
cmgi51x570001d6flk6xhcm3e	Training of Leca remove out of schedule	\N	medium	\N	f	\N	2025-10-08 15:23:26.348	2025-10-08 15:23:26.348	cmg3zc6f00001c2fk7xcz8z9m
\.


--
-- Data for Name: training_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.training_sessions (id, "customerId", date, "startTime", "endTime", type, status, notes, "createdAt", "updatedAt") FROM stdin;
cmg4726z90021ateb5eb8h742	cmg3zc6f00001c2fk7xcz8z9m	2025-09-29 00:00:00	09:00	10:00	own-training	completed		2025-09-28 21:10:51.862	2025-09-29 20:09:06.231
cmg418z4o000h6rea7ruwzh5a	cmg3zc6kf0002c2fkaq5c5a96	2025-09-29 00:00:00	10:30	11:30	1:1	completed		2025-09-28 18:28:10.585	2025-09-29 20:09:06.231
cmg471cmu000vateb8b9b2o9w	cmg3zc6kf0002c2fkaq5c5a96	2025-09-30 00:00:00	10:30	11:30	1:1	completed		2025-09-28 21:10:12.534	2025-09-30 11:13:00.393
cmg5eaihb00079iflq2mjfd2v	cmg5e74vy00029iflewdnp226	2025-09-30 00:00:00	19:30	20:30	1:1	completed		2025-09-29 17:21:03.504	2025-09-30 11:13:00.393
cmg51tkzo000abpecq0ra74hf	cmg51euw20006bpec53j1e4bb	2025-09-30 00:00:00	09:30	10:30	1:1	completed		2025-09-29 11:31:58.212	2025-09-30 11:13:00.393
cmg51u4xw000cbpectesumb4v	cmg51euw20006bpec53j1e4bb	2025-10-01 00:00:00	09:30	10:30	1:1	completed		2025-09-29 11:32:24.069	2025-10-01 17:15:00.023
cmg8c9tjm00019cfh5vcjxa9j	cmg5e83lx00039iflnfnqz261	2025-10-01 00:00:00	19:00	20:00	1:1	completed		2025-10-01 18:47:50.483	2025-10-02 08:50:51.446
cmg8ehnwt0001bxfljhanvae8	cmg3zc6f00001c2fk7xcz8z9m	2025-10-02 00:00:00	11:30	12:30	own-training	completed		2025-10-01 19:49:55.661	2025-10-02 08:50:51.446
cmg471y8g001xatebta9dg27x	cmg3zc6kf0002c2fkaq5c5a96	2025-10-02 00:00:00	10:30	11:30	1:1	completed		2025-09-28 21:10:40.528	2025-10-02 08:50:51.446
cmg51un1d000ebpec442ikccj	cmg51euw20006bpec53j1e4bb	2025-10-02 00:00:00	09:30	10:30	1:1	completed		2025-09-29 11:32:47.522	2025-10-02 08:50:51.446
cmg47dsy80029atebduqhzkjb	cmg40s3t400016reaj691t59r	2025-10-06 00:00:00	08:30	09:30	1:1	completed		2025-09-28 21:19:53.552	2025-10-08 06:06:57.552
cmggxkwlf000t80euzz02khq0	cmg72xn1g003sfofh52suc9zq	2025-10-06 00:00:00	11:30	12:30	1:1	completed		2025-10-07 19:06:28.995	2025-10-08 06:06:57.552
cmg90fnb3000c93gxhb34vzg0	cmg8zzacg000093gx865cl2xm	2025-10-06 00:00:00	09:30	10:30	1:1	completed		2025-10-02 06:04:13.114	2025-10-08 06:06:57.552
cmggzp3gm000889gx1i029vwi	cmgeufv4m0001dfdlqjcks11j	2025-10-07 00:00:00	14:00	15:00	group	completed		2025-10-07 20:05:43.751	2025-10-08 06:06:57.552
cmg90g9v8001c93gxzyrzweml	cmg8zzacg000093gx865cl2xm	2025-10-07 00:00:00	11:30	12:30	1:1	completed		2025-10-02 06:04:42.356	2025-10-08 06:06:57.552
cmggzp3fd000489gx7jyfhyzl	cmgeu9tgh0000dfdld8yohhuy	2025-10-07 00:00:00	14:00	15:00	group	completed		2025-10-07 20:05:43.705	2025-10-08 06:06:57.552
cmg47evd40031ateb1n8u4fi4	cmg40s3t400016reaj691t59r	2025-10-07 00:00:00	08:30	09:30	1:1	completed		2025-09-28 21:20:43.337	2025-10-08 06:06:57.552
cmg7323kd003wfofhvo56yw3r	cmg51euw20006bpec53j1e4bb	2025-10-07 00:00:00	09:30	10:30	1:1	completed		2025-09-30 21:42:07.501	2025-10-08 06:06:57.552
cmg90ha08001m93gx8q43ewxv	cmg8zzacg000093gx865cl2xm	2025-10-08 00:00:00	08:30	09:30	1:1	completed		2025-10-02 06:05:29.193	2025-10-08 15:22:16.859
cmg7333uq003yfofhbwgtum1w	cmg51euw20006bpec53j1e4bb	2025-10-08 00:00:00	09:30	10:30	1:1	completed		2025-09-30 21:42:54.53	2025-10-08 15:22:16.859
cmgexbnl60007dfe99vk5jupy	cmg72xn1g003sfofh52suc9zq	2025-10-08 00:00:00	11:30	12:30	1:1	completed		2025-10-06 09:23:45.066	2025-10-08 15:22:16.859
cmgh0mdnv006h89gxi7ewemmb	cmgh0mdii006f89gxl5ejkg3d	2025-10-08 11:30:00	14:30	15:00	Intake Consultation	completed	Varuna	2025-10-07 20:31:36.619	2025-10-08 15:22:16.859
cmgexflbg000rdfe9kwmwk2hi	cmg72xn1g003sfofh52suc9zq	2025-10-09 00:00:00	11:30	12:30	1:1	no-show		2025-10-06 09:26:48.748	2025-10-09 15:35:15.443
cmgh0k7q6004889gxdf7rdm1d	cmgeu9tgh0000dfdld8yohhuy	2025-10-15 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:55.615	2025-10-07 20:29:55.615
cmg5iq6l8000790h3smg8gt8q	cmg51euw20006bpec53j1e4bb	2025-10-15 00:00:00	09:30	10:30	1:1	scheduled		2025-09-29 19:25:13.052	2025-09-29 19:25:13.052
cmgexbney0003dfe957fr41vo	cmg72xn1g003sfofh52suc9zq	2025-10-15 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:23:44.837	2025-10-06 09:23:44.837
cmgh0k7qa004a89gxwsxzoahm	cmgeufv4m0001dfdlqjcks11j	2025-10-15 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:55.619	2025-10-07 20:29:55.619
cmg47fff5003zatebkzfbdgzj	cmg40s3t400016reaj691t59r	2025-10-16 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:21:09.33	2025-09-28 21:21:09.33
cmgexflb5000pdfe9r54hl844	cmg72xn1g003sfofh52suc9zq	2025-10-16 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:26:48.737	2025-10-06 09:26:48.737
cmgh0k7xj004e89gx23hyt45w	cmgeufv4m0001dfdlqjcks11j	2025-10-16 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:55.879	2025-10-07 20:29:55.879
cmgh0k7yp004g89gxcdclbfsu	cmgeu9tgh0000dfdld8yohhuy	2025-10-16 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:55.921	2025-10-07 20:29:55.921
cmg47dsyn002batebtt21jnfm	cmg40s3t400016reaj691t59r	2025-10-20 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:19:53.567	2025-09-28 21:19:53.567
cmg418z3w000d6reahdmfnr9a	cmg3zc6kf0002c2fkaq5c5a96	2025-10-20 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 18:28:10.557	2025-09-28 18:28:10.557
cmg90fnb6000e93gxvq1z2oh8	cmg8zzacg000093gx865cl2xm	2025-10-20 00:00:00	09:30	10:30	1:1	scheduled		2025-10-02 06:04:13.122	2025-10-02 06:04:13.122
cmggxkw2x000n80eux8huqjqq	cmg72xn1g003sfofh52suc9zq	2025-10-20 00:00:00	11:30	12:30	1:1	scheduled		2025-10-07 19:06:28.33	2025-10-07 19:06:28.33
cmggzp3gl000689gxjrvki7km	cmgeufv4m0001dfdlqjcks11j	2025-10-21 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:43.749	2025-10-07 20:05:43.749
cmggzp3gs000c89gxucgieb3s	cmgeu9tgh0000dfdld8yohhuy	2025-10-21 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:43.756	2025-10-07 20:05:43.756
cmg90g8jw001093gxqv6lmkvk	cmg8zzacg000093gx865cl2xm	2025-10-21 00:00:00	11:30	12:30	1:1	scheduled		2025-10-02 06:04:40.653	2025-10-02 06:04:40.653
cmg738n4f0042fofhtzseleak	cmg51euw20006bpec53j1e4bb	2025-10-21 00:00:00	09:30	10:30	1:1	scheduled		2025-09-30 21:47:12.783	2025-09-30 21:47:12.783
cmgh0k7q5004689gxxfb8c3jg	cmgeu9tgh0000dfdld8yohhuy	2025-10-09 00:00:00	14:00	15:00	group	completed		2025-10-07 20:29:55.613	2025-10-09 16:05:10.611
cmg90h9zy001e93gxkwbg2dc8	cmg8zzacg000093gx865cl2xm	2025-10-15 00:00:00	08:30	09:30	1:1	cancelled		2025-10-02 06:05:29.182	2025-10-14 08:38:33.135
cmg418z3h00096reamuz09gg1	cmg3zc6kf0002c2fkaq5c5a96	2025-10-13 00:00:00	10:30	11:30	1:1	completed		2025-09-28 18:28:10.542	2025-10-14 13:21:38.849
cmggxkw66000p80euosesbsct	cmg72xn1g003sfofh52suc9zq	2025-10-13 00:00:00	11:30	12:30	1:1	completed		2025-10-07 19:06:28.446	2025-10-14 13:21:38.849
cmg47dsvf0023ateb1kitxv00	cmg40s3t400016reaj691t59r	2025-10-13 00:00:00	08:30	09:30	1:1	completed		2025-09-28 21:19:53.451	2025-10-14 13:21:38.849
cmg471xz7001fatebxhd1s27h	cmg3zc6kf0002c2fkaq5c5a96	2025-10-16 00:00:00	10:30	11:30	1:1	cancelled		2025-09-28 21:10:40.195	2025-10-15 15:46:26.753
cmg90fnfn000g93gxwyh4i8gf	cmg8zzacg000093gx865cl2xm	2025-10-13 00:00:00	09:30	10:30	1:1	cancelled		2025-10-02 06:04:13.283	2025-10-14 13:22:39.139
cmggzp3gz000e89gxl16wgm1y	cmgeufv4m0001dfdlqjcks11j	2025-10-14 00:00:00	14:00	15:00	group	completed		2025-10-07 20:05:43.763	2025-10-14 13:26:11.743
cmggzp3go000a89gxnz40bv5w	cmgeu9tgh0000dfdld8yohhuy	2025-10-14 00:00:00	14:00	15:00	group	completed		2025-10-07 20:05:43.752	2025-10-14 13:26:20.597
cmg5iqod4000990h3e5xbcuh6	cmg51euw20006bpec53j1e4bb	2025-10-16 00:00:00	09:30	10:30	1:1	cancelled		2025-09-29 19:25:36.088	2025-10-16 04:43:07.257
cmg471cbu000ratebfnsrbi19	cmg3zc6kf0002c2fkaq5c5a96	2025-10-21 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:12.136	2025-09-28 21:10:12.136
cmg47evd70033atebhepkevzh	cmg40s3t400016reaj691t59r	2025-10-21 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:20:43.34	2025-09-28 21:20:43.34
cmgexbo0t000hdfe919wux1ht	cmg72xn1g003sfofh52suc9zq	2025-10-22 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:23:45.629	2025-10-06 09:23:45.629
cmgh0k7zw004o89gxzzazaqo4	cmgeu9tgh0000dfdld8yohhuy	2025-10-22 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:55.964	2025-10-07 20:29:55.964
cmg90ha05001i93gx87goa9vl	cmg8zzacg000093gx865cl2xm	2025-10-22 00:00:00	08:30	09:30	1:1	scheduled		2025-10-02 06:05:29.189	2025-10-02 06:05:29.189
cmg7390ym0044fofhv1vc2gei	cmg51euw20006bpec53j1e4bb	2025-10-22 00:00:00	09:30	10:30	1:1	scheduled		2025-09-30 21:47:30.718	2025-09-30 21:47:30.718
cmgh0k7za004i89gxu0gwl2su	cmgeufv4m0001dfdlqjcks11j	2025-10-22 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:55.943	2025-10-07 20:29:55.943
cmg739pj70046fofhuyip4yyd	cmg51euw20006bpec53j1e4bb	2025-10-23 00:00:00	09:30	10:30	1:1	scheduled		2025-09-30 21:48:02.563	2025-09-30 21:48:02.563
cmg47ffet003latebkd6aoxac	cmg40s3t400016reaj691t59r	2025-10-23 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:21:09.317	2025-09-28 21:21:09.317
cmgexflcu0013dfe9g5240krt	cmg72xn1g003sfofh52suc9zq	2025-10-23 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:26:48.798	2025-10-06 09:26:48.798
cmgh0k7zj004m89gxkwvr4mik	cmgeu9tgh0000dfdld8yohhuy	2025-10-23 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:55.951	2025-10-07 20:29:55.951
cmgh0k7zf004k89gxdqr8hn8p	cmgeufv4m0001dfdlqjcks11j	2025-10-23 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:55.947	2025-10-07 20:29:55.947
cmg471y0q001latebl31qk073	cmg3zc6kf0002c2fkaq5c5a96	2025-10-23 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:40.25	2025-09-28 21:10:40.25
cmg47dsw20025atebqxkf41zh	cmg40s3t400016reaj691t59r	2025-10-27 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:19:53.474	2025-09-28 21:19:53.474
cmg90fnao000693gxz8qt0beg	cmg8zzacg000093gx865cl2xm	2025-10-27 00:00:00	09:30	10:30	1:1	scheduled		2025-10-02 06:04:13.105	2025-10-02 06:04:13.105
cmggxkwrp001580eut1lrmio0	cmg72xn1g003sfofh52suc9zq	2025-10-27 00:00:00	11:30	12:30	1:1	scheduled		2025-10-07 19:06:29.222	2025-10-07 19:06:29.222
cmg418z42000f6reap1k1uera	cmg3zc6kf0002c2fkaq5c5a96	2025-10-27 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 18:28:10.563	2025-09-28 18:28:10.563
cmg47evde0039ateba79kkkt7	cmg40s3t400016reaj691t59r	2025-10-28 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:20:43.346	2025-09-28 21:20:43.346
cmg471cvl0011atebe4b10wub	cmg3zc6kf0002c2fkaq5c5a96	2025-10-28 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:12.85	2025-09-28 21:10:12.85
cmg90g8ku001693gxsj4zawre	cmg8zzacg000093gx865cl2xm	2025-10-28 00:00:00	11:30	12:30	1:1	scheduled		2025-10-02 06:04:40.686	2025-10-02 06:04:40.686
cmggzp3nl000i89gxiqwoh0rs	cmgeu9tgh0000dfdld8yohhuy	2025-10-28 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.002	2025-10-07 20:05:44.002
cmggzp3m1000g89gxju8tefuw	cmgeufv4m0001dfdlqjcks11j	2025-10-28 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:43.946	2025-10-07 20:05:43.946
cmgh0k893004u89gxtfqimtxv	cmgeu9tgh0000dfdld8yohhuy	2025-10-29 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.296	2025-10-07 20:29:56.296
cmgexbnkf0005dfe9icrpdxxy	cmg72xn1g003sfofh52suc9zq	2025-10-29 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:23:45.04	2025-10-06 09:23:45.04
cmgh0k84s004q89gx7boc1pr8	cmgeufv4m0001dfdlqjcks11j	2025-10-29 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.14	2025-10-07 20:29:56.14
cmg90ha03001g93gxlwq8wbb1	cmg8zzacg000093gx865cl2xm	2025-10-29 00:00:00	08:30	09:30	1:1	scheduled		2025-10-02 06:05:29.188	2025-10-02 06:05:29.188
cmgh0k88k004s89gxxmfchr5d	cmgeufv4m0001dfdlqjcks11j	2025-10-30 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.276	2025-10-07 20:29:56.276
cmgexflgt0017dfe999eq1106	cmg72xn1g003sfofh52suc9zq	2025-10-30 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:26:48.941	2025-10-06 09:26:48.941
cmg47ffgi0043atebb0ytf1kf	cmg40s3t400016reaj691t59r	2025-10-30 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:21:09.378	2025-09-28 21:21:09.378
cmg471y0s001natebg9pc6q2v	cmg3zc6kf0002c2fkaq5c5a96	2025-10-30 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:40.252	2025-09-28 21:10:40.252
cmggxkwob001180euimhcqz1g	cmg72xn1g003sfofh52suc9zq	2025-11-03 00:00:00	11:30	12:30	1:1	scheduled		2025-10-07 19:06:29.1	2025-10-07 19:06:29.1
cmg418z3m000b6realrhe4f1z	cmg3zc6kf0002c2fkaq5c5a96	2025-11-03 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 18:28:10.546	2025-09-28 18:28:10.546
cmg47dsx60027ateb31xajvdo	cmg40s3t400016reaj691t59r	2025-11-03 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:19:53.515	2025-09-28 21:19:53.515
cmg90fn9w000293gxj4n41uiu	cmg8zzacg000093gx865cl2xm	2025-11-03 00:00:00	09:30	10:30	1:1	scheduled		2025-10-02 06:04:13.077	2025-10-02 06:04:13.077
cmggzp3oh000k89gxkbu372zw	cmgeufv4m0001dfdlqjcks11j	2025-11-04 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.033	2025-10-07 20:05:44.033
cmggzp3ow000o89gxfm55r39d	cmgeu9tgh0000dfdld8yohhuy	2025-11-04 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.048	2025-10-07 20:05:44.048
cmg47evbk002tateb4rqs3v9c	cmg40s3t400016reaj691t59r	2025-11-04 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:20:43.28	2025-09-28 21:20:43.28
cmg471cvh000zatebjg04hsm0	cmg3zc6kf0002c2fkaq5c5a96	2025-11-04 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:12.845	2025-09-28 21:10:12.845
cmg90g8kr001493gx2nbjhycc	cmg8zzacg000093gx865cl2xm	2025-11-04 00:00:00	11:30	12:30	1:1	scheduled		2025-10-02 06:04:40.683	2025-10-02 06:04:40.683
cmg90ha09001o93gx3mjxnpqj	cmg8zzacg000093gx865cl2xm	2025-11-05 00:00:00	08:30	09:30	1:1	scheduled		2025-10-02 06:05:29.193	2025-10-02 06:05:29.193
cmgexbo45000ldfe9y9r3kiyk	cmg72xn1g003sfofh52suc9zq	2025-11-05 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:23:45.749	2025-10-06 09:23:45.749
cmgh0k8c6004y89gxt4mf2wi2	cmgeu9tgh0000dfdld8yohhuy	2025-11-05 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.406	2025-10-07 20:29:56.406
cmgh0k8bx004w89gxo0fjllf7	cmgeufv4m0001dfdlqjcks11j	2025-11-05 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.397	2025-10-07 20:29:56.397
cmg471xz7001hatebjp48zyt4	cmg3zc6kf0002c2fkaq5c5a96	2025-11-06 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:40.196	2025-09-28 21:10:40.196
cmg47ffet003jatebeq3avdfy	cmg40s3t400016reaj691t59r	2025-11-06 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:21:09.317	2025-09-28 21:21:09.317
cmgexflch000vdfe9sghoo3m9	cmg72xn1g003sfofh52suc9zq	2025-11-06 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:26:48.786	2025-10-06 09:26:48.786
cmgh0k8cg005089gx1fqmguii	cmgeufv4m0001dfdlqjcks11j	2025-11-06 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.416	2025-10-07 20:29:56.416
cmgh0k8f5005289gx05zwgkab	cmgeu9tgh0000dfdld8yohhuy	2025-11-06 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.513	2025-10-07 20:29:56.513
cmg418zlj000l6reauf6f77qi	cmg3zc6kf0002c2fkaq5c5a96	2025-11-10 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 18:28:11.192	2025-09-28 18:28:11.192
cmg90fngq000o93gx7i6ggufj	cmg8zzacg000093gx865cl2xm	2025-11-10 00:00:00	09:30	10:30	1:1	scheduled		2025-10-02 06:04:13.322	2025-10-02 06:04:13.322
cmggxkwtr001780euuncr0xqi	cmg72xn1g003sfofh52suc9zq	2025-11-10 00:00:00	11:30	12:30	1:1	scheduled		2025-10-07 19:06:29.295	2025-10-07 19:06:29.295
cmg47dtga002hatebvb2scnnm	cmg40s3t400016reaj691t59r	2025-11-10 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:19:54.202	2025-09-28 21:19:54.202
cmg471d65001bateb6lxvnvxd	cmg3zc6kf0002c2fkaq5c5a96	2025-11-11 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:13.23	2025-09-28 21:10:13.23
cmggzp3ou000m89gx71inacih	cmgeufv4m0001dfdlqjcks11j	2025-11-11 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.046	2025-10-07 20:05:44.046
cmg90g8l6001893gxcx05g1gn	cmg8zzacg000093gx865cl2xm	2025-11-11 00:00:00	11:30	12:30	1:1	scheduled		2025-10-02 06:04:40.698	2025-10-02 06:04:40.698
cmggzp3pk000q89gx0i667kco	cmgeu9tgh0000dfdld8yohhuy	2025-11-11 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.072	2025-10-07 20:05:44.072
cmg47evbs002vatebg59rygcx	cmg40s3t400016reaj691t59r	2025-11-11 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:20:43.288	2025-09-28 21:20:43.288
cmgh0k8fl005489gxipric3yy	cmgeufv4m0001dfdlqjcks11j	2025-11-12 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.529	2025-10-07 20:29:56.529
cmgexbo1j000jdfe90ls4bhjs	cmg72xn1g003sfofh52suc9zq	2025-11-12 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:23:45.655	2025-10-06 09:23:45.655
cmg90ha0r001u93gxufuaf33i	cmg8zzacg000093gx865cl2xm	2025-11-12 00:00:00	08:30	09:30	1:1	scheduled		2025-10-02 06:05:29.212	2025-10-02 06:05:29.212
cmgh0k8j3005889gxxev11vfa	cmgeu9tgh0000dfdld8yohhuy	2025-11-13 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.655	2025-10-07 20:29:56.655
cmg47ffeu003nateb0twa9hux	cmg40s3t400016reaj691t59r	2025-11-13 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:21:09.319	2025-09-28 21:21:09.319
cmg471y0t001pateb02nc78yo	cmg3zc6kf0002c2fkaq5c5a96	2025-11-13 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:40.253	2025-09-28 21:10:40.253
cmgexflxm001hdfe9yd70gvta	cmg72xn1g003sfofh52suc9zq	2025-11-13 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:26:49.546	2025-10-06 09:26:49.546
cmgh0k8io005689gxa00h546d	cmgeufv4m0001dfdlqjcks11j	2025-11-13 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.64	2025-10-07 20:29:56.64
cmg47dti1002latebef532fuy	cmg40s3t400016reaj691t59r	2025-11-17 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:19:54.265	2025-09-28 21:19:54.265
cmg418zlk000n6reacyv0zwbd	cmg3zc6kf0002c2fkaq5c5a96	2025-11-17 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 18:28:11.192	2025-09-28 18:28:11.192
cmg90fnaj000493gxbaubhmnr	cmg8zzacg000093gx865cl2xm	2025-11-17 00:00:00	09:30	10:30	1:1	scheduled		2025-10-02 06:04:13.099	2025-10-02 06:04:13.099
cmggxkw1d000l80euxhne07bc	cmg72xn1g003sfofh52suc9zq	2025-11-17 00:00:00	11:30	12:30	1:1	scheduled		2025-10-07 19:06:28.273	2025-10-07 19:06:28.273
cmggzp3ty000u89gxl0jr6xmh	cmgeu9tgh0000dfdld8yohhuy	2025-11-18 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.231	2025-10-07 20:05:44.231
cmg47evda0035atebk49f2ohm	cmg40s3t400016reaj691t59r	2025-11-18 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:20:43.343	2025-09-28 21:20:43.343
cmg90g8jw000z93gxdlxll97a	cmg8zzacg000093gx865cl2xm	2025-11-18 00:00:00	11:30	12:30	1:1	scheduled		2025-10-02 06:04:40.653	2025-10-02 06:04:40.653
cmggzp3sa000s89gxdjl1ert0	cmgeufv4m0001dfdlqjcks11j	2025-11-18 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.171	2025-10-07 20:05:44.171
cmg471cwf0015atebigr4jfhp	cmg3zc6kf0002c2fkaq5c5a96	2025-11-18 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:12.879	2025-09-28 21:10:12.879
cmg90ha0h001s93gxe95cuuv8	cmg8zzacg000093gx865cl2xm	2025-11-19 00:00:00	08:30	09:30	1:1	scheduled		2025-10-02 06:05:29.202	2025-10-02 06:05:29.202
cmgh0k8nf005e89gx5kdzewlw	cmgeufv4m0001dfdlqjcks11j	2025-11-19 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.811	2025-10-07 20:29:56.811
cmgh0k8lj005a89gxezlvmwsf	cmgeu9tgh0000dfdld8yohhuy	2025-11-19 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.743	2025-10-07 20:29:56.743
cmgexboak000ndfe91tlr18i1	cmg72xn1g003sfofh52suc9zq	2025-11-19 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:23:45.981	2025-10-06 09:23:45.981
cmgh0k8md005c89gxyo4c2qip	cmgeufv4m0001dfdlqjcks11j	2025-11-20 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.773	2025-10-07 20:29:56.773
cmgexflck000xdfe91qu8aez9	cmg72xn1g003sfofh52suc9zq	2025-11-20 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:26:48.789	2025-10-06 09:26:48.789
cmg471y5s001vatebganco8su	cmg3zc6kf0002c2fkaq5c5a96	2025-11-20 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:40.433	2025-09-28 21:10:40.433
cmg47fffe0041atebzlh7wy5t	cmg40s3t400016reaj691t59r	2025-11-20 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:21:09.338	2025-09-28 21:21:09.338
cmggxkwlg000v80euky65gs4g	cmg72xn1g003sfofh52suc9zq	2025-11-24 00:00:00	11:30	12:30	1:1	scheduled		2025-10-07 19:06:28.997	2025-10-07 19:06:28.997
cmg47dtr3002patebtab3r4fz	cmg40s3t400016reaj691t59r	2025-11-24 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:19:54.591	2025-09-28 21:19:54.591
cmg418zp9000v6reae5wasbfc	cmg3zc6kf0002c2fkaq5c5a96	2025-11-24 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 18:28:11.326	2025-09-28 18:28:11.326
cmg90fngf000k93gxjoji4jta	cmg8zzacg000093gx865cl2xm	2025-11-24 00:00:00	09:30	10:30	1:1	scheduled		2025-10-02 06:04:13.311	2025-10-02 06:04:13.311
cmggzp3vv000w89gxhsjoxjmt	cmgeufv4m0001dfdlqjcks11j	2025-11-25 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.299	2025-10-07 20:05:44.299
cmg90g8jr000u93gxjelv60wa	cmg8zzacg000093gx865cl2xm	2025-11-25 00:00:00	11:30	12:30	1:1	scheduled		2025-10-02 06:04:40.647	2025-10-02 06:04:40.647
cmg47evg4003datebbux53has	cmg40s3t400016reaj691t59r	2025-11-25 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:20:43.445	2025-09-28 21:20:43.445
cmg471cy50017atebkotvcpdg	cmg3zc6kf0002c2fkaq5c5a96	2025-11-25 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:12.941	2025-09-28 21:10:12.941
cmggzp3vz000y89gxvp3rzzj7	cmgeu9tgh0000dfdld8yohhuy	2025-11-25 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.303	2025-10-07 20:05:44.303
cmgexbnzq000bdfe93hloervm	cmg72xn1g003sfofh52suc9zq	2025-11-26 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:23:45.591	2025-10-06 09:23:45.591
cmg90ha08001k93gx1mjr8iia	cmg8zzacg000093gx865cl2xm	2025-11-26 00:00:00	08:30	09:30	1:1	scheduled		2025-10-02 06:05:29.192	2025-10-02 06:05:29.192
cmgh0k8q5005g89gx3nh3kprk	cmgeufv4m0001dfdlqjcks11j	2025-11-26 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.909	2025-10-07 20:29:56.909
cmgh0k8rj005i89gxpr6w73ni	cmgeufv4m0001dfdlqjcks11j	2025-11-27 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:56.96	2025-10-07 20:29:56.96
cmg471y0u001ratebjvbjbpa8	cmg3zc6kf0002c2fkaq5c5a96	2025-11-27 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:40.255	2025-09-28 21:10:40.255
cmgexflcr0011dfe9nwf8u33v	cmg72xn1g003sfofh52suc9zq	2025-11-27 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:26:48.796	2025-10-06 09:26:48.796
cmgh0k8u3005k89gxw9k2u5a9	cmgeu9tgh0000dfdld8yohhuy	2025-11-27 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.052	2025-10-07 20:29:57.052
cmg47ffen003hateb9d7z0b6d	cmg40s3t400016reaj691t59r	2025-11-27 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:21:09.311	2025-09-28 21:21:09.311
cmg418zoq000r6reabx8rbthl	cmg3zc6kf0002c2fkaq5c5a96	2025-12-01 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 18:28:11.307	2025-09-28 18:28:11.307
cmg47dtfx002fatebpao780vw	cmg40s3t400016reaj691t59r	2025-12-01 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:19:54.189	2025-09-28 21:19:54.189
cmggxkwn0000x80eu52mkoofy	cmg72xn1g003sfofh52suc9zq	2025-12-01 00:00:00	11:30	12:30	1:1	scheduled		2025-10-07 19:06:29.053	2025-10-07 19:06:29.053
cmg90fnaz000893gxtdjcufjf	cmg8zzacg000093gx865cl2xm	2025-12-01 00:00:00	09:30	10:30	1:1	scheduled		2025-10-02 06:04:13.111	2025-10-02 06:04:13.111
cmggzp3x5001289gxf3hpy6zv	cmgeu9tgh0000dfdld8yohhuy	2025-12-02 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.345	2025-10-07 20:05:44.345
cmg47evc3002zatebbs5zjd02	cmg40s3t400016reaj691t59r	2025-12-02 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:20:43.299	2025-09-28 21:20:43.299
cmg471cwe0013atebtq1lfa7v	cmg3zc6kf0002c2fkaq5c5a96	2025-12-02 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:12.878	2025-09-28 21:10:12.878
cmggzp3ww001089gxapv675q9	cmgeufv4m0001dfdlqjcks11j	2025-12-02 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.337	2025-10-07 20:05:44.337
cmg90g8jr000t93gxbcf71qw9	cmg8zzacg000093gx865cl2xm	2025-12-02 00:00:00	11:30	12:30	1:1	scheduled		2025-10-02 06:04:40.647	2025-10-02 06:04:40.647
cmg90ha0g001q93gx5vc1q193	cmg8zzacg000093gx865cl2xm	2025-12-03 00:00:00	08:30	09:30	1:1	scheduled		2025-10-02 06:05:29.2	2025-10-02 06:05:29.2
cmgh0k8u9005o89gx3asjqqlr	cmgeu9tgh0000dfdld8yohhuy	2025-12-03 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.057	2025-10-07 20:29:57.057
cmgexbnzy000ddfe95q5axabr	cmg72xn1g003sfofh52suc9zq	2025-12-03 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:23:45.599	2025-10-06 09:23:45.599
cmgh0k8u7005m89gxego25xyj	cmgeufv4m0001dfdlqjcks11j	2025-12-03 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.055	2025-10-07 20:29:57.055
cmgh0k8wo005q89gxdpnyshnz	cmgeufv4m0001dfdlqjcks11j	2025-12-04 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.145	2025-10-07 20:29:57.145
cmgexflzp001jdfe9k0ahdykz	cmg72xn1g003sfofh52suc9zq	2025-12-04 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:26:49.621	2025-10-06 09:26:49.621
cmg471xz6001dateb4kw7gbti	cmg3zc6kf0002c2fkaq5c5a96	2025-12-04 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:40.194	2025-09-28 21:10:40.194
cmg47fff0003tateb96fnw7u7	cmg40s3t400016reaj691t59r	2025-12-04 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:21:09.324	2025-09-28 21:21:09.324
cmgh0k8xh005s89gxpsjsdf4k	cmgeu9tgh0000dfdld8yohhuy	2025-12-04 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.173	2025-10-07 20:29:57.173
cmg418zor000t6readicv47fv	cmg3zc6kf0002c2fkaq5c5a96	2025-12-08 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 18:28:11.308	2025-09-28 18:28:11.308
cmg90fnb3000b93gxlz97zoau	cmg8zzacg000093gx865cl2xm	2025-12-08 00:00:00	09:30	10:30	1:1	scheduled		2025-10-02 06:04:13.115	2025-10-02 06:04:13.115
cmg47dtgz002jatebmdpv2rbw	cmg40s3t400016reaj691t59r	2025-12-08 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:19:54.227	2025-09-28 21:19:54.227
cmggxkwkn000r80eu3z5uqfsj	cmg72xn1g003sfofh52suc9zq	2025-12-08 00:00:00	11:30	12:30	1:1	scheduled		2025-10-07 19:06:28.967	2025-10-07 19:06:28.967
cmg90g9v6001a93gxz9btdibn	cmg8zzacg000093gx865cl2xm	2025-12-09 00:00:00	11:30	12:30	1:1	scheduled		2025-10-02 06:04:42.354	2025-10-02 06:04:42.354
cmggzp40f001689gx44uc2wcd	cmgeu9tgh0000dfdld8yohhuy	2025-12-09 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.463	2025-10-07 20:05:44.463
cmg47evdc0037atebuzbmhnkv	cmg40s3t400016reaj691t59r	2025-12-09 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:20:43.344	2025-09-28 21:20:43.344
cmg471cbn000patebo0eld6ia	cmg3zc6kf0002c2fkaq5c5a96	2025-12-09 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:12.131	2025-09-28 21:10:12.131
cmggzp3y9001489gx0kjrcog4	cmgeufv4m0001dfdlqjcks11j	2025-12-09 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.385	2025-10-07 20:05:44.385
cmgh0k90j005w89gxbc1y5ef4	cmgeu9tgh0000dfdld8yohhuy	2025-12-10 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.283	2025-10-07 20:29:57.283
cmgh0k8ym005u89gx0pdemof2	cmgeufv4m0001dfdlqjcks11j	2025-12-10 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.214	2025-10-07 20:29:57.214
cmg90haa5002093gxp7hhqeh2	cmg8zzacg000093gx865cl2xm	2025-12-10 00:00:00	08:30	09:30	1:1	scheduled		2025-10-02 06:05:29.549	2025-10-02 06:05:29.549
cmgexbnek0001dfe9n2e2u80i	cmg72xn1g003sfofh52suc9zq	2025-12-10 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:23:44.829	2025-10-06 09:23:44.829
cmgexflv7001fdfe9hn1mxdxh	cmg72xn1g003sfofh52suc9zq	2025-12-11 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:26:49.459	2025-10-06 09:26:49.459
cmgh0k910005y89gxd6hn5seu	cmgeufv4m0001dfdlqjcks11j	2025-12-11 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.3	2025-10-07 20:29:57.3
cmg47fff3003xatebdvoqau6e	cmg40s3t400016reaj691t59r	2025-12-11 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:21:09.327	2025-09-28 21:21:09.327
cmg471y0o001jatebfdbcc6xw	cmg3zc6kf0002c2fkaq5c5a96	2025-12-11 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:40.248	2025-09-28 21:10:40.248
cmgh0k92j006289gx0sl2dp3o	cmgeu9tgh0000dfdld8yohhuy	2025-12-11 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.355	2025-10-07 20:29:57.355
cmg90fngm000m93gxirpwi878	cmg8zzacg000093gx865cl2xm	2025-12-15 00:00:00	09:30	10:30	1:1	scheduled		2025-10-02 06:04:13.318	2025-10-02 06:04:13.318
cmg47dtm5002natebx27lir85	cmg40s3t400016reaj691t59r	2025-12-15 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:19:54.414	2025-09-28 21:19:54.414
cmg418zoq000p6reacv6tnats	cmg3zc6kf0002c2fkaq5c5a96	2025-12-15 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 18:28:11.306	2025-09-28 18:28:11.306
cmggxkwnl000z80eup5gpy1x6	cmg72xn1g003sfofh52suc9zq	2025-12-15 00:00:00	11:30	12:30	1:1	scheduled		2025-10-07 19:06:29.073	2025-10-07 19:06:29.073
cmggzp43f001a89gxvw7b86e8	cmgeu9tgh0000dfdld8yohhuy	2025-12-16 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.571	2025-10-07 20:05:44.571
cmggzp42l001889gxa0c9kike	cmgeufv4m0001dfdlqjcks11j	2025-12-16 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.542	2025-10-07 20:05:44.542
cmg90g8k0001293gxk8tlulf4	cmg8zzacg000093gx865cl2xm	2025-12-16 00:00:00	11:30	12:30	1:1	scheduled		2025-10-02 06:04:40.656	2025-10-02 06:04:40.656
cmg47evsc003fatebiglzue6j	cmg40s3t400016reaj691t59r	2025-12-16 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:20:43.884	2025-09-28 21:20:43.884
cmg471cux000xateb942hwxnv	cmg3zc6kf0002c2fkaq5c5a96	2025-12-16 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:12.825	2025-09-28 21:10:12.825
cmg90ha1a001w93gx1t8r32w0	cmg8zzacg000093gx865cl2xm	2025-12-17 00:00:00	08:30	09:30	1:1	scheduled		2025-10-02 06:05:29.23	2025-10-02 06:05:29.23
cmgh0k93z006489gxvqigtk66	cmgeu9tgh0000dfdld8yohhuy	2025-12-17 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.407	2025-10-07 20:29:57.407
cmgh0k92j006189gxwhyqdllx	cmgeufv4m0001dfdlqjcks11j	2025-12-17 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.355	2025-10-07 20:29:57.355
cmgexbo0s000fdfe9vk0r8uku	cmg72xn1g003sfofh52suc9zq	2025-12-17 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:23:45.592	2025-10-06 09:23:45.592
cmgexflua001bdfe918ieuf0s	cmg72xn1g003sfofh52suc9zq	2025-12-18 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:26:49.426	2025-10-06 09:26:49.426
cmg47ffew003pateb3femgjz6	cmg40s3t400016reaj691t59r	2025-12-18 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:21:09.321	2025-09-28 21:21:09.321
cmg471y0y001tatebayz7vq7z	cmg3zc6kf0002c2fkaq5c5a96	2025-12-18 00:00:00	10:30	11:30	1:1	scheduled		2025-09-28 21:10:40.259	2025-09-28 21:10:40.259
cmgh0k950006689gxjes0be31	cmgeufv4m0001dfdlqjcks11j	2025-12-18 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.445	2025-10-07 20:29:57.445
cmgh0k96m006889gxvvkv1h09	cmgeu9tgh0000dfdld8yohhuy	2025-12-18 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.503	2025-10-07 20:29:57.503
cmg47dt3o002datebahyhx0xk	cmg40s3t400016reaj691t59r	2025-12-22 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:19:53.749	2025-09-28 21:19:53.749
cmggxkwog001380euh0xpa8dc	cmg72xn1g003sfofh52suc9zq	2025-12-22 00:00:00	11:30	12:30	1:1	scheduled		2025-10-07 19:06:29.104	2025-10-07 19:06:29.104
cmg90fng4000i93gxe3snymv1	cmg8zzacg000093gx865cl2xm	2025-12-22 00:00:00	09:30	10:30	1:1	scheduled		2025-10-02 06:04:13.301	2025-10-02 06:04:13.301
cmggzp46x001c89gx3k961t2w	cmgeufv4m0001dfdlqjcks11j	2025-12-23 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.698	2025-10-07 20:05:44.698
cmggzp47a001e89gx8isw697e	cmgeu9tgh0000dfdld8yohhuy	2025-12-23 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:05:44.711	2025-10-07 20:05:44.711
cmg90g8jm000q93gx8vlki0gv	cmg8zzacg000093gx865cl2xm	2025-12-23 00:00:00	11:30	12:30	1:1	scheduled		2025-10-02 06:04:40.642	2025-10-02 06:04:40.642
cmg47evdm003bateb8bxjvsr8	cmg40s3t400016reaj691t59r	2025-12-23 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:20:43.355	2025-09-28 21:20:43.355
cmgh0k98h006a89gx3kfou1ob	cmgeu9tgh0000dfdld8yohhuy	2025-12-24 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.57	2025-10-07 20:29:57.57
cmg90ha4u001y93gxa7pgdrp1	cmg8zzacg000093gx865cl2xm	2025-12-24 00:00:00	08:30	09:30	1:1	scheduled		2025-10-02 06:05:29.358	2025-10-02 06:05:29.358
cmgexbnz20009dfe92t6h3dct	cmg72xn1g003sfofh52suc9zq	2025-12-24 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:23:45.567	2025-10-06 09:23:45.567
cmg47ffex003rateb7w3tc6by	cmg40s3t400016reaj691t59r	2025-12-25 00:00:00	08:30	09:30	1:1	scheduled		2025-09-28 21:21:09.321	2025-09-28 21:21:09.321
cmgh0k99d006c89gxcvj064qa	cmgeufv4m0001dfdlqjcks11j	2025-12-25 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.601	2025-10-07 20:29:57.601
cmgh0k99u006e89gx15sb19dd	cmgeu9tgh0000dfdld8yohhuy	2025-12-25 00:00:00	14:00	15:00	group	scheduled		2025-10-07 20:29:57.618	2025-10-07 20:29:57.618
cmgexfldb0015dfe960xanp9w	cmg72xn1g003sfofh52suc9zq	2025-12-25 00:00:00	11:30	12:30	1:1	scheduled		2025-10-06 09:26:48.815	2025-10-06 09:26:48.815
cmg471ycy001zatebflrpehu8	cmg3zc6kf0002c2fkaq5c5a96	2025-10-09 00:00:00	10:30	11:30	1:1	completed		2025-09-28 21:10:40.691	2025-10-09 16:05:10.611
cmg47fff2003vatebghggv58f	cmg40s3t400016reaj691t59r	2025-10-09 00:00:00	08:30	09:30	1:1	completed		2025-09-28 21:21:09.326	2025-10-09 16:05:10.611
cmg733is50040fofh41xnqhtm	cmg51euw20006bpec53j1e4bb	2025-10-09 00:00:00	09:30	10:30	1:1	completed		2025-09-30 21:43:13.877	2025-10-09 16:05:10.611
cmgh0k7pb004289gx993mgq3u	cmgeufv4m0001dfdlqjcks11j	2025-10-09 00:00:00	14:00	15:00	group	completed		2025-10-07 20:29:55.583	2025-10-09 16:05:10.611
cmgqb9nii0001jo04fkatz6gc	cmgh0mdii006f89gxl5ejkg3d	2025-10-28 00:00:00	13:00	14:00	1:1	scheduled		2025-10-14 08:39:34.218	2025-10-14 08:39:34.218
cmgqb9nlv0001lb04wfpmpu05	cmgh0mdii006f89gxl5ejkg3d	2025-10-21 00:00:00	13:00	14:00	1:1	scheduled		2025-10-14 08:39:34.339	2025-10-14 08:39:34.339
cmgqb9nm20001l204roaargqi	cmgh0mdii006f89gxl5ejkg3d	2025-11-04 00:00:00	13:00	14:00	1:1	scheduled		2025-10-14 08:39:34.346	2025-10-14 08:39:34.346
cmg5ipkfw000590h3ifyqiod4	cmg51euw20006bpec53j1e4bb	2025-10-14 00:00:00	09:30	10:30	1:1	completed		2025-09-29 19:24:44.349	2025-10-14 13:21:38.849
cmg47evc0002xatebt7o3hpxq	cmg40s3t400016reaj691t59r	2025-10-14 00:00:00	08:30	09:30	1:1	completed		2025-09-28 21:20:43.296	2025-10-14 13:21:38.849
cmg471d0w0019atebq494nedc	cmg3zc6kf0002c2fkaq5c5a96	2025-10-14 00:00:00	10:30	11:30	1:1	completed		2025-09-28 21:10:13.04	2025-10-14 13:21:38.849
cmg90g8jt000w93gxw1mwbgpq	cmg8zzacg000093gx865cl2xm	2025-10-14 00:00:00	11:30	12:30	1:1	cancelled		2025-10-02 06:04:40.649	2025-10-14 13:22:48.623
cmgqler240001l80474qk056y	cmgh0mdii006f89gxl5ejkg3d	2025-10-15 00:00:00	13:00	14:00	1:1	scheduled		2025-10-14 13:23:28.252	2025-10-14 13:23:28.252
cmgqlerfp0001le04qpj0gbrt	cmgh0mdii006f89gxl5ejkg3d	2025-10-16 00:00:00	13:00	14:00	1:1	scheduled		2025-10-14 13:23:28.741	2025-10-14 13:23:28.741
cmgqlerg50001jo04jdqu3rki	cmgh0mdii006f89gxl5ejkg3d	2025-10-30 00:00:00	13:00	14:00	1:1	scheduled		2025-10-14 13:23:28.758	2025-10-14 13:23:28.758
cmgqlergi0001la04ebmttodb	cmgh0mdii006f89gxl5ejkg3d	2025-11-06 00:00:00	13:00	14:00	1:1	scheduled		2025-10-14 13:23:28.77	2025-10-14 13:23:28.77
cmgqles4o0001gp04d85zwi4c	cmgh0mdii006f89gxl5ejkg3d	2025-11-05 00:00:00	13:00	14:00	1:1	scheduled		2025-10-14 13:23:29.64	2025-10-14 13:23:29.64
cmgqles560001l204dnn43tum	cmgh0mdii006f89gxl5ejkg3d	2025-10-29 00:00:00	13:00	14:00	1:1	scheduled		2025-10-14 13:23:29.658	2025-10-14 13:23:29.658
cmgqles580001lb048mk3zscb	cmgh0mdii006f89gxl5ejkg3d	2025-10-23 00:00:00	13:00	14:00	1:1	scheduled		2025-10-14 13:23:29.661	2025-10-14 13:23:29.661
cmgqlesf30001l204mtdcnueq	cmgh0mdii006f89gxl5ejkg3d	2025-10-22 00:00:00	13:00	14:00	1:1	scheduled		2025-10-14 13:23:30.015	2025-10-14 13:23:30.015
cmgqb9nm30001jv04ngox84ak	cmgh0mdii006f89gxl5ejkg3d	2025-10-14 00:00:00	13:00	14:00	1:1	completed		2025-10-14 08:39:34.348	2025-10-14 13:25:59.482
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, name, phone, goal, "joinDate", status, plan, "trainingFrequency", "lastWorkout", "totalSessions", rating, "createdAt", "updatedAt") FROM stdin;
cmg40s3t400016reaj691t59r	dragomiranamaria99@yahoo.com	Dragomir Ana Maria	+40720995886	Crestere in greutate, masa musculara	2025-09-28 18:15:03.496	active	Basic	3	\N	0	0	2025-09-28 18:15:03.496	2025-09-28 18:20:30.223
cmg3zc6f00001c2fk7xcz8z9m	mihaela@mihaelafitness.com	Mihaela (Own Training)	+40790682811	Grow glutes 	2025-09-28 17:34:40.765	active	own-training	5	\N	0	5	2025-09-28 17:34:40.765	2025-10-01 19:52:34.124
cmg8zzacg000093gx865cl2xm	creataalexandra17@gmail.com	Creata Alexandra 	0799828988	Masa musculara , tonifere 	2025-10-02 05:51:29.753	active	Basic	3	\N	0	0	2025-10-02 05:51:29.753	2025-10-02 05:51:29.753
cmg4zcgmr00009gfm1ptz4rfg	atoma17@yahoo.com	Ana Maria Toma	0755950719	Build glutes and abs 	2025-09-29 10:22:40.118	active	Basic	3	\N	0	0	2025-09-29 10:22:40.118	2025-09-29 10:22:40.118
cmg5e83lx00039iflnfnqz261	carmensimionescu@example.com	Carmen Simionescu			2025-09-29 17:19:10.854	active	Basic	1	\N	0	0	2025-09-29 17:19:10.854	2025-09-29 17:19:10.854
cmg5e74vy00029iflewdnp226	badeacecilia@example.com	Badea Cecilia			2025-09-29 17:18:25.853	active	Basic	1	\N	0	0	2025-09-29 17:18:25.853	2025-09-29 17:19:23.739
cmg3zc6kf0002c2fkaq5c5a96	georgiana.leca@yahoo.com	Leca Georgiana	+40730683328	Loose fat and built muscle	2025-09-28 17:34:40.959	active	Premium	3	\N	0	4.8	2025-09-28 17:34:40.959	2025-09-29 18:36:18.189
cmg51euw20006bpec53j1e4bb	georgianatomescu@example.com	Georgiana Tomescu	+40 721 838 985	Lose  belly fat and build muscle	2025-09-29 11:20:31.136	active	Basic	3	\N	0	0	2025-09-29 11:20:31.136	2025-09-29 19:30:29.093
cmgaxpzcq00039reajc2azfrb	chiel@media2net.nl	Chiel	+31 6 87654321	Technical Support	2025-10-03 14:23:48.794	active	Admin	0	\N	0	0	2025-10-03 14:23:48.794	2025-10-03 16:10:55.79
cmgaxpz9b00029reauw9t07gi	info@mihaelafitness.com	Mihaela	+31 6 12345678	Fitness Coach	2025-10-03 14:23:48.606	active	Premium	0	\N	0	0	2025-10-03 14:23:48.606	2025-10-03 20:54:17.059
cmgemvr1o0000aai3s9xt5jqh	duta.andreea23@gmail.com	Andreea Duta	0761121155	Lose body fat build muscle	2025-10-06 04:31:26.828	active	Basic	2	\N	0	0	2025-10-06 04:31:26.828	2025-10-06 04:31:26.828
cmgeufv4m0001dfdlqjcks11j	andreeaidicliu@yahoo.ro	Andreea Nuta	0760823134	Lose fat	2025-10-06 08:03:02.511	active	Basic	3	\N	0	0	2025-10-06 08:03:02.511	2025-10-06 08:03:02.511
cmg72xn1g003sfofh52suc9zq	andreeast98@yahoo.com	Andreea Popescu 	0769638460	Lose fat tonify build muscle 	2025-09-30 21:38:39.396	active	Basic	3	\N	0	0	2025-09-30 21:38:39.396	2025-10-06 08:38:49.573
cmgf1fmsj000m6ofa4y22whbd	blocked-time@system.local	Blocked Time	\N	\N	2025-10-06 11:18:49.124	active	system	0	\N	0	0	2025-10-06 11:18:49.124	2025-10-06 11:18:49.124
cmgeu9tgh0000dfdld8yohhuy	nuta.carmina@yahoo.com	Carmina Papa	0762827600	Lose fat build muscle 	2025-10-06 07:58:20.437	active	Basic	3	\N	0	0	2025-10-06 07:58:20.437	2025-10-07 18:56:13.961
cmgh0mdii006f89gxl5ejkg3d	cioteavalentina@gmail.com	Valentina Milos	0754884160	Masa musculara	2025-10-07 20:31:36.363	Active	Basic	3	\N	0	0	2025-10-07 20:31:36.363	2025-10-08 17:49:58.025
\.


--
-- Data for Name: workout_exercises; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workout_exercises (id, "workoutId", "exerciseId", day, "order", sets, reps, weight, "restTime", notes, "createdAt", "updatedAt") FROM stdin;
cmg9w1kjs00ah9ifnv3o8qzqn	cmg5my5c8006b7ugxku7kf08s	cmg9w1cf8009x9ifnozlz18uk	1	1	2	10 each direction	bodyweight	30 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:04.072	2025-10-02 20:49:04.072
cmg9w1kng00aj9ifnfobd7d39	cmg5my5c8006b7ugxku7kf08s	cmg6oxion0009anebip168yat	1	2	2	15	bodyweight	30 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:04.204	2025-10-02 20:49:04.204
cmg9w1ksr00al9ifnv1faj766	cmg5my5c8006b7ugxku7kf08s	cmg9w1ckb009y9ifnvc9hfv7n	1	3	2	10 each side	bodyweight	30 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:04.396	2025-10-02 20:49:04.396
cmg9w1kwl00an9ifnby996n87	cmg5my5c8006b7ugxku7kf08s	cmg6oxk23000haneb7w81712a	1	4	2	12	bodyweight	30 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:04.533	2025-10-02 20:49:04.533
cmg9w1l0200ap9ifne5xawaws	cmg5my5c8006b7ugxku7kf08s	cmg9w1cq9009z9ifndf7sosrs	1	5	2	12 each leg	bodyweight	30 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:04.658	2025-10-02 20:49:04.658
cmg9w1l3h00ar9ifnbdyv49sv	cmg5my5c8006b7ugxku7kf08s	cmg9w1ct400a09ifntgdytjkq	1	6	2	10 each side	resistance band	30 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:04.781	2025-10-02 20:49:04.781
cmg9w1l6v00at9ifn0w92l83l	cmg5my5c8006b7ugxku7kf08s	cmg6oxkii000kanebga7y2ik3	1	7	4	12	barbell	60-90 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:04.904	2025-10-02 20:49:04.904
cmg9w1lbi00av9ifnqtjkpp0g	cmg5my5c8006b7ugxku7kf08s	cmg6oxknq000lanebp0nujp5g	1	8	4	12	dumbbells	60-90 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:05.07	2025-10-02 20:49:05.07
cmg9w1lik00ax9ifnwfexqr4p	cmg5my5c8006b7ugxku7kf08s	cmg9w1cw800a19ifnu8jc7u4f	1	9	4	12 each leg	dumbbells	60-90 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:05.324	2025-10-02 20:49:05.324
cmg9w1llw00az9ifnmfza5brh	cmg5my5c8006b7ugxku7kf08s	cmg6oxktt000manebt1xkmvj2	1	10	4	12	barbell	60-90 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:05.444	2025-10-02 20:49:05.444
cmg9w1lp200b19ifnga4xpr0d	cmg5my5c8006b7ugxku7kf08s	cmg3zldad004ac2fkh3gpiii1	1	11	4	15	machine	60-90 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:05.558	2025-10-02 20:49:05.558
cmg9w1ls500b39ifnqe0rf9zw	cmg5my5c8006b7ugxku7kf08s	cmg9w1czn00a29ifn8tscxu7j	1	12	4	10 each leg	dumbbells	60-90 sec	5-Day Workout Plan - Day 1	2025-10-02 20:49:05.67	2025-10-02 20:49:05.67
cmg9w1lv500b59ifnwsj8m6tg	cmg5my5c8006b7ugxku7kf08s	cmg9w1d2q00a39ifnzyeixf3o	2	1	2	15 each direction	bodyweight	30 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:05.777	2025-10-02 20:49:05.777
cmg9w1ly500b79ifnclrqi7ag	cmg5my5c8006b7ugxku7kf08s	cmg9w1d5q00a49ifnans426vk	2	2	2	12	bodyweight	30 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:05.886	2025-10-02 20:49:05.886
cmg9w1m1i00b99ifniew1akhd	cmg5my5c8006b7ugxku7kf08s	cmg9w1d8x00a59ifn7gi9qo7h	2	3	2	15 each side	bodyweight	30 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:06.006	2025-10-02 20:49:06.006
cmg9w1m4j00bb9ifn7i63ul3i	cmg5my5c8006b7ugxku7kf08s	cmg9w1dc900a69ifn3nlsvb8w	2	4	2	12	cable	30 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:06.115	2025-10-02 20:49:06.115
cmg9w1m7o00bd9ifn0osmn25u	cmg5my5c8006b7ugxku7kf08s	cmg9w1df700a79ifnkx8y3uon	2	5	2	12	dumbbell	30 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:06.229	2025-10-02 20:49:06.229
cmg9w1mar00bf9ifnripie7c3	cmg5my5c8006b7ugxku7kf08s	cmg6oxlqn000sanebs9l2qn6z	2	6	4	12	cable	60-90 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:06.34	2025-10-02 20:49:06.34
cmg9w1mdv00bh9ifn8415x1c9	cmg5my5c8006b7ugxku7kf08s	cmg9vwxz400159ifnop2ykr8f	2	7	4	12	dumbbell	60-90 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:06.451	2025-10-02 20:49:06.451
cmg9w1mha00bj9ifn0oyt5snz	cmg5my5c8006b7ugxku7kf08s	cmg9w1di800a89ifnu83ecc5b	2	8	4	12	cable	60-90 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:06.574	2025-10-02 20:49:06.574
cmg9w1mkh00bl9ifnr831max2	cmg5my5c8006b7ugxku7kf08s	cmg6oxmb0000wanebjr0ezlvq	2	9	4	12	dumbbell	60-90 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:06.689	2025-10-02 20:49:06.689
cmg9w1mne00bn9ifnh3skor2x	cmg5my5c8006b7ugxku7kf08s	cmg6oxlle000ranebjndcuz34	2	10	4	12	cable	60-90 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:06.795	2025-10-02 20:49:06.795
cmg9w1mqe00bp9ifns10non4x	cmg5my5c8006b7ugxku7kf08s	cmg3zldad004fc2fk8ddp7771	2	11	3	30 sec	bodyweight	30 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:06.903	2025-10-02 20:49:06.903
cmg9w1mtb00br9ifnpy0tcj9s	cmg5my5c8006b7ugxku7kf08s	cmg6oxnzz0017anebn2fh43qd	2	12	3	20 each side	bodyweight	30 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:07.008	2025-10-02 20:49:07.008
cmg9w1mwg00bt9ifn5mwplztz	cmg5my5c8006b7ugxku7kf08s	cmg9vz9fk00539ifnrc0h0ay8	2	13	3	12	bodyweight	30 sec	5-Day Workout Plan - Day 2	2025-10-02 20:49:07.121	2025-10-02 20:49:07.121
cmg9w1n0d00bv9ifn9qfb49yp	cmg5my5c8006b7ugxku7kf08s	cmg6oxk23000haneb7w81712a	3	1	2	12	bodyweight	30 sec	5-Day Workout Plan - Day 3	2025-10-02 20:49:07.262	2025-10-02 20:49:07.262
cmg9w1n4300bx9ifnf1pxcqi3	cmg5my5c8006b7ugxku7kf08s	cmg9w1cq9009z9ifndf7sosrs	3	2	2	12 each leg	bodyweight	30 sec	5-Day Workout Plan - Day 3	2025-10-02 20:49:07.395	2025-10-02 20:49:07.395
cmg9w1n7200bz9ifnykr5fwoo	cmg5my5c8006b7ugxku7kf08s	cmg9w1dle00a99ifnkbyoends	3	3	2	12 each side	resistance band	30 sec	5-Day Workout Plan - Day 3	2025-10-02 20:49:07.503	2025-10-02 20:49:07.503
cmg9w1naf00c19ifn5zrw9x8c	cmg5my5c8006b7ugxku7kf08s	cmg9w1doo00aa9ifnzrftusfj	3	4	2	12 each side	resistance band	30 sec	5-Day Workout Plan - Day 3	2025-10-02 20:49:07.623	2025-10-02 20:49:07.623
cmg9w1ndm00c39ifn2eghz0aq	cmg5my5c8006b7ugxku7kf08s	cmg9w1dru00ab9ifnahyeyule	3	5	2	10 each leg	bodyweight	30 sec	5-Day Workout Plan - Day 3	2025-10-02 20:49:07.738	2025-10-02 20:49:07.738
cmg9w1nh100c59ifn5u25qy0q	cmg5my5c8006b7ugxku7kf08s	cmg6oxkii000kanebga7y2ik3	3	6	4	12	barbell	60-90 sec	5-Day Workout Plan - Day 3	2025-10-02 20:49:07.861	2025-10-02 20:49:07.861
cmg9w1nkn00c79ifn6laefziz	cmg5my5c8006b7ugxku7kf08s	cmg6oxkzm000naneb8i9o6vfw	3	7	4	10 each leg	bodyweight	60-90 sec	5-Day Workout Plan - Day 3	2025-10-02 20:49:07.992	2025-10-02 20:49:07.992
cmg9w1no700c99ifns0ipkm7t	cmg5my5c8006b7ugxku7kf08s	cmg3zldad004ec2fksif5bhwy	3	8	4	12 each leg	cable	60-90 sec	5-Day Workout Plan - Day 3	2025-10-02 20:49:08.12	2025-10-02 20:49:08.12
cmg9w1nr900cb9ifn0o9k9701	cmg5my5c8006b7ugxku7kf08s	cmg6oxktt000manebt1xkmvj2	3	9	4	12	barbell	60-90 sec	5-Day Workout Plan - Day 3	2025-10-02 20:49:08.229	2025-10-02 20:49:08.229
cmg9w1nuc00cd9ifnkpvjewuz	cmg5my5c8006b7ugxku7kf08s	cmg3zldad004ac2fkh3gpiii1	3	10	4	15	machine	60-90 sec	5-Day Workout Plan - Day 3	2025-10-02 20:49:08.34	2025-10-02 20:49:08.34
cmg9w1nxc00cf9ifntchm97j0	cmg5my5c8006b7ugxku7kf08s	cmg6oxjgq000daneb7tk3o2in	4	1	2	15 each direction	bodyweight	30 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:08.448	2025-10-02 20:49:08.448
cmg9w1o0900ch9ifngvd89g2t	cmg5my5c8006b7ugxku7kf08s	cmg6oxjlz000eanebh85eapjc	4	2	2	15 each direction	bodyweight	30 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:08.554	2025-10-02 20:49:08.554
cmg9w1o3f00cj9ifnuf857vy8	cmg5my5c8006b7ugxku7kf08s	cmg9w1duq00ac9ifne6dqfjfn	4	3	2	12	bodyweight	30 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:08.667	2025-10-02 20:49:08.667
cmg9w1oad00cl9ifnupcoxdxo	cmg5my5c8006b7ugxku7kf08s	cmg5n37tu00727ugxdib9bni2	4	4	2	12	light dumbbells	30 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:08.918	2025-10-02 20:49:08.918
cmg9w1odj00cn9ifndeutp49c	cmg5my5c8006b7ugxku7kf08s	cmg9w1dxm00ad9ifnob8cgj2y	4	5	2	12	light dumbbells	30 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:09.032	2025-10-02 20:49:09.032
cmg9w1ogn00cp9ifnfdpm2wv6	cmg5my5c8006b7ugxku7kf08s	cmg6oxmq4000yanebdn56f5y8	4	6	4	12	machine	60-90 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:09.144	2025-10-02 20:49:09.144
cmg9w1ojs00cr9ifnn5eus9e7	cmg5my5c8006b7ugxku7kf08s	cmg6oxmvq000zaneb3k4tu479	4	7	4	12	machine	60-90 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:09.256	2025-10-02 20:49:09.256
cmg9vzgh800589ifnneoa12px	cmg5mxlai006a7ugxzugssbg1	cmg6oxion0009anebip168yat	1	1	2	15	bodyweight	30 sec	4-Day Workout Plan - Day 1	2025-10-02 20:47:25.484	2025-10-02 20:47:25.484
cmg9vzgkh005a9ifnxnmwygsi	cmg5mxlai006a7ugxzugssbg1	cmg6oxk23000haneb7w81712a	1	2	2	12	bodyweight	30 sec	4-Day Workout Plan - Day 1	2025-10-02 20:47:25.602	2025-10-02 20:47:25.602
cmg9v0yzs000tc3flpgbo5176	cmg418zs8000w6reaop5d59tc	cmg6oxion0009anebip168yat	1	14	3	15	bodyweight	30 sec	Default exercise for Day 1	2025-10-02 20:20:36.521	2025-10-02 20:21:38.107
cmg9v0ywf000rc3flho7wtmyn	cmg418zs8000w6reaop5d59tc	cmg6oxl9e000panebd69ar91r	1	13	4	15	machine	60-90 sec	Default exercise for Day 1	2025-10-02 20:20:36.399	2025-10-02 20:21:38.132
cmg9v0xrx0003c3flg58bt6sw	cmg418zs8000w6reaop5d59tc	cmg6oxidp0007anebvrw7a1uw	1	1	2	30 sec	bodyweight	20-30 sec	Default exercise for Day 1	2025-10-02 20:20:34.942	2025-10-02 20:22:01.589
cmg9vzgng005c9ifn3fu8bw0b	cmg5mxlai006a7ugxzugssbg1	cmg9vwxjk00109ifnr0ftsuq7	1	3	2	10 each leg	bodyweight	30 sec	4-Day Workout Plan - Day 1	2025-10-02 20:47:25.708	2025-10-02 20:47:25.708
cmg9vzgqe005e9ifn4g2kskz4	cmg5mxlai006a7ugxzugssbg1	cmg9vwxn600119ifnp2m1ot2p	1	4	2	10 each side	resistance band	30 sec	4-Day Workout Plan - Day 1	2025-10-02 20:47:25.814	2025-10-02 20:47:25.814
cmg9v0y2p0009c3fl2oi6hpiw	cmg418zs8000w6reaop5d59tc	cmg6oxitw000aanebbdeueabz	1	4	2	12 each leg	bodyweight	20-30 sec	Default exercise for Day 1	2025-10-02 20:20:35.33	2025-10-02 20:21:38.102
cmg9v0z2v000vc3flzpdiihhr	cmg418zs8000w6reaop5d59tc	cmg6oxkii000kanebga7y2ik3	1	15	3	15	bodyweight	30 sec	Default exercise for Day 1	2025-10-02 20:20:36.632	2025-10-02 20:21:38.153
cmg9vzgte005g9ifnt06qpc76	cmg5mxlai006a7ugxzugssbg1	cmg9vwxq100129ifnzcrqve6v	1	5	2	12 each side	bodyweight	30 sec	4-Day Workout Plan - Day 1	2025-10-02 20:47:25.923	2025-10-02 20:47:25.923
cmg9v0ygb000hc3fl7og66cbr	cmg418zs8000w6reaop5d59tc	cmg6oxkii000kanebga7y2ik3	1	8	4	12	barbell	60-90 sec	Default exercise for Day 1	2025-10-02 20:20:35.82	2025-10-02 20:21:38.113
cmg9v0y91000dc3flz2xxny5e	cmg418zs8000w6reaop5d59tc	cmg6oxk7a000ianebcjw1pcmz	1	6	2	12 each side	bodyweight	30 sec	Default exercise for Day 1	2025-10-02 20:20:35.558	2025-10-02 20:21:38.106
cmg9vzgwo005i9ifn3gkk4xz8	cmg5mxlai006a7ugxzugssbg1	cmg6oxknq000lanebp0nujp5g	1	6	4	12	barbell	60-90 sec	4-Day Workout Plan - Day 1	2025-10-02 20:47:26.04	2025-10-02 20:47:26.04
cmg9v0yt3000pc3flhcpgky14	cmg418zs8000w6reaop5d59tc	cmg6oxl4m000oanebqnl24tbd	1	12	4	12 each leg	cable	60-90 sec	Default exercise for Day 1	2025-10-02 20:20:36.279	2025-10-02 20:21:38.122
cmg9vzgzz005k9ifnhytfz4rq	cmg5mxlai006a7ugxzugssbg1	cmg6oxktt000manebt1xkmvj2	1	7	4	12	barbell	60-90 sec	4-Day Workout Plan - Day 1	2025-10-02 20:47:26.159	2025-10-02 20:47:26.159
cmg9vzh31005m9ifnkmjrt6ns	cmg5mxlai006a7ugxzugssbg1	cmg6oxitw000aanebbdeueabz	1	8	4	12 each leg	bodyweight	60-90 sec	4-Day Workout Plan - Day 1	2025-10-02 20:47:26.27	2025-10-02 20:47:26.27
cmg9vzh6c005o9ifnzyzs85u0	cmg5mxlai006a7ugxzugssbg1	cmg3zc6rn000ic2fkipmq2ses	1	9	4	15	machine	60-90 sec	4-Day Workout Plan - Day 1	2025-10-02 20:47:26.389	2025-10-02 20:47:26.389
cmg9vzh9n005q9ifnwq8294oz	cmg5mxlai006a7ugxzugssbg1	cmg9vwxt600139ifnozfsdlfv	1	10	4	15	bodyweight	60-90 sec	4-Day Workout Plan - Day 1	2025-10-02 20:47:26.507	2025-10-02 20:47:26.507
cmg9vzhd6005s9ifn854v2jnj	cmg5mxlai006a7ugxzugssbg1	cmg6oxp7k001eanebtr4dq6jf	1	11	3	10	bodyweight	30 sec	4-Day Workout Plan - Day 1	2025-10-02 20:47:26.635	2025-10-02 20:47:26.635
cmg9vzhgb005u9ifnmxj058l2	cmg5mxlai006a7ugxzugssbg1	cmg6oxiz0000baneb8tjt30gt	2	1	2	15 each direction	bodyweight	30 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:26.748	2025-10-02 20:47:26.748
cmg9vzhjr005w9ifn3q7b40nx	cmg5mxlai006a7ugxzugssbg1	cmg9vwxw400149ifnlmesicu6	2	2	2	12	bodyweight	30 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:26.871	2025-10-02 20:47:26.871
cmg9vzhmt005y9ifngdz31gcc	cmg5mxlai006a7ugxzugssbg1	cmg9vwxz400159ifnop2ykr8f	2	3	2	12	light dumbbells	30 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:26.982	2025-10-02 20:47:26.982
cmg9vzhqm00609ifn16ttqskf	cmg5mxlai006a7ugxzugssbg1	cmg6oxn0m0010anebgfhqha5t	2	4	2	12	resistance band	30 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:27.118	2025-10-02 20:47:27.118
cmg9vzhtu00629ifnonu6f5wz	cmg5mxlai006a7ugxzugssbg1	cmg3zflrk0021c2fkwwkzywmo	2	5	2	10	bodyweight	30 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:27.234	2025-10-02 20:47:27.234
cmg9vzhx300649ifn07q304hy	cmg5mxlai006a7ugxzugssbg1	cmg6oxlqn000sanebs9l2qn6z	2	6	4	12	cable	60-90 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:27.352	2025-10-02 20:47:27.352
cmg9vzi0200669ifnlfnppswy	cmg5mxlai006a7ugxzugssbg1	cmg6oxlvo000tanebm3rv4rvy	2	7	4	12	cable	60-90 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:27.458	2025-10-02 20:47:27.458
cmg9vzi3300689ifnhd1pyqb2	cmg5mxlai006a7ugxzugssbg1	cmg9vwy5100179ifnol68x1by	2	8	4	12	cable	60-90 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:27.567	2025-10-02 20:47:27.567
cmg9vzi6e006a9ifnfauemm7p	cmg5mxlai006a7ugxzugssbg1	cmg9vz9c500529ifno8ow0e3g	2	9	4	12	dumbbell	60-90 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:27.686	2025-10-02 20:47:27.686
cmg9vzi9m006c9ifnp9tl3ucj	cmg5mxlai006a7ugxzugssbg1	cmg6oxlle000ranebjndcuz34	2	10	4	12	cable	60-90 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:27.803	2025-10-02 20:47:27.803
cmg9vzicq006e9ifnbomf2ddk	cmg5mxlai006a7ugxzugssbg1	cmg3zldad004fc2fk8ddp7771	2	11	3	30 sec	bodyweight	30 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:27.914	2025-10-02 20:47:27.914
cmg9vzift006g9ifns7jj5ffs	cmg5mxlai006a7ugxzugssbg1	cmg6oxnzz0017anebn2fh43qd	2	12	3	20 each side	bodyweight	30 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:28.026	2025-10-02 20:47:28.026
cmg9vziit006i9ifnxsu8f6bu	cmg5mxlai006a7ugxzugssbg1	cmg9vz9fk00539ifnrc0h0ay8	2	13	3	12	bodyweight	30 sec	4-Day Workout Plan - Day 2	2025-10-02 20:47:28.134	2025-10-02 20:47:28.134
cmg9vzilv006k9ifneyhx2s2b	cmg5mxlai006a7ugxzugssbg1	cmg6oxk23000haneb7w81712a	3	1	2	12	bodyweight	30 sec	4-Day Workout Plan - Day 3	2025-10-02 20:47:28.243	2025-10-02 20:47:28.243
cmg9vzipb006m9ifnjncbotca	cmg5mxlai006a7ugxzugssbg1	cmg6oxion0009anebip168yat	3	2	2	15	bodyweight	30 sec	4-Day Workout Plan - Day 3	2025-10-02 20:47:28.367	2025-10-02 20:47:28.367
cmg9vzis9006o9ifn7z34lhdh	cmg5mxlai006a7ugxzugssbg1	cmg9vwxjk00109ifnr0ftsuq7	3	3	2	10 each leg	bodyweight	30 sec	4-Day Workout Plan - Day 3	2025-10-02 20:47:28.473	2025-10-02 20:47:28.473
cmg9vzivk006q9ifnhn9daiqc	cmg5mxlai006a7ugxzugssbg1	cmg9vwxn600119ifnp2m1ot2p	3	4	2	10 each side	resistance band	30 sec	4-Day Workout Plan - Day 3	2025-10-02 20:47:28.593	2025-10-02 20:47:28.593
cmg9vziyt006s9ifnmjoz7n94	cmg5mxlai006a7ugxzugssbg1	cmg9vwxq100129ifnzcrqve6v	3	5	2	12 each side	bodyweight	30 sec	4-Day Workout Plan - Day 3	2025-10-02 20:47:28.709	2025-10-02 20:47:28.709
cmg9vzj1w006u9ifnbqhryltb	cmg5mxlai006a7ugxzugssbg1	cmg6oxkii000kanebga7y2ik3	3	6	4	12	barbell	60-90 sec	4-Day Workout Plan - Day 3	2025-10-02 20:47:28.82	2025-10-02 20:47:28.82
cmg9vzj4x006w9ifnvhxskylw	cmg5mxlai006a7ugxzugssbg1	cmg6oxkzm000naneb8i9o6vfw	3	7	4	10 each leg	bodyweight	60-90 sec	4-Day Workout Plan - Day 3	2025-10-02 20:47:28.93	2025-10-02 20:47:28.93
cmg9vzj7y006y9ifn71yvaeo6	cmg5mxlai006a7ugxzugssbg1	cmg6oxktt000manebt1xkmvj2	3	8	4	12	barbell	60-90 sec	4-Day Workout Plan - Day 3	2025-10-02 20:47:29.039	2025-10-02 20:47:29.039
cmg9v0zcz0011c3flj4mjbmpb	cmg418zs8000w6reaop5d59tc	cmg6oxidp0007anebvrw7a1uw	2	1	2	30 sec	bodyweight	20-30 sec	Default exercise for Day 2	2025-10-02 20:20:36.996	2025-10-02 20:20:36.996
cmg9v0zgr0013c3fll4p0lyb0	cmg418zs8000w6reaop5d59tc	cmg6oxiz0000baneb8tjt30gt	2	2	2	15 each direction	bodyweight	20-30 sec	Default exercise for Day 2	2025-10-02 20:20:37.131	2025-10-02 20:20:37.131
cmg9v0zkh0015c3flsd9huadw	cmg418zs8000w6reaop5d59tc	cmg3zldad003xc2fkj8w9akgb	2	3	2	10	bodyweight	20-30 sec	Default exercise for Day 2	2025-10-02 20:20:37.265	2025-10-02 20:20:37.265
cmg9v0zri0019c3fln5vwm4fo	cmg418zs8000w6reaop5d59tc	cmg6oxlez000qanebmmqrfx7a	2	5	2	12	bodyweight	30 sec	Default exercise for Day 2	2025-10-02 20:20:37.518	2025-10-02 20:20:37.518
cmg9v0zuv001bc3flmd1avwoe	cmg418zs8000w6reaop5d59tc	cmg6oxlle000ranebjndcuz34	2	6	2	12	resistance band	30 sec	Default exercise for Day 2	2025-10-02 20:20:37.639	2025-10-02 20:20:37.639
cmg9v0zy8001dc3fl4rg4q5rh	cmg418zs8000w6reaop5d59tc	cmg6oxm5o000vaneb8obgmfvy	2	7	2	12	cable	30 sec	Default exercise for Day 2	2025-10-02 20:20:37.76	2025-10-02 20:20:37.76
cmg9v101s001fc3fl97wsjo4v	cmg418zs8000w6reaop5d59tc	cmg6oxlqn000sanebs9l2qn6z	2	8	4	12	cable	60-90 sec	Default exercise for Day 2	2025-10-02 20:20:37.888	2025-10-02 20:20:37.888
cmg9v1059001hc3flp17wpwf8	cmg418zs8000w6reaop5d59tc	cmg6oxlvo000tanebm3rv4rvy	2	9	4	12	cable	60-90 sec	Default exercise for Day 2	2025-10-02 20:20:38.014	2025-10-02 20:20:38.014
cmg9v10bk001jc3fly3213pfe	cmg418zs8000w6reaop5d59tc	cmg6oxm0v000uanebyrbh30v6	2	10	4	10 each arm	dumbbell	60-90 sec	Default exercise for Day 2	2025-10-02 20:20:38.241	2025-10-02 20:20:38.241
cmg9v10eu001lc3fl1ajjidju	cmg418zs8000w6reaop5d59tc	cmg6oxm5o000vaneb8obgmfvy	2	11	4	12	cable	60-90 sec	Default exercise for Day 2	2025-10-02 20:20:38.358	2025-10-02 20:20:38.358
cmg9v10jd001nc3flolibgqp3	cmg418zs8000w6reaop5d59tc	cmg6oxmb0000wanebjr0ezlvq	2	12	4	12	dumbbell	60-90 sec	Default exercise for Day 2	2025-10-02 20:20:38.521	2025-10-02 20:20:38.521
cmg9v10oi001pc3fllh5saik7	cmg418zs8000w6reaop5d59tc	cmg6oxmki000xaneb2yd3ns2s	2	13	4	10	bodyweight	60-90 sec	Default exercise for Day 2	2025-10-02 20:20:38.707	2025-10-02 20:20:38.707
cmg9v10rs001rc3fl010ut5ml	cmg418zs8000w6reaop5d59tc	cmg6oxnzz0017anebn2fh43qd	2	14	3	20 each side	bodyweight	30 sec	Default exercise for Day 2	2025-10-02 20:20:38.824	2025-10-02 20:20:38.824
cmg9v10uy001tc3fltvvamwo2	cmg418zs8000w6reaop5d59tc	cmg6oxo5i0018anebnlnucybv	2	15	3	15	bodyweight	30 sec	Default exercise for Day 2	2025-10-02 20:20:38.939	2025-10-02 20:20:38.939
cmg9v10yn001vc3flumfef4zn	cmg418zs8000w6reaop5d59tc	cmg6oxoad0019aneb1ttwbl43	2	16	3	20 each side	bodyweight	30 sec	Default exercise for Day 2	2025-10-02 20:20:39.072	2025-10-02 20:20:39.072
cmg9v112p001xc3fl6zji5ndu	cmg418zs8000w6reaop5d59tc	cmg6oxoud001canebdh3ti1sf	2	17	3	30 sec	bodyweight	30 sec	Default exercise for Day 2	2025-10-02 20:20:39.217	2025-10-02 20:20:39.217
cmg9v115o001zc3flbib6kmfy	cmg418zs8000w6reaop5d59tc	cmg6oxjgq000daneb7tk3o2in	3	1	2	15 each direction	bodyweight	20-30 sec	Default exercise for Day 3	2025-10-02 20:20:39.325	2025-10-02 20:20:39.325
cmg9v118z0021c3flfkw83byl	cmg418zs8000w6reaop5d59tc	cmg6oxjlz000eanebh85eapjc	3	2	2	15 each direction	bodyweight	20-30 sec	Default exercise for Day 3	2025-10-02 20:20:39.444	2025-10-02 20:20:39.444
cmg9v11cb0023c3flattbu50a	cmg418zs8000w6reaop5d59tc	cmg6oxjrc000fanebd54o42gh	3	3	2	10	bodyweight	20-30 sec	Default exercise for Day 3	2025-10-02 20:20:39.564	2025-10-02 20:20:39.564
cmg9v11fk0025c3flkho7hvs5	cmg418zs8000w6reaop5d59tc	cmg6oxjwv000ganebm2os799f	3	4	2	30 sec	bodyweight	20-30 sec	Default exercise for Day 3	2025-10-02 20:20:39.68	2025-10-02 20:20:39.68
cmg9v11ir0027c3fl0i45jknf	cmg418zs8000w6reaop5d59tc	cmg6oxn0m0010anebgfhqha5t	3	5	2	12	resistance band	30 sec	Default exercise for Day 3	2025-10-02 20:20:39.795	2025-10-02 20:20:39.795
cmg9v11mf0029c3fl0ygpu603	cmg418zs8000w6reaop5d59tc	cmg6oxn630011aneb0ldmrjms	3	6	2	12	light dumbbells	30 sec	Default exercise for Day 3	2025-10-02 20:20:39.928	2025-10-02 20:20:39.928
cmg9v11pl002bc3fl5uuzs332	cmg418zs8000w6reaop5d59tc	cmg6oxnpt0015anebzhyj8ggm	3	7	2	12	light dumbbells	30 sec	Default exercise for Day 3	2025-10-02 20:20:40.042	2025-10-02 20:20:40.042
cmg9v11so002dc3flluyixkqp	cmg418zs8000w6reaop5d59tc	cmg6oxmq4000yanebdn56f5y8	3	8	4	12	machine	60-90 sec	Default exercise for Day 3	2025-10-02 20:20:40.153	2025-10-02 20:20:40.153
cmg9v11vw002fc3fl3m7gliia	cmg418zs8000w6reaop5d59tc	cmg6oxmvq000zaneb3k4tu479	3	9	4	12	machine	60-90 sec	Default exercise for Day 3	2025-10-02 20:20:40.269	2025-10-02 20:20:40.269
cmg9v11yv002hc3fllro52w5v	cmg418zs8000w6reaop5d59tc	cmg6oxnaw0012anebdmxi8w6q	3	10	4	12	dumbbells	60-90 sec	Default exercise for Day 3	2025-10-02 20:20:40.375	2025-10-02 20:20:40.375
cmg9v122b002jc3flco4bsbgf	cmg418zs8000w6reaop5d59tc	cmg6oxnfx0013aneb2aqa81je	3	11	4	12	dumbbells	60-90 sec	Default exercise for Day 3	2025-10-02 20:20:40.5	2025-10-02 20:20:40.5
cmg9v125m002lc3fldkpmw1c9	cmg418zs8000w6reaop5d59tc	cmg6oxnkv0014anebsvb52sjz	3	12	4	12	dumbbells	60-90 sec	Default exercise for Day 3	2025-10-02 20:20:40.619	2025-10-02 20:20:40.619
cmg9v128z002nc3fl091msdax	cmg418zs8000w6reaop5d59tc	cmg6oxnpt0015anebzhyj8ggm	3	13	4	12	dumbbells	60-90 sec	Default exercise for Day 3	2025-10-02 20:20:40.739	2025-10-02 20:20:40.739
cmg9v12c3002pc3fl1cgeyssb	cmg418zs8000w6reaop5d59tc	cmg6oxnuu0016aneb3v4e898g	3	14	4	12	dumbbells	60-90 sec	Default exercise for Day 3	2025-10-02 20:20:40.851	2025-10-02 20:20:40.851
cmg9v12f7002rc3flgcojxdeb	cmg418zs8000w6reaop5d59tc	cmg6oxnzz0017anebn2fh43qd	3	15	3	20	bodyweight	30 sec	Default exercise for Day 3	2025-10-02 20:20:40.964	2025-10-02 20:20:40.964
cmg9v12ik002tc3flstx25syq	cmg418zs8000w6reaop5d59tc	cmg6oxok4001aanebhpcj0q5k	3	16	3	20 each side	bodyweight	30 sec	Default exercise for Day 3	2025-10-02 20:20:41.085	2025-10-02 20:20:41.085
cmg9v12lu002vc3fl04qxfucm	cmg418zs8000w6reaop5d59tc	cmg6oxope001banebw327eb27	3	17	3	15	bodyweight	30 sec	Default exercise for Day 3	2025-10-02 20:20:41.202	2025-10-02 20:20:41.202
cmg9v12p5002xc3fl9l3vuw03	cmg418zs8000w6reaop5d59tc	cmg6oxoud001canebdh3ti1sf	3	18	3	30 sec	bodyweight	30 sec	Default exercise for Day 3	2025-10-02 20:20:41.321	2025-10-02 20:20:41.321
cmg9v12s7002zc3fl7g4fysu6	cmg418zs8000w6reaop5d59tc	cmg6oxp2r001daneb1r62vm8l	3	19	3	20 each leg	bodyweight	30 sec	Default exercise for Day 3	2025-10-02 20:20:41.431	2025-10-02 20:20:41.431
cmg9vzjaw00709ifn6qn2y4xh	cmg5mxlai006a7ugxzugssbg1	cmg3zflrl002ic2fkibmsic9o	3	9	4	12 each leg	cable	60-90 sec	4-Day Workout Plan - Day 3	2025-10-02 20:47:29.144	2025-10-02 20:47:29.144
cmg9vzje700729ifnlwtsappr	cmg5mxlai006a7ugxzugssbg1	cmg9vz9in00549ifnanek6lme	3	10	4	12 each leg	bodyweight	60-90 sec	4-Day Workout Plan - Day 3	2025-10-02 20:47:29.263	2025-10-02 20:47:29.263
cmg9vzjhe00749ifntpiuobnj	cmg5mxlai006a7ugxzugssbg1	cmg6oxknq000lanebp0nujp5g	3	11	3	15	bodyweight	30 sec	4-Day Workout Plan - Day 3	2025-10-02 20:47:29.378	2025-10-02 20:47:29.378
cmg9v0yjg000jc3fl9g30q8r4	cmg418zs8000w6reaop5d59tc	cmg6oxion0009anebip168yat	1	9	4	12	barbell	60-90 sec	Default exercise for Day 1	2025-10-02 20:20:35.932	2025-10-02 20:21:38.113
cmg9v0z9v000zc3flh53ov61d	cmg418zs8000w6reaop5d59tc	cmg6oxpfu001fanebxp9wj79p	1	18	2	30 sec on/15 sec rest	jump rope	30 sec	Default exercise for Day 1	2025-10-02 20:20:36.883	2025-10-02 20:21:38.143
cmg9v0z66000xc3fl7lvinxlo	cmg418zs8000w6reaop5d59tc	cmg6oxoud001canebdh3ti1sf	1	16	3	30 sec	bodyweight	30 sec	Default exercise for Day 1	2025-10-02 20:20:36.75	2025-10-02 20:21:38.14
cmg9v0y5v000bc3flrel6q1x7	cmg418zs8000w6reaop5d59tc	cmg6oxk23000haneb7w81712a	1	5	2	12	bodyweight	30 sec	Default exercise for Day 1	2025-10-02 20:20:35.443	2025-10-02 20:21:38.097
cmg9v0xyx0007c3flhjwd4m7z	cmg418zs8000w6reaop5d59tc	cmg6oxion0009anebip168yat	1	3	2	15	bodyweight	20-30 sec	Default exercise for Day 1	2025-10-02 20:20:35.193	2025-10-02 20:21:38.108
cmg9v0ypr000nc3flfe22lki0	cmg418zs8000w6reaop5d59tc	cmg6oxkzm000naneb8i9o6vfw	1	11	4	10 each leg	dumbbells	60-90 sec	Default exercise for Day 1	2025-10-02 20:20:36.159	2025-10-02 20:21:38.117
cmg9v0ymo000lc3fl3ppvvxsp	cmg418zs8000w6reaop5d59tc	cmg6oxktt000manebt1xkmvj2	1	10	4	12	barbell	60-90 sec	Default exercise for Day 1	2025-10-02 20:20:36.049	2025-10-02 20:21:38.118
cmg9v0xvg0005c3fls94kww8m	cmg418zs8000w6reaop5d59tc	cmg6oxije0008aneb4cr2jxwr	1	2	2	30 sec	bodyweight	20-30 sec	Default exercise for Day 1	2025-10-02 20:20:35.068	2025-10-02 20:21:38.12
cmg9vzjke00769ifn6wpwegju	cmg5mxlai006a7ugxzugssbg1	cmg6oxjgq000daneb7tk3o2in	4	1	2	15 each direction	bodyweight	30 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:29.486	2025-10-02 20:47:29.486
cmg9vzjnj00789ifnjun39l83	cmg5mxlai006a7ugxzugssbg1	cmg6oxjlz000eanebh85eapjc	4	2	2	15 each direction	bodyweight	30 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:29.599	2025-10-02 20:47:29.599
cmg9vzjqe007a9ifnjqndu4is	cmg5mxlai006a7ugxzugssbg1	cmg9vz9mn00559ifneyvat67g	4	3	2	12	light dumbbells	30 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:29.702	2025-10-02 20:47:29.702
cmg9vzjt9007c9ifnhakncse6	cmg5mxlai006a7ugxzugssbg1	cmg6oxn0m0010anebgfhqha5t	4	4	2	12	resistance band	30 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:29.806	2025-10-02 20:47:29.806
cmg9vzjwa007e9ifnn1w73qt5	cmg5mxlai006a7ugxzugssbg1	cmg3zflrk0021c2fkwwkzywmo	4	5	2	10	bodyweight	30 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:29.914	2025-10-02 20:47:29.914
cmg9vzjzc007g9ifnje2vre6x	cmg5mxlai006a7ugxzugssbg1	cmg9vz9pe00569ifnzvxkgc8r	4	6	4	12	dumbbells	60-90 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:30.024	2025-10-02 20:47:30.024
cmg9vzk2c007i9ifnd83my9lt	cmg5mxlai006a7ugxzugssbg1	cmg5n37tu00727ugxdib9bni2	4	7	4	12	dumbbells	60-90 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:30.132	2025-10-02 20:47:30.132
cmg9vzk5z007k9ifnan9l4kmg	cmg5mxlai006a7ugxzugssbg1	cmg9vwy2500169ifn7cwmizk5	4	8	4	12	dumbbells	60-90 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:30.264	2025-10-02 20:47:30.264
cmg9vzk8z007m9ifnveztpuwh	cmg5mxlai006a7ugxzugssbg1	cmg6oxnfx0013aneb2aqa81je	4	9	4	12	dumbbells	60-90 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:30.371	2025-10-02 20:47:30.371
cmg9vzkbx007o9ifngfwrzh7h	cmg5mxlai006a7ugxzugssbg1	cmg9vwy5100179ifnol68x1by	4	10	4	12	cable	60-90 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:30.477	2025-10-02 20:47:30.477
cmg9vzkew007q9ifnj070v8na	cmg5mxlai006a7ugxzugssbg1	cmg3zldad004fc2fk8ddp7771	4	11	3	30 sec	bodyweight	30 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:30.585	2025-10-02 20:47:30.585
cmg9vx35m00199ifnlg9addsc	cmg5mwv6p00697ugxjqzod8j1	cmg6oxk23000haneb7w81712a	1	1	2	12	bodyweight	30 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:34.906	2025-10-02 20:45:34.906
cmg9vx38o001b9ifnycts2jcd	cmg5mwv6p00697ugxjqzod8j1	cmg6oxion0009anebip168yat	1	2	2	15	bodyweight	30 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:35.016	2025-10-02 20:45:35.016
cmg9vx3bw001d9ifnnw77uhfc	cmg5mwv6p00697ugxjqzod8j1	cmg9vwxjk00109ifnr0ftsuq7	1	3	2	10 each leg	bodyweight	30 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:35.133	2025-10-02 20:45:35.133
cmg9vx3g8001f9ifnecpxnoqb	cmg5mwv6p00697ugxjqzod8j1	cmg9vwxn600119ifnp2m1ot2p	1	4	2	10 each side	resistance band	30 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:35.288	2025-10-02 20:45:35.288
cmg9vx3jb001h9ifn33ryeepk	cmg5mwv6p00697ugxjqzod8j1	cmg9vwxq100129ifnzcrqve6v	1	5	2	12 each side	resistance band	30 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:35.399	2025-10-02 20:45:35.399
cmg9vx3mo001j9ifn1zi8vaaq	cmg5mwv6p00697ugxjqzod8j1	cmg6oxkii000kanebga7y2ik3	1	6	4	12	barbell	60-90 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:35.521	2025-10-02 20:45:35.521
cmg9vx3q5001l9ifnk275iupe	cmg5mwv6p00697ugxjqzod8j1	cmg6oxknq000lanebp0nujp5g	1	7	4	12	dumbbell	60-90 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:35.645	2025-10-02 20:45:35.645
cmg9vx3ta001n9ifnfg2jyc6t	cmg5mwv6p00697ugxjqzod8j1	cmg6oxktt000manebt1xkmvj2	1	8	4	12	barbell	60-90 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:35.758	2025-10-02 20:45:35.758
cmg9vx3wt001p9ifnpcdmnszl	cmg5mwv6p00697ugxjqzod8j1	cmg6oxkzm000naneb8i9o6vfw	1	9	4	10 each leg	bodyweight	60-90 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:35.885	2025-10-02 20:45:35.885
cmg9vx40c001r9ifnaj6fvabv	cmg5mwv6p00697ugxjqzod8j1	cmg3zc6rn000mc2fkizr5yw9l	1	10	4	12 each leg	cable	60-90 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:36.012	2025-10-02 20:45:36.012
cmg9vx43q001t9ifnxjctem7a	cmg5mwv6p00697ugxjqzod8j1	cmg9vwxt600139ifnozfsdlfv	1	11	4	15	bodyweight	60-90 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:36.135	2025-10-02 20:45:36.135
cmg9vx46z001v9ifnivto9qwm	cmg5mwv6p00697ugxjqzod8j1	cmg6oxknq000lanebp0nujp5g	1	12	3	15	bodyweight	30 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:36.251	2025-10-02 20:45:36.251
cmg9vx4a3001x9ifn2qp5uz0u	cmg5mwv6p00697ugxjqzod8j1	cmg6oxp7k001eanebtr4dq6jf	1	13	3	10	bodyweight	30 sec	2-Day Workout Plan - Day 1	2025-10-02 20:45:36.363	2025-10-02 20:45:36.363
cmg9vx4d8001z9ifnpzoel5ya	cmg5mwv6p00697ugxjqzod8j1	cmg6oxiz0000baneb8tjt30gt	2	1	2	15 each direction	bodyweight	30 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:36.476	2025-10-02 20:45:36.476
cmg9vx4gg00219ifn52fau87t	cmg5mwv6p00697ugxjqzod8j1	cmg9vwxw400149ifnlmesicu6	2	2	2	12	bodyweight	30 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:36.592	2025-10-02 20:45:36.592
cmg9vx4jp00239ifn77qq5uos	cmg5mwv6p00697ugxjqzod8j1	cmg9vwxz400159ifnop2ykr8f	2	3	2	12	light dumbbells	30 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:36.71	2025-10-02 20:45:36.71
cmg9vx4mt00259ifnkdauzkyg	cmg5mwv6p00697ugxjqzod8j1	cmg6oxn0m0010anebgfhqha5t	2	4	2	12	resistance band	30 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:36.821	2025-10-02 20:45:36.821
cmg9vx4qe00279ifn27664zoh	cmg5mwv6p00697ugxjqzod8j1	cmg3zldad003xc2fkj8w9akgb	2	5	2	10	bodyweight	30 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:36.951	2025-10-02 20:45:36.951
cmg9vx4th00299ifntmaebss1	cmg5mwv6p00697ugxjqzod8j1	cmg6oxlqn000sanebs9l2qn6z	2	6	4	12	cable	60-90 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:37.062	2025-10-02 20:45:37.062
cmg9vx4wt002b9ifnbchwnr1l	cmg5mwv6p00697ugxjqzod8j1	cmg6oxlvo000tanebm3rv4rvy	2	7	4	12	cable	60-90 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:37.181	2025-10-02 20:45:37.181
cmg9vx50f002d9ifn9shy3h0p	cmg5mwv6p00697ugxjqzod8j1	cmg5n37tu00727ugxdib9bni2	2	8	4	12	dumbbells	60-90 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:37.311	2025-10-02 20:45:37.311
cmg9vx53j002f9ifnn2wj01pr	cmg5mwv6p00697ugxjqzod8j1	cmg6oxmq4000yanebdn56f5y8	2	9	4	12	machine	60-90 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:37.424	2025-10-02 20:45:37.424
cmg9vx56r002h9ifnmqw6c8g7	cmg5mwv6p00697ugxjqzod8j1	cmg9vwy2500169ifn7cwmizk5	2	10	4	12	dumbbells	60-90 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:37.539	2025-10-02 20:45:37.539
cmg9vx5a8002j9ifnfw6wu2w8	cmg5mwv6p00697ugxjqzod8j1	cmg9vwy5100179ifnol68x1by	2	11	4	12	cable	60-90 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:37.664	2025-10-02 20:45:37.664
cmg9vx5db002l9ifnksv3y4o9	cmg5mwv6p00697ugxjqzod8j1	cmg3zc6rn000nc2fk1o7b32st	2	12	3	30 sec	bodyweight	30 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:37.776	2025-10-02 20:45:37.776
cmg9vx5h0002n9ifnb8hgszkp	cmg5mwv6p00697ugxjqzod8j1	cmg6oxoud001canebdh3ti1sf	2	13	3	20 sec each side	bodyweight	30 sec	2-Day Workout Plan - Day 2	2025-10-02 20:45:37.908	2025-10-02 20:45:37.908
cmg9vzki7007s9ifn86f2izq1	cmg5mxlai006a7ugxzugssbg1	cmg6oxoud001canebdh3ti1sf	4	12	3	20 sec each side	bodyweight	30 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:30.703	2025-10-02 20:47:30.703
cmg9vzkld007u9ifnnctheire	cmg5mxlai006a7ugxzugssbg1	cmg6oxoad0019aneb1ttwbl43	4	13	3	20 each side	bodyweight	30 sec	4-Day Workout Plan - Day 4	2025-10-02 20:47:30.817	2025-10-02 20:47:30.817
cmg9w1omv00ct9ifn7687p1rw	cmg5my5c8006b7ugxku7kf08s	cmg5n37tu00727ugxdib9bni2	4	8	4	12	dumbbells	60-90 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:09.368	2025-10-02 20:49:09.368
cmg9w1opv00cv9ifnimhumgi6	cmg5my5c8006b7ugxku7kf08s	cmg6oxnfx0013aneb2aqa81je	4	9	4	12	dumbbells	60-90 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:09.476	2025-10-02 20:49:09.476
cmg9w1ot200cx9ifn4bntl1fb	cmg5my5c8006b7ugxku7kf08s	cmg6oxnpt0015anebzhyj8ggm	4	10	4	12	dumbbells	60-90 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:09.59	2025-10-02 20:49:09.59
cmg9w1owc00cz9ifnysejcy4h	cmg5my5c8006b7ugxku7kf08s	cmg6oxnuu0016aneb3v4e898g	4	11	4	12	dumbbells	60-90 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:09.708	2025-10-02 20:49:09.708
cmg9w1ozm00d19ifndbizfi60	cmg5my5c8006b7ugxku7kf08s	cmg6oxoud001canebdh3ti1sf	4	12	3	20 sec each side	bodyweight	30 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:09.827	2025-10-02 20:49:09.827
cmg9w1p6i00d39ifn30dul3ga	cmg5my5c8006b7ugxku7kf08s	cmg9w1e0z00ae9ifnz182lpvq	4	13	3	15	dumbbell	30 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:10.074	2025-10-02 20:49:10.074
cmg9w1p9o00d59ifnd2hw6dhr	cmg5my5c8006b7ugxku7kf08s	cmg6oxo5i0018anebnlnucybv	4	14	3	15	bodyweight	30 sec	5-Day Workout Plan - Day 4	2025-10-02 20:49:10.188	2025-10-02 20:49:10.188
cmg9w1pde00d79ifn2diwscek	cmg5my5c8006b7ugxku7kf08s	cmg6oxion0009anebip168yat	5	1	2	15	bodyweight	30 sec	5-Day Workout Plan - Day 5	2025-10-02 20:49:10.323	2025-10-02 20:49:10.323
cmg9w1pgh00d99ifn43xd90fe	cmg5my5c8006b7ugxku7kf08s	cmg9w1ckb009y9ifnvc9hfv7n	5	2	2	10 each side	bodyweight	30 sec	5-Day Workout Plan - Day 5	2025-10-02 20:49:10.434	2025-10-02 20:49:10.434
cmg9w1pjm00db9ifnjelwd6ft	cmg5my5c8006b7ugxku7kf08s	cmg9w1e3x00af9ifnmknv2ka3	5	3	2	10 each ankle	bodyweight	30 sec	5-Day Workout Plan - Day 5	2025-10-02 20:49:10.546	2025-10-02 20:49:10.546
cmg9w1pnh00dd9ifn4odfly5x	cmg5my5c8006b7ugxku7kf08s	cmg6oxk23000haneb7w81712a	5	4	2	12	bodyweight	30 sec	5-Day Workout Plan - Day 5	2025-10-02 20:49:10.685	2025-10-02 20:49:10.685
cmg9w1pr800df9ifn2lxbj301	cmg5my5c8006b7ugxku7kf08s	cmg9w1cq9009z9ifndf7sosrs	5	5	2	12 each leg	bodyweight	30 sec	5-Day Workout Plan - Day 5	2025-10-02 20:49:10.821	2025-10-02 20:49:10.821
cmg9w1pv800dh9ifnf9v7vbaz	cmg5my5c8006b7ugxku7kf08s	cmg6oxknq000lanebp0nujp5g	5	6	4	12	barbell	60-90 sec	5-Day Workout Plan - Day 5	2025-10-02 20:49:10.965	2025-10-02 20:49:10.965
cmg9w1pyk00dj9ifnnv29qnw0	cmg5my5c8006b7ugxku7kf08s	cmg6oxktt000manebt1xkmvj2	5	7	4	12	barbell	60-90 sec	5-Day Workout Plan - Day 5	2025-10-02 20:49:11.084	2025-10-02 20:49:11.084
cmg9w1q2500dl9ifnafxm43mb	cmg5my5c8006b7ugxku7kf08s	cmg3zldad004ac2fkh3gpiii1	5	8	4	15	machine	60-90 sec	5-Day Workout Plan - Day 5	2025-10-02 20:49:11.213	2025-10-02 20:49:11.213
cmg9w1q5800dn9ifn5803s0z5	cmg5my5c8006b7ugxku7kf08s	cmg6oxitw000aanebbdeueabz	5	9	4	12 each leg	dumbbells	60-90 sec	5-Day Workout Plan - Day 5	2025-10-02 20:49:11.324	2025-10-02 20:49:11.324
cmg9w1q8l00dp9ifnk6m98c3i	cmg5my5c8006b7ugxku7kf08s	cmg9vwxt600139ifnozfsdlfv	5	10	4	15	bodyweight	60-90 sec	5-Day Workout Plan - Day 5	2025-10-02 20:49:11.445	2025-10-02 20:49:11.445
cmg9w3dvp00ef9ifnjn3p073m	cmg5mqvqr00687ugxbn6qis7s	cmg9w39ch00e69ifns1p9g065	1	1	1	5 min	light pace	0 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:28.742	2025-10-02 20:50:28.742
cmg9w3e0l00eh9ifn3bgp7k0f	cmg5mqvqr00687ugxbn6qis7s	cmg9w39ft00e79ifns7lqnjlv	1	2	2	10-15	bodyweight	30 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:28.918	2025-10-02 20:50:28.918
cmg9w3e3m00ej9ifnqc696p4l	cmg5mqvqr00687ugxbn6qis7s	cmg9w39j000e89ifnsfrng233	1	3	2	10-12	bodyweight	30 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:29.026	2025-10-02 20:50:29.026
cmg9w3e6f00el9ifnink4816o	cmg5mqvqr00687ugxbn6qis7s	cmg6oxion0009anebip168yat	1	4	2	12-15	bodyweight	30 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:29.127	2025-10-02 20:50:29.127
cmg9w3e9f00en9ifnotwr2bxl	cmg5mqvqr00687ugxbn6qis7s	cmg9w1ckb009y9ifnvc9hfv7n	1	5	2	8-12 per leg	bodyweight	30 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:29.236	2025-10-02 20:50:29.236
cmg9w3ece00ep9ifngecw1qhm	cmg5mqvqr00687ugxbn6qis7s	cmg3zflrk002bc2fky2koxldn	1	6	3	12	bodyweight/dumbbells	60-90 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:29.343	2025-10-02 20:50:29.343
cmg9w3ef900er9ifnbseohf9b	cmg5mqvqr00687ugxbn6qis7s	cmg9w39m000e99ifnmbas8z3r	1	7	3	12	dumbbells/cable	60-90 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:29.446	2025-10-02 20:50:29.446
cmg9w3eib00et9ifnuh8mp8e6	cmg5mqvqr00687ugxbn6qis7s	cmg6oxmq4000yanebdn56f5y8	1	8	3	12	machine/dumbbells	60-90 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:29.555	2025-10-02 20:50:29.555
cmg9w3elz00ev9ifnxhlsu433	cmg5mqvqr00687ugxbn6qis7s	cmg6oxnfx0013aneb2aqa81je	1	9	3	12	dumbbells	60-90 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:29.688	2025-10-02 20:50:29.688
cmg9w3eqf00ex9ifnk8mav9tk	cmg5mqvqr00687ugxbn6qis7s	cmg3zflrk0028c2fkusultmlh	1	10	3	12	dumbbells/cable	60-90 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:29.848	2025-10-02 20:50:29.848
cmg9w3etd00ez9ifn33ete3ru	cmg5mqvqr00687ugxbn6qis7s	cmg9w39p100ea9ifn6ms6m3e7	1	11	3	12	dumbbells/cable	60-90 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:29.953	2025-10-02 20:50:29.953
cmg9w3ewj00f19ifnhqcfuzjw	cmg5mqvqr00687ugxbn6qis7s	cmg3zc6rn000nc2fk1o7b32st	1	12	3	20-30 sec	bodyweight	60-90 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:30.067	2025-10-02 20:50:30.067
cmg9w3ezk00f39ifnoufu30dm	cmg5mqvqr00687ugxbn6qis7s	cmg6oxpfu001fanebxp9wj79p	1	13	4	20 sec jump/40 sec rest	jump rope	40 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:30.176	2025-10-02 20:50:30.176
cmg9w3f2n00f59ifnab2pt5nv	cmg5mqvqr00687ugxbn6qis7s	cmg9w39sg00eb9ifnucmuywuo	1	14	1	1-2 min	bodyweight	0 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:30.287	2025-10-02 20:50:30.287
cmg9w3f5p00f79ifnck2f9aba	cmg5mqvqr00687ugxbn6qis7s	cmg9w39vc00ec9ifnmq7led3m	1	15	1	1-2 min	bodyweight	0 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:30.397	2025-10-02 20:50:30.397
cmg9w3f8o00f99ifnn2shkljt	cmg5mqvqr00687ugxbn6qis7s	cmg9w39ya00ed9ifn1bads3s2	1	16	1	1-2 min	bodyweight	0 sec	1-Day Workout Plan - Day 1	2025-10-02 20:50:30.504	2025-10-02 20:50:30.504
\.


--
-- Data for Name: workouts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workouts (id, name, category, difficulty, duration, exercises, "trainingType", clients, status, description, created, "lastUsed", "createdAt", "updatedAt", "userId") FROM stdin;
cmg5mxlai006a7ugxzugssbg1	4-Days Workout Plan	Strength Training	Intermediate to Advanced	60	48	strength	0	active		2025-09-29 21:22:57.096	2025-09-29 21:22:57.096	2025-09-29 21:22:57.096	2025-10-04 06:00:34.718	\N
cmg5my5c8006b7ugxku7kf08s	5-Days Workout Plan	Strength Training	Advanced	60	59	strength	0	active		2025-09-29 21:23:23.144	2025-09-29 21:23:23.144	2025-09-29 21:23:23.144	2025-10-03 23:08:10.967	\N
cmg418zs8000w6reaop5d59tc	3x per week - Complete Body	Full Body	Intermediate	60	53	strength	3	active		2025-09-28 18:28:11.432	2025-09-28 20:57:31.151	2025-09-28 18:28:11.432	2025-10-04 06:00:43.143	\N
cmg5mqvqr00687ugxbn6qis7s	Full-Body Workout – 1 Day / Week	Full Body	Beginner to Advanced	60	16	strength	0	active		2025-09-29 21:17:44.116	2025-09-29 21:17:44.116	2025-09-29 21:17:44.116	2025-10-04 06:00:58.067	\N
cmg5mwv6p00697ugxjqzod8j1	2-Days Workout Plan	Strength Training	Beginner to Intermediate	60	26	strength	0	active		2025-09-29 21:22:23.329	2025-09-29 21:22:23.329	2025-09-29 21:22:23.329	2025-10-04 06:00:14.167	\N
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-10-09 13:11:30
20211116045059	2025-10-09 13:11:32
20211116050929	2025-10-09 13:11:34
20211116051442	2025-10-09 13:11:35
20211116212300	2025-10-09 13:11:37
20211116213355	2025-10-09 13:11:39
20211116213934	2025-10-09 13:11:40
20211116214523	2025-10-09 13:11:41
20211122062447	2025-10-09 13:11:41
20211124070109	2025-10-09 13:11:42
20211202204204	2025-10-09 13:11:42
20211202204605	2025-10-09 13:11:42
20211210212804	2025-10-09 13:11:42
20211228014915	2025-10-09 13:11:43
20220107221237	2025-10-09 13:11:43
20220228202821	2025-10-09 13:11:43
20220312004840	2025-10-09 13:11:43
20220603231003	2025-10-09 13:11:44
20220603232444	2025-10-09 13:11:44
20220615214548	2025-10-09 13:11:44
20220712093339	2025-10-09 13:11:45
20220908172859	2025-10-09 13:11:45
20220916233421	2025-10-09 13:11:45
20230119133233	2025-10-09 13:11:45
20230128025114	2025-10-09 13:11:46
20230128025212	2025-10-09 13:11:46
20230227211149	2025-10-09 13:11:46
20230228184745	2025-10-09 13:11:46
20230308225145	2025-10-09 13:11:46
20230328144023	2025-10-09 13:11:47
20231018144023	2025-10-09 13:11:47
20231204144023	2025-10-09 13:11:47
20231204144024	2025-10-09 13:11:47
20231204144025	2025-10-09 13:11:48
20240108234812	2025-10-09 13:11:48
20240109165339	2025-10-09 13:11:48
20240227174441	2025-10-09 13:11:48
20240311171622	2025-10-09 13:11:49
20240321100241	2025-10-09 13:11:49
20240401105812	2025-10-09 13:11:50
20240418121054	2025-10-09 13:11:50
20240523004032	2025-10-09 13:11:51
20240618124746	2025-10-09 13:11:52
20240801235015	2025-10-09 13:11:52
20240805133720	2025-10-09 13:11:52
20240827160934	2025-10-09 13:11:52
20240919163303	2025-10-09 13:11:52
20240919163305	2025-10-09 13:11:53
20241019105805	2025-10-09 13:11:53
20241030150047	2025-10-09 13:11:54
20241108114728	2025-10-09 13:11:54
20241121104152	2025-10-09 13:11:54
20241130184212	2025-10-09 13:11:55
20241220035512	2025-10-09 13:11:55
20241220123912	2025-10-09 13:11:55
20241224161212	2025-10-09 13:11:55
20250107150512	2025-10-09 13:11:55
20250110162412	2025-10-09 13:11:56
20250123174212	2025-10-09 13:11:56
20250128220012	2025-10-09 13:11:56
20250506224012	2025-10-09 13:11:56
20250523164012	2025-10-09 13:11:57
20250714121412	2025-10-09 13:11:57
20250905041441	2025-10-09 13:11:57
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-10-09 13:11:28.225331
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-10-09 13:11:28.246851
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-10-09 13:11:28.253744
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-10-09 13:11:28.288898
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-10-09 13:11:28.297565
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-10-09 13:11:28.300565
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-10-09 13:11:28.305435
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-10-09 13:11:28.319209
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-10-09 13:11:28.322138
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-10-09 13:11:28.326591
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-10-09 13:11:28.330669
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-10-09 13:11:28.334996
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-10-09 13:11:28.339035
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-10-09 13:11:28.342353
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-10-09 13:11:28.345687
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-10-09 13:11:28.363253
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-10-09 13:11:28.366556
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-10-09 13:11:28.369891
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-10-09 13:11:28.393174
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-10-09 13:11:28.399373
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-10-09 13:11:28.403734
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-10-09 13:11:28.422289
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-10-09 13:11:28.434925
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-10-09 13:11:28.446141
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-10-09 13:11:28.450689
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-10-09 13:11:28.454569
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-10-09 13:11:28.458808
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-10-09 13:11:28.469141
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-10-09 13:11:28.477398
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-10-09 13:11:28.481753
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-10-09 13:11:28.486569
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-10-09 13:11:28.512998
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-10-09 13:11:28.519583
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-10-09 13:11:28.52636
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-10-09 13:11:28.671578
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-10-09 13:11:28.680527
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-10-09 13:11:28.873037
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-10-09 13:11:28.886211
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-10-09 13:11:28.897202
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2025-10-09 13:11:28.905574
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2025-10-09 13:11:28.909462
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2025-10-09 13:11:28.917433
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2025-10-09 13:11:28.921918
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2025-10-09 13:11:28.926842
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: customer_measurements customer_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_measurements
    ADD CONSTRAINT customer_measurements_pkey PRIMARY KEY (id);


--
-- Name: customer_nutrition_plans customer_nutrition_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_nutrition_plans
    ADD CONSTRAINT customer_nutrition_plans_pkey PRIMARY KEY (id);


--
-- Name: customer_photos customer_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_photos
    ADD CONSTRAINT customer_photos_pkey PRIMARY KEY (id);


--
-- Name: customer_progression customer_progression_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_progression
    ADD CONSTRAINT customer_progression_pkey PRIMARY KEY (id);


--
-- Name: customer_schedule_assignments customer_schedule_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_schedule_assignments
    ADD CONSTRAINT customer_schedule_assignments_pkey PRIMARY KEY (id);


--
-- Name: customer_workouts customer_workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_workouts
    ADD CONSTRAINT customer_workouts_pkey PRIMARY KEY (id);


--
-- Name: exercise_set_logs exercise_set_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_set_logs
    ADD CONSTRAINT exercise_set_logs_pkey PRIMARY KEY (id);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: launch_notifications launch_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_notifications
    ADD CONSTRAINT launch_notifications_pkey PRIMARY KEY (id);


--
-- Name: nutrition_calculations nutrition_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_calculations
    ADD CONSTRAINT nutrition_calculations_pkey PRIMARY KEY (id);


--
-- Name: nutrition_plans nutrition_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_plans
    ADD CONSTRAINT nutrition_plans_pkey PRIMARY KEY (id);


--
-- Name: online_coaching_registrations online_coaching_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_coaching_registrations
    ADD CONSTRAINT online_coaching_registrations_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: pricing_calculations pricing_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_calculations
    ADD CONSTRAINT pricing_calculations_pkey PRIMARY KEY (id);


--
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: todos todos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_pkey PRIMARY KEY (id);


--
-- Name: training_sessions training_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workout_exercises workout_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT workout_exercises_pkey PRIMARY KEY (id);


--
-- Name: workouts workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: customer_nutrition_plans_customerId_nutritionPlanId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "customer_nutrition_plans_customerId_nutritionPlanId_key" ON public.customer_nutrition_plans USING btree ("customerId", "nutritionPlanId");


--
-- Name: customer_photos_customerId_week_position_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "customer_photos_customerId_week_position_key" ON public.customer_photos USING btree ("customerId", week, "position");


--
-- Name: customer_schedule_assignments_customerId_weekday_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "customer_schedule_assignments_customerId_weekday_key" ON public.customer_schedule_assignments USING btree ("customerId", weekday);


--
-- Name: customer_workouts_customerId_workoutId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "customer_workouts_customerId_workoutId_key" ON public.customer_workouts USING btree ("customerId", "workoutId");


--
-- Name: exercise_set_logs_prog_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercise_set_logs_prog_idx ON public.exercise_set_logs USING btree (customer_id, training_day, exercise_id, created_at);


--
-- Name: exercise_set_logs_sid_exid_set_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX exercise_set_logs_sid_exid_set_uq ON public.exercise_set_logs USING btree (session_id, exercise_id, set_number);


--
-- Name: ingredients_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ingredients_name_key ON public.ingredients USING btree (name);


--
-- Name: launch_notifications_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX launch_notifications_email_key ON public.launch_notifications USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: achievements achievements_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_measurements customer_measurements_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_measurements
    ADD CONSTRAINT "customer_measurements_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_nutrition_plans customer_nutrition_plans_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_nutrition_plans
    ADD CONSTRAINT "customer_nutrition_plans_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_nutrition_plans customer_nutrition_plans_nutritionPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_nutrition_plans
    ADD CONSTRAINT "customer_nutrition_plans_nutritionPlanId_fkey" FOREIGN KEY ("nutritionPlanId") REFERENCES public.nutrition_plans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_photos customer_photos_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_photos
    ADD CONSTRAINT "customer_photos_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_progression customer_progression_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_progression
    ADD CONSTRAINT "customer_progression_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_schedule_assignments customer_schedule_assignments_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_schedule_assignments
    ADD CONSTRAINT "customer_schedule_assignments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_schedule_assignments customer_schedule_assignments_workoutId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_schedule_assignments
    ADD CONSTRAINT "customer_schedule_assignments_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES public.workouts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_workouts customer_workouts_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_workouts
    ADD CONSTRAINT "customer_workouts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_workouts customer_workouts_workoutId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_workouts
    ADD CONSTRAINT "customer_workouts_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES public.workouts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: goals goals_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: nutrition_plans nutrition_plans_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_plans
    ADD CONSTRAINT "nutrition_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: online_coaching_registrations online_coaching_registrations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_coaching_registrations
    ADD CONSTRAINT "online_coaching_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recipe_ingredients recipe_ingredients_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT "recipe_ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public.recipes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: todos todos_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT "todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_sessions training_sessions_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT "training_sessions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workout_exercises workout_exercises_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT "workout_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public.exercises(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workout_exercises workout_exercises_workoutId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT "workout_exercises_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES public.workouts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workouts workouts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT "workouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: -
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: -
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: -
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: -
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: -
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: -
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: -
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: -
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: -
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: -
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE achievements; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.achievements TO anon;
GRANT ALL ON TABLE public.achievements TO authenticated;
GRANT ALL ON TABLE public.achievements TO service_role;


--
-- Name: TABLE customer_measurements; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.customer_measurements TO anon;
GRANT ALL ON TABLE public.customer_measurements TO authenticated;
GRANT ALL ON TABLE public.customer_measurements TO service_role;


--
-- Name: TABLE customer_nutrition_plans; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.customer_nutrition_plans TO anon;
GRANT ALL ON TABLE public.customer_nutrition_plans TO authenticated;
GRANT ALL ON TABLE public.customer_nutrition_plans TO service_role;


--
-- Name: TABLE customer_photos; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.customer_photos TO anon;
GRANT ALL ON TABLE public.customer_photos TO authenticated;
GRANT ALL ON TABLE public.customer_photos TO service_role;


--
-- Name: TABLE customer_progression; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.customer_progression TO anon;
GRANT ALL ON TABLE public.customer_progression TO authenticated;
GRANT ALL ON TABLE public.customer_progression TO service_role;


--
-- Name: TABLE customer_schedule_assignments; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.customer_schedule_assignments TO anon;
GRANT ALL ON TABLE public.customer_schedule_assignments TO authenticated;
GRANT ALL ON TABLE public.customer_schedule_assignments TO service_role;


--
-- Name: TABLE customer_workouts; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.customer_workouts TO anon;
GRANT ALL ON TABLE public.customer_workouts TO authenticated;
GRANT ALL ON TABLE public.customer_workouts TO service_role;


--
-- Name: TABLE exercise_set_logs; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.exercise_set_logs TO anon;
GRANT ALL ON TABLE public.exercise_set_logs TO authenticated;
GRANT ALL ON TABLE public.exercise_set_logs TO service_role;


--
-- Name: TABLE exercises; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.exercises TO anon;
GRANT ALL ON TABLE public.exercises TO authenticated;
GRANT ALL ON TABLE public.exercises TO service_role;


--
-- Name: TABLE goals; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.goals TO anon;
GRANT ALL ON TABLE public.goals TO authenticated;
GRANT ALL ON TABLE public.goals TO service_role;


--
-- Name: TABLE ingredients; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.ingredients TO anon;
GRANT ALL ON TABLE public.ingredients TO authenticated;
GRANT ALL ON TABLE public.ingredients TO service_role;


--
-- Name: TABLE launch_notifications; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.launch_notifications TO anon;
GRANT ALL ON TABLE public.launch_notifications TO authenticated;
GRANT ALL ON TABLE public.launch_notifications TO service_role;


--
-- Name: TABLE nutrition_calculations; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.nutrition_calculations TO anon;
GRANT ALL ON TABLE public.nutrition_calculations TO authenticated;
GRANT ALL ON TABLE public.nutrition_calculations TO service_role;


--
-- Name: TABLE nutrition_plans; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.nutrition_plans TO anon;
GRANT ALL ON TABLE public.nutrition_plans TO authenticated;
GRANT ALL ON TABLE public.nutrition_plans TO service_role;


--
-- Name: TABLE online_coaching_registrations; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.online_coaching_registrations TO anon;
GRANT ALL ON TABLE public.online_coaching_registrations TO authenticated;
GRANT ALL ON TABLE public.online_coaching_registrations TO service_role;


--
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;


--
-- Name: TABLE pricing_calculations; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.pricing_calculations TO anon;
GRANT ALL ON TABLE public.pricing_calculations TO authenticated;
GRANT ALL ON TABLE public.pricing_calculations TO service_role;


--
-- Name: TABLE recipe_ingredients; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.recipe_ingredients TO anon;
GRANT ALL ON TABLE public.recipe_ingredients TO authenticated;
GRANT ALL ON TABLE public.recipe_ingredients TO service_role;


--
-- Name: TABLE recipes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.recipes TO anon;
GRANT ALL ON TABLE public.recipes TO authenticated;
GRANT ALL ON TABLE public.recipes TO service_role;


--
-- Name: TABLE services; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.services TO anon;
GRANT ALL ON TABLE public.services TO authenticated;
GRANT ALL ON TABLE public.services TO service_role;


--
-- Name: TABLE todos; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.todos TO anon;
GRANT ALL ON TABLE public.todos TO authenticated;
GRANT ALL ON TABLE public.todos TO service_role;


--
-- Name: TABLE training_sessions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.training_sessions TO anon;
GRANT ALL ON TABLE public.training_sessions TO authenticated;
GRANT ALL ON TABLE public.training_sessions TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE workout_exercises; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.workout_exercises TO anon;
GRANT ALL ON TABLE public.workout_exercises TO authenticated;
GRANT ALL ON TABLE public.workout_exercises TO service_role;


--
-- Name: TABLE workouts; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.workouts TO anon;
GRANT ALL ON TABLE public.workouts TO authenticated;
GRANT ALL ON TABLE public.workouts TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: -
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: -
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: -
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: -
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: -
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: -
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: -
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: -
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict A4MdYm0uom25wulKEyEOzPBuHF5z9cm4dikAGVw1A71ZRdP7Q20m4KWtzYZx5Z2

