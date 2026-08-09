# Commented questions — Salesforce Certified Identity and Access Management Architect

1 comment on 1 question.

---

## Q14  `4ab56a8c`  _[Identity Management Concepts]_

Universal Containers (UC) has a mobile application for its employees that uses data from Salesforce as well as uses Salesforce for Authentication purposes. UC wants its mobile users to only enter their credentials the first time they run the app. The application has been live for a little over 6 months, and all of the users who were part of the initial launch are complaining that they have to re-authenticate. UC has also recently changed the URI Scheme associated with the mobile app. What should the architect at UC first investigate?

- A. Verify that the Callback URL is correctly pointing to the new URI Scheme.
- B. Validate that the users are checking the box to remember their passwords.
- C. Confirm that the access token's Time-To-Live policy has been set appropriately.
- **D. Check the Refresh Token policy defined in the Salesforce Connected App.**

**Current answer: D**

> The fact that exactly the initial-launch cohort (~6 months ago) is now hitting re-auth points at a refresh-token expiration: many Connected Apps default 'Refresh token is valid until revoked' but can be set to expire after a fixed period. The Connected App's Refresh Token policy is the first thing to check.

### Comments
- **elzepe99** (2026-07-02): i'm so in love with this app <3
