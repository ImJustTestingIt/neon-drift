# HIPAA Health Intake Form

This library asset documents the health intake starter project that was requested alongside the Neon Drift admin resources. It is intended as implementation guidance, not a legal certification of HIPAA compliance.

## What The Starter Includes

- A patient-facing intake form for contact details, symptoms, medications, allergies, insurance, and consent.
- A Node.js API endpoint that accepts intake submissions.
- A PostgreSQL schema for storing submitted records.
- Helmet security headers and a stricter content security policy.
- Environment-based configuration for deployment.

## HIPAA-Oriented Hosting Checklist

1. Use a hosting provider that will sign a Business Associate Agreement before any electronic protected health information is handled.
2. Use a managed PostgreSQL database or equivalent service that is covered by the same BAA or by a separate BAA.
3. Enforce TLS for every browser and API request.
4. Encrypt database storage and backups at rest.
5. Restrict administrative access with unique accounts, MFA, least privilege roles, and audit logging.
6. Keep secrets in the hosting platform secret manager, not in committed files.
7. Log access to submitted records, security-relevant changes, and failed authentication attempts.
8. Define retention, backup, incident response, and breach notification procedures with counsel or a compliance lead.
9. Run a risk analysis before production use and repeat it after material infrastructure or workflow changes.

## Database Setup

Create a dedicated database and least-privilege application user. The app user should be allowed to insert intake submissions and read only the tables the application actually needs.

Example table shape:

```sql
create table intake_submissions (
  id bigserial primary key,
  submitted_at timestamptz not null default now(),
  patient_name text not null,
  date_of_birth date,
  phone text,
  email text,
  symptoms text,
  medications text,
  allergies text,
  insurance_provider text,
  consent_to_contact boolean not null default false
);
```

## Environment Variables

Use `.env.example` as the template and set real values only in the deployment environment.

## Important Boundary

A static site or starter project cannot make a workflow HIPAA compliant by itself. Compliance also depends on BAAs, access controls, employee training, policies, audit procedures, risk analysis, and operational discipline.
