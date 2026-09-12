# Salesforce Certified Platform Identity and Access Management Architect — Study Guide

**Built from the 116 questions in `salesforce_iam_architect_questions_corrected.json`,
cross-checked against the official exam outline and the documentation those questions cite.**

Every fact below traces to a rendered Salesforce page (see [Sources](#16-sources)) or to this
deck's own fact-check passes. Where the exam's expected answer and today's platform disagree,
that is called out in [§13 Answers that are right for the exam and wrong for
production](#13-answers-that-are-right-for-the-exam-and-wrong-for-production) — and on this exam
that section matters more than usual, because the item bank is pinned to **Summer '23** and
identity is the part of the platform Salesforce has changed most since.

---

## 1. The exam, factually

| | |
|---|---|
| Official name | Salesforce Certified **Platform** Identity and Access Management Architect |
| Content | **60 scored** multiple-choice / multiple-select questions + up to 5 unscored |
| Time | **120 minutes** (2 min per question) |
| Passing score | **65%** → you need **39 of 60** |
| Prerequisite | None |
| Fee | US$400 (retake US$200) |
| **Release alignment** | **Summer '23** |

**The alignment row is the one to remember.** My Domain is still something an org "decides not
to set up". The User-Agent flow is still the mobile answer. Person Accounts are still enabled by
"contacting Salesforce Support". Embedded Login is still a recommended way to put Salesforce
login on an external site. All four are wrong today and right on the exam — §13 lists every case.
Answer as of Summer '23.

The questions are scenario-shaped: a company, a set of systems, a requirement, and four
solutions that all name real features. The skill being tested is usually **which role each
system plays** (who is the IdP, who is the SP, who holds the resource) and **which mechanism
fires at which moment** (at login, on first login, on a status change, on every API call). Decide
those two things before reading the options.

---

## 2. Where the points actually are

Official outline weightings against the deck. The deck came tagged with six categories of its
own ("Single Sign-On", "Identity Governance", "Integration with IdPs"…) that do not map onto the
outline's six domains, so the column below is an independent re-classification of all 116
questions (`study-guides/reclassify-iam.mjs` holds the per-question calls).

| Domain | Weight | ≈ Questions | Deck | Verdict |
|---|---:|---:|---:|---|
| Identity Management Concepts | 17% | ~10 | 12 (10.3%) | **under-trained** |
| Accepting Third-Party Identity in Salesforce | 21% | ~13 | 24 (20.7%) | about right |
| Salesforce as an Identity Provider | 17% | ~10 | 35 (30.2%) | over-represented |
| Access Management Best Practices | 15% | ~9 | 18 (15.5%) | about right |
| Salesforce Identity | 12% | ~7 | 9 (7.8%) | **under-trained** |
| Community (Partner and Customer) | 18% | ~11 | 18 (15.5%) | slightly under-trained |

### The gap you need to close

This deck is better balanced than the others in this repo — no domain is off by more than a
factor of two. The skew is that **nearly a third of the deck is OAuth flows and scopes**, which
is a sixth of the exam. Someone who drills the deck to 100% will be excellent at "which OAuth
flow" and comparatively thin on the conceptual domain (trust, certificates, troubleshooting a
broken SSO) and on Salesforce's own identity products and licences.

More useful than the counts is what the deck never asks. Reading all 116 against the outline's
sub-objectives, **eight have no deck item**:

1. **Embedded Login** — a named Community objective ("determine when to use embedded login");
   it appears in the deck only as a wrong option.
2. Salesforce as an **OpenID Connect provider** — `openid` scope, `id_token`, the UserInfo and
   identity-URL endpoints, discovery.
3. The **client credentials flow** and **PKCE** on the web server flow.
4. **Which MFA methods count as MFA** — and that email and SMS codes do not.
5. **SSO troubleshooting tools** — the SAML Assertion Validator, Login History error codes, the
   Identity Provider Event Log.
6. **Event Monitoring** as an audit approach beyond Login History and Login Forensics.
7. **External Identity licence limits** and the complimentary Identity Only licences.
8. The **SAML SSO settings page as a whole** — identity type, identity location, request binding,
   JIT flags — rather than one field per question.

[§3](#3-the-vocabulary-roles-building-blocks-trust), [§9](#9-the-under-trained-12-salesforce-identity-products-and-licences),
[§10](#10-community-experience-cloud-identity) and [§11](#11-troubleshooting-single-sign-on) are
written to cover those from the documentation.

---

## 3. The vocabulary: roles, building blocks, trust

### Who is who — decide this first on every scenario

| Role | Definition | The tell in a stem |
|---|---|---|
| **Identity Provider (IdP)** | Authenticates the user and *asserts* the identity to someone else | "logs in with", "credentials are validated by", "corporate directory" |
| **Service Provider (SP)** | The application the user is trying to reach; *consumes* the assertion | "wants to access", "the resource", "the community" |
| **OAuth Resource Server** | Holds the protected data an access token unlocks | "calls the Salesforce API on the user's behalf" |
| **OAuth Client** | The application holding the token and making the calls | "the mobile app", "the web application" |
| **Authorization Server** | Issues tokens after the user consents | Salesforce, when it is the IdP |

One system holds different roles in different chains. In `c69d99c7` Salesforce is a **SAML SP**
(Okta signs users in) *and* an **OAuth resource server** (a forecasting app calls its API). In
`d182829d` PingFederate is the corporate IdP *and* one Salesforce org is an IdP to downstream
systems. In `9c41e964` Salesforce is **outside the SSO altogether** — only an API call reaches it,
and no user is provisioned. Adding social login to a community (`59e63d81`, `d8945628`) does not
change what Salesforce is protecting; it changes who vouches for the user, so Salesforce stays the
**SP** and Facebook/Google become IdPs.

### The three building blocks

- **Authentication** — proving who you are: password, SAML assertion, OIDC `id_token`, a
  certificate, a second factor.
- **Authorization** — what you may do once in: profiles and permission sets *inside* Salesforce;
  OAuth **scopes** for what a token may touch; connected-app policies for who may use an app.
- **Accountability** — proving afterwards what happened: Login History, Setup Audit Trail, Login
  Forensics, Event Monitoring, the Identity Provider Event Log.

An exam option that answers the wrong block is wrong however true it is: scopes do not
authenticate; MFA does not authorize; a login IP range is an authentication-time control, not
an audit one.

### How trust is established between two systems

| Mechanism | Trust rests on | Notes |
|---|---|---|
| **SAML** | The IdP's **signing certificate**, registered on the SP; the SP's **Entity ID** and ACS URL registered on the IdP | Request signing (SP → IdP) and assertion encryption are optional extras |
| **OAuth / OIDC** | The **consumer key and secret** (client credentials) of a connected app; a **certificate** for the JWT and SAML bearer flows | A secret is only trustworthy on a server — never in a browser or a distributed binary (`5b30e615`) |
| **Delegated Authentication** | Salesforce calling *your* SOAP endpoint over **TLS with a certificate from a CA Salesforce trusts** — it is sending the user's plaintext password (`81c2687b`) | |
| **Two-way (mutual) TLS** | Each side presents a certificate the other validates | Both CA-signed is the normal posture; both self-signed can work if each side installs the other's; **one self-signed, one CA-signed is the combination that does not** (`215bb6ba`) |
| **Signed request (Canvas)** | An HMAC over the request using the connected app's consumer secret | The no-second-login way to embed an external app you control (`714b577a`) |

**Self-signed vs CA-signed** (`2dfae498`): a self-signed certificate costs the *trusting* party
more, because the specific certificate has to be added to their truststore and re-added on every
rotation; a CA-signed one is trusted once at the root. Salesforce's own certificates live under
**Certificate and Key Management**; the roots it accepts for inbound mutual TLS are published at
`/cacerts.jsp`, and mutual authentication needs the **Enforce SSL/TLS Mutual Authentication**
user permission plus port **8443**.

### The protocols in one table

| | SAML 2.0 | OAuth 2.0 | OpenID Connect |
|---|---|---|---|
| Purpose | **Browser SSO** into a web app | **Delegated authorization** — let an app act on a user's (or its own) behalf | **Authentication** layered on OAuth — who the user is, as an `id_token` |
| Artifact | Signed XML **assertion** | **Access token** (+ refresh token) | **`id_token`** (a JWT) + the OAuth tokens |
| Salesforce as consumer | SSO Settings — Salesforce as **SP** (§4) | Auth Provider with a custom OAuth 2.0 config (§5) | **Auth Provider** — OpenID Connect type (§5) |
| Salesforce as issuer | Identity Provider setup + connected app SAML settings (§7) | Connected app OAuth settings — every flow in §7 | Connected app with the **`openid`** scope (§7) |
| Typical exam pairing | Enterprise IdP (Okta, ADFS, Ping) → employees | Mobile / web / server apps → the API | Social login, AWS/Azure-hosted identity, mobile apps needing user identity |

---

## 4. Salesforce as a Service Provider — SAML inbound

The 21% domain. Everything here lives on **Setup → Single Sign-On Settings** plus **My Domain**.

### The SSO settings page, field by field

| Field | What it does | The question it answers |
|---|---|---|
| **Issuer** | The IdP's Entity ID as it appears in the assertion | Mismatch → "Issuer" failure in the validator |
| **Entity ID** | *Salesforce's* identifier to the IdP — `https://<mydomain>.my.salesforce.com` (or `https://saml.salesforce.com`) | How the IdP tells this org from another SP (`a496a22b`); **a second org needs a different Entity ID** (`337c210b`) |
| **Identity Provider Certificate** | Validates the assertion signature | Expired or rotated certificate = every login fails |
| **Request Signing Certificate** | Salesforce signs its `AuthnRequest` with it | Integrity of SP-initiated requests (`e683c669`) — a self-signed one is fine, the IdP is given it explicitly |
| **Assertion Decryption Certificate** | For IdPs that encrypt assertions | — |
| **SAML Identity Type** | Match the user by **Username**, **Federation ID**, or **User ID** | The three valid identifiers (`cadf3745`); Federation ID is the field on the User record that exists for this |
| **SAML Identity Location** | The identifier is in the **Subject `NameIdentifier`** or in an **Attribute** | Wrong location → user not found |
| **Service Provider Initiated Request Binding** | HTTP POST or HTTP Redirect | Must match what the IdP accepts |
| **Identity Provider Login URL** / **Logout URL** / **Custom Error URL** | Where Salesforce sends the `AuthnRequest`; where to send the user after logout; where to send a failed login | — |
| **User Provisioning Enabled** → Standard or Custom SAML JIT | Create/update users from the assertion at login | §6 |

Several SSO configurations can coexist; My Domain's **Authentication Services** list chooses
which appear on the login page.

### My Domain and the two initiation patterns

| | **SP-initiated** | **IdP-initiated** |
|---|---|---|
| Starts at | A Salesforce URL — login page, deep link, mobile app | The IdP's portal or app tile |
| Needs My Domain? | **Yes.** Salesforce must know which IdP to redirect to, and only a unique hostname tells it (`0c8ef9d4`, `4b2727c1`) | No — the IdP posts the assertion to Salesforce's ACS URL, and the assertion identifies the audience |
| Deep linking | **Yes**, via **RelayState** — Salesforce sets it on the request, the IdP echoes it back untouched, Salesforce lands the user on the resource (`ebadac3e`, `5e7db9c7`, `7d8397bd`) | The IdP can set a RelayState / start URL of its own |
| Mobile app SSO, deep links to records (`334e7d60`) | Depends on My Domain | — |
| Pick it when | Users start from Salesforce links | Users live in a corporate portal and follow links out (`29405f7c`) |

**Automatic redirect to the IdP** (`d204351d`): remove **Login Page** from the My Domain
**Authentication Services** list and leave the SAML provider as the only service. **Users
landing on the home tab instead of the record they clicked** (`6849d97f`): the IdP is dropping
or rewriting RelayState — check that first, not the Federation IDs.

### Federating several orgs

- Same IdP, several Salesforce orgs: each org is its own SP with its **own Entity ID**
  (`337c210b`).
- Users move between orgs from one hub: make the **main org the IdP** and the regional orgs SPs
  (`bd3a96b8`); the App Launcher supplies the tiles.
- Partners with one home org per country who need other countries' communities: a partner login
  in the home org and **SAML federation** to the others — configuration, not code (`b9b88960`).

---

## 5. Accepting other identities: Auth Providers and Delegated Authentication

### Authentication Providers (OpenID Connect, social, custom OAuth)

An **Auth Provider** lets users log in to Salesforce or a site with credentials held elsewhere,
over **OpenID Connect or a custom OAuth 2.0 configuration**. Predefined types: Facebook, Google,
LinkedIn, Twitter, Microsoft, Apple, Amazon, GitHub, Janrain, **Salesforce** (another org),
**OpenID Connect** (any compliant provider — the answer for an AWS- or Azure-hosted identity,
`691dfc4d`), and **Custom** (Apex `Auth.AuthProviderPluginClass`). **It has no LDAP capability**
— LDAP is what Delegated Authentication and Identity Connect are for.

Setup: create the provider (consumer key/secret from the external side, endpoints for a custom
one), then enable it on the site's **Login & Registration** page so the button appears
(`c89c6e3d`, `43c8e969`). Two provider settings the exam names: a **custom registration
handler** and a **custom error URL** (`363a20ab`).

**The registration handler is mandatory** for SSO through an auth provider. It is an Apex class
implementing `Auth.RegistrationHandler` with two methods:

- **`createUser(portalId, Auth.UserData data)`** — first login: find a matching user or create one
  (for a site, create the Contact and the User with the right profile). The place to call an
  external system when a customer first arrives (`1084f821`).
- **`updateUser(userId, portalId, data)`** — every later login: keep the Salesforce record in step
  with the provider's profile (`ce735840`).

`b6778f32`: the handler is what **associates** the Facebook identity with a Salesforce user — the
consumer key authenticates the app, the UserInfo endpoint fetches attributes, and only the handler
decides which user they belong to.

### Delegated Authentication

Salesforce keeps the username but **forwards every login attempt to your SOAP web service** and
trusts its answer.

- The WSDL Salesforce publishes defines one method with exactly three inputs — **username,
  password, sourceIp** — returning a **Boolean** (`7cad7778`). The service can use `sourceIp` for
  its own rules.
- **SOAP only.** There is no REST variant; the language behind the endpoint does not matter
  (`cee7f38e` — .NET yes, REST no).
- **TLS with a certificate from a CA Salesforce trusts**, because the request carries the
  plaintext password (`81c2687b`); allow Salesforce's egress IP ranges through the firewall.
- Enabled by Salesforce Support at the org level, then per profile with **Is Single Sign-On
  Enabled**. Users on it **change their password at the external directory**, not in Salesforce
  (`7d27f534`); "Forgot your password" on the Salesforce page does nothing for them.
- It authenticates; it does **not** provision. It is the answer when the requirement is "validate
  credentials against our LDAP directory without an IdP".

### Choosing between the three

| The stem says… | Use |
|---|---|
| A SAML-capable corporate IdP, employees, single corporate password (`e9b93b97`) | **SAML SSO** — Salesforce as SP |
| Social login, an OIDC provider, a credential store on AWS/Azure, another Salesforce org | **Auth Provider** + registration handler |
| "validate the password against LDAP", no IdP in the landscape, users keep Salesforce usernames | **Delegated Authentication** |
| Active Directory *plus* provisioning *plus* desktop SSO | **Identity Connect** (§9) |
| "Terminated employee could still log in for 24 hours" (`c18bee92`) | Federate to an IdP that authenticates against the directory **and disable Login Form authentication** — the local password is the window; JIT cannot deactivate anyone (§6) |

---

## 6. Provisioning and deprovisioning

"Given a scenario, recommend the appropriate method for provisioning users" appears in two
domains. The methods, from least to most automated:

| Method | Direction | Fires when | Notes |
|---|---|---|---|
| Manual / Data Loader / **SOAP or REST API** | into Salesforce | Whenever the caller says | The answer when an external system of record must push on approval (`2af83e4d`) |
| **SAML Just-in-Time (JIT)** — standard | into Salesforce | **At login**, from assertion attributes (`User.Username`, `User.Email`, `User.LastName`, `User.ProfileId`, Federation ID…) | Creates on first login, updates after; **cannot deprovision** — a disabled user never logs in, so it never fires (`7fbbab5d`, `c18bee92`) |
| **Custom SAML JIT** — Apex `Auth.SamlJitHandler` | into Salesforce | At login | Read **custom** SAML attributes (AD groups) and assign permission sets (`119806fb`); pass a profile Id centrally to many orgs (`0b12745c`) |
| **Auth Provider registration handler** | into Salesforce | At login (`createUser` / `updateUser`) | The social / OIDC counterpart of JIT (§5) |
| **SCIM 2.0** — `/services/scim/v2` | into Salesforce | **When the identity store changes** — create, update, disable, without a login | The standard the exam wants for "status change in the central IAM triggers provisioning *and deprovisioning*" (`1d59298d`); Okta, Entra ID and Identity Connect all speak it |
| **Identity Connect** | AD → Salesforce | On AD change, near real time | Deactivates the Salesforce user and revokes the session when AD disables the account (`8a87ff0b`) |
| **User Provisioning for Connected Apps** | Salesforce → external app | On Salesforce user create / freeze / disable / reactivate | Declarative, flow-based; each push is a **`UserProvisioningRequest`** record, so an **approval process on that object** gates account creation (`4e82a592`, `0757243f`, `0901e6fc`) |

**The asymmetry the exam tests**: provisioning-at-login mechanisms (JIT, registration handlers)
are fine for creating and updating, and useless for removing. Deprovisioning needs something that
runs *without* a login — SCIM, an API call, Identity Connect, or User Provisioning outbound.

**Assigning profiles, roles and permission sets during SSO** (Access Management objective):
standard JIT sets the profile from `User.ProfileId`; a **custom JIT handler** or registration
handler assigns permission sets from group attributes; a **login flow** can also run Apex after
authentication and adjust assignments — but it runs on **UI logins only**, so it is the wrong
tool for API users or for a decision that must be made when a status changes rather than when
someone logs in. Keeping assignments *current* means the IdP re-sends the attributes on every
login (`updateUser`, JIT update) or the directory pushes them (SCIM, Identity Connect).

---

## 7. Salesforce as an Identity Provider — OAuth, OpenID Connect, SAML out

The deck's biggest domain (35 items). The exam's is 17%. Know it, then move on.

### The OAuth flows — the table the exam is built from

| Flow | Grant | Who | Gets a refresh token? | The tell |
|---|---|---|---|---|
| **Web Server** | authorization code | Server-side web apps that can keep a **client secret** (`eeb5dece`, `5b30e615`); the **recommended** flow for mobile too, with **PKCE** | Yes (with `refresh_token` scope) | "server-side code needs to interact with APIs"; concepts: client secret, scopes, access token, authorization code (`cfcdee5c`) |
| **User-Agent** | implicit | Browser/mobile apps with no secret; token returned in the URL fragment | Yes — only with `refresh_token` scope **and** a custom-scheme or the `…/oauth2/success` callback (`717f2404`, `69ba67ca`) | "mobile app… no re-login" **on the exam**; see §13 |
| **JWT Bearer** | JWT assertion signed with a certificate | **Server-to-server**, unattended, no user interaction (`22e3dd32`) | No | Needs prior authorization: admin pre-approves the app or the user approved it once |
| **SAML Bearer Assertion** | signed SAML assertion → token endpoint | Server-to-server where a SAML assertion already exists; **connected app with a certificate, administrators authorize the app** (`5c79dca8`, `29476674`) | No | "previously authorized apps" |
| **SAML Assertion** | the org's *web SSO* assertion → token endpoint | Inbound API clients that already SSO into Salesforce via the org's SAML config (`f2d065ed`) | No | Uses the SSO Settings, not a connected app certificate — the distinction `29476674` turns on |
| **Device** | device code + user code | Devices with limited input — TVs, CLI tools, a fitness band the customer authorises from a phone (`156efedb`) | Yes | **Verification URL** and user code belong to *this* flow only |
| **Asset Token** | JWT actor token → asset token | **Connected devices** that should each have a revocable identity and an **Asset** record — sensors, GPS trackers, fitness devices (`fc878c46`, `69fa254e`, `ee7f18ad`) | — | "IoT", "device registers", "case associated with the customer's asset" |
| **Client Credentials** | consumer key + secret | Server-to-server with **no user** — runs as a designated integration user; the recommended replacement for username-password | **No** | New for the exam era; not in the deck |
| **Username-Password** | password | Legacy; passes credentials in the request; **being retired** | No | Appears in stems as what the customer *has* (`f5a4335a`) |
| **Refresh Token** | refresh token | Any app renewing an access token silently | — | Logout = **revoke the refresh token** (`1fb58f49`) |
| **Hybrid app / web server** | — | Mobile SDK apps that need both an API token and a web session | | Rare on the exam |

### Scopes — what a token may touch (`d605bce8`)

| Scope | Grants | Exam use |
|---|---|---|
| `api` | REST/SOAP/Bulk API, including custom objects and Apex REST | The **narrowest scope that does an API job** — `9d91e5a2`, `3fc81d5f` |
| `refresh_token` / `offline_access` | Issue a refresh token | Every "don't make users log in again" mobile item (`40262389`) |
| `web` | Use the token for a **UI session** via `frontdoor.jsp` | "redirected to Salesforce and dropped on the page" (`fcbec1e9`) |
| `full` | Everything except refresh | The wrong answer when "most secure" or "least privilege" is in the stem |
| `openid` | An **`id_token`** plus access to the UserInfo endpoint | OpenID Connect |
| `profile`, `email`, `address`, `phone` | OIDC claims | |
| `id` | Identity URL access | |
| `custom_permissions` | Custom permissions in the token | |
| `chatter_api`, `visualforce`, `lightning`, `wave_api`, `content`… | Narrower surfaces | |
| **Custom scopes** | Permissions **your** resource server defines and checks | Fine-grained, flexible access to an external protected resource (`b491280a`) |

### Tokens, expiry, revocation, introspection

- **Access token** lifetime follows the **session timeout** (org Session Settings or the
  connected app's **Session Policy** timeout); renew it with the refresh token.
- **Refresh token policy** on the connected app has four options: **valid until revoked**
  (default), **immediately expire**, **expire after n** (a fixed clock — the cohort that authorised
  six months ago all re-authenticating at once, `4ab56a8c`; users re-prompted daily, `15899789`),
  and **expire if not used for n** (inactivity — "re-verify devices idle for a week", `7168b6c2`).
- **Revocation**: `POST /services/oauth2/revoke` with the token. Passing the **refresh token**
  revokes it *and* its access tokens — that is what "logout" means in an auto-refreshing app
  (`1fb58f49`). Admins revoke from the user's OAuth Connected Apps list; blocking the app in
  Connected Apps OAuth Usage revokes everyone's.
- **Introspection**: `POST /services/oauth2/introspect` reports whether a token is active and
  what it carries (`545c4607`).
- **Identity URL** `https://login.salesforce.com/id/<orgId>/<userId>` and **UserInfo**
  `/services/oauth2/userinfo` return the user's profile for a valid token; discovery at
  `/.well-known/openid-configuration`. Authorization is `/services/oauth2/authorize`, token
  exchange `/services/oauth2/token`.
- An **authorization code** in the web server flow is single-use and expires in **15 minutes**.

### The connected app — every setting the exam names

| Setting | Effect | Deck item |
|---|---|---|
| Consumer key / secret, **callback URL** | Client identity; where the code or token is returned — must match the request exactly | `4ab56a8c` (a changed URI scheme is the first *distractor*, not the cause) |
| **Selected OAuth scopes** | Ceiling on what tokens may request | "How should an external app integrate with the API?" — a connected app plus scopes (`17eafc8b`) |
| **Require PKCE**; **Enable Client Credentials Flow** + run-as user; **Enable Device Flow** | Flow-specific switches | |
| **Permitted Users**: *All users may self-authorize* / **Admin approved users are pre-authorized** | Pre-authorized = only profiles and permission sets granted the app may use it — no approval screen (`8e61f426`), the restriction for "only the sales team" (`387fb895`), and the cause of **"Failed: Not approved for access"** (`b7fca343`) | |
| **IP Relaxation**: Enforce / Relax with second factor / Relax | *Relaxes* the profile's login IP ranges for this app; the **Trusted IP Range for OAuth Web Server Flow** field is scoped to that flow and does **not** restrict a username-password integration — the profile's **Login IP Ranges** do (`f5a4335a`) | |
| **Refresh Token Policy** | Above | `4ab56a8c`, `15899789`, `7168b6c2` |
| **Session Policy**: timeout; **High Assurance session required** | The app opens only in a High Assurance session (`8eb5fd50`) | |
| **Start URL**; **Visible in App Launcher** | "Specifying a Start URL makes the application available in the app menu and in App Launcher" — both missing = no tile for anyone (`718a5942`, `bd00c8e7`) | |
| **SAML settings** (Entity ID, ACS URL, subject type, name ID format, IdP certificate, **SAML Initiation Method**) | Makes Salesforce the SAML IdP for this app (`bd39ceda`, `8e61f426`) | |
| **Canvas** settings: access method (Signed Request / OAuth), **Locations** (Chatter Feed, Chatter Tab, Console, Layouts and Mobile Cards, Lightning Component, Mobile Nav, Open CTI, Publisher, Visualforce Page) | Where an embedded app may appear (`f351e88a`); "Enable as a Canvas Personal App" is a different, per-user thing | |
| **Custom attributes**; **Connected App Handler** (Apex `Auth.ConnectedAppPlugin`) | Extra claims; per-login allow/deny logic — "access only while the user owns an open Classified case" (`8e6a6eab`) | |
| **User Provisioning** | §6 | |
| **Mobile App settings** (PIN, private distribution) | Privately distributed native apps (`1e135665`) | |

### Salesforce as a SAML / OIDC identity provider, and the App Launcher

1. **Setup → Identity Provider → Enable** with a certificate (the current article lists only the
   certificate as a prerequisite — the "needs My Domain" step in `bd00c8e7` predates universal My
   Domain; see §13). Download the IdP metadata for the other side.
2. **One connected app per external application** with SAML settings (or OAuth + `openid` for an
   OIDC relying party).
3. A **Start URL** puts it in the **App Launcher**; visibility per profile / permission set decides
   who sees the tile (`bd00c8e7`, `1dc68b52`). A redirect being acceptable is what makes
   connected app + App Launcher sufficient (`bd39ceda`); when the external app must appear
   *inside* Salesforce with no redirect, it is **Canvas** with a signed request (`714b577a`).
4. Employees who need only this — SSO into your own apps, no CRM — take the **Identity Only**
   licence (§9).

---

## 8. Access management: MFA, sessions, login flows, audit

### Multi-factor authentication

- **What counts as MFA**: Salesforce Authenticator (push), third-party TOTP apps, security keys
  (WebAuthn/U2F), built-in authenticators (Touch ID, Windows Hello). **Email and SMS codes are
  not MFA methods** — they are *identity verification* for device activation and passwordless
  login.
- **What it defends**: a password that has been exposed — captured on public Wi-Fi, reused from
  a breached site, phished (`9f08f844`, `c9f1c673`). Not an unattended logged-in laptop.
- **How it is required**: the user permission **Multi-Factor Authentication for User Interface
  Logins** (profile or permission set), the API-side twin, or the org-level "require MFA for all
  direct UI logins". Salesforce's MFA applies to **direct logins**; for **SSO** logins the IdP is
  responsible — which is why "one MFA prompt across both paths" is not solved by the org
  setting.
- **Conditional MFA** — only off the corporate network, or against an existing custom 2FA system:
  a **custom login flow** with Apex (`f568388f`, `69c81641`).

### Session security levels — the mechanism behind most MFA questions

Every login method yields a session at a level: **Standard** or **High Assurance**. **Session
Settings → Session Security Levels** assigns methods to levels (MFA and passwordless are High
Assurance by default; **SAML/SSO can be moved to High Assurance**). Then:

- **Profile → Session Security Level Required at Login = High Assurance** forces MFA on a direct
  login, while an SSO login whose provider is on the High Assurance list passes with the IdP's
  own MFA — **exactly one prompt on each path** (`efc3d13e`).
- **Session-level policies** can require High Assurance for specific actions: reports and
  dashboards **export**, connected app access, encryption key management and other Setup
  operations. "Export only when logged in with AD credentials" = SAML sessions High Assurance +
  raise the level required for export (`5a7927de`). "Internal-only mobile app" = connected app
  requires High Assurance + an authenticator app to reach it (`8eb5fd50`).

### Network controls — three things that are constantly confused

| Control | Where | Effect |
|---|---|---|
| **Login IP Ranges** | **Profile** | Logins from outside are **denied** — UI and API alike; the only thing that pins a username-password integration to one host (`f5a4335a`) |
| **Trusted IP Ranges** | **Network Access** (org) | Logins from inside skip **identity verification** — the fix for "users keep being asked to verify" (`46545053`); outside is still allowed after verification |
| **IP Relaxation** | **Connected app** | Loosens the profile ranges for that app's OAuth logins; a *relaxation*, never a restriction |

Session Settings also hold: session **timeout** (default **2 hours** of inactivity), **lock
sessions to the IP address** from which they originated, lock to domain, force logout on timeout,
and the login-page caching / user-switching toggles.

### Login flows

A **login flow** (Flow Builder screen flow or Visualforce, assigned per **profile**) runs **after
credentials are accepted and before the session is handed over**. It can: prompt for a second
factor, call Apex to check the source IP or an external service (`f568388f`, `69c81641`), collect
or verify data and hold the user until they comply (`340019b3` — accept community rules, update
contact details), and finish by logging the user out or sending them on. It runs for **UI logins
only** — never for API logins — and it is not a provisioning tool.

### Audit and monitoring — "which tool" questions

| Need | Tool |
|---|---|
| Who logged in, when, from where, with what result; the first thing to pull on a suspected compromise (`504cf5e3`) | **Login History** — up to 20,000 rows on screen for the **past 6 months**, download for more; source IP, login type, status, application, browser |
| Averages, outliers, non-business-hours logins across 15,000 users (`2a790f16`) | **Login Forensics** (Event Monitoring / Shield) — analytics over login events, not a list |
| What changed in Setup, and who changed it | **Setup Audit Trail** — 180 days |
| API and UI events at scale, exportable, alertable; last-login analysis when real-time is not needed | **Event Monitoring** log files; **Real-Time Event Monitoring** and Transaction Security policies for blocking in the moment |
| Salesforce-as-IdP assertions issued and their outcomes | **Identity Provider Event Log** |
| Which apps a user has authorised and which tokens are live | The user's **OAuth Connected Apps** list; **Connected Apps OAuth Usage** for the org |

---

## 9. The under-trained 12%: Salesforce Identity products and licences

Three objectives, ~7 exam questions, **9 deck items** — and the licence facts below are the
ones no deck item states.

### Identity Connect

- Bridges **Microsoft Active Directory** and Salesforce — and **only AD**; a custom user database
  or a non-AD LDAP is "not compatible" (`f68f7018`).
- Installed **on your own server** (Windows or Linux) as a service, not as a managed package
  (`8a87ff0b`); uses an integration user record in Salesforce.
- Does three things at once (`3c32a06f`, `0cb04857`): **synchronises** AD users into Salesforce
  users, **maps AD groups to profiles, permission sets and roles**, and acts as a **SAML IdP** for
  SSO (SP- and IdP-initiated, with desktop/Kerberos SSO). On an AD disable it **deactivates the
  Salesforce user and revokes the session** in near real time.
- Licensed separately (**Identity Connect** permission set licence; Developer Edition includes
  10). Versions before 7.1 can no longer be downloaded as of Summer '23.
- The answer whenever the stem has **AD + provisioning + SSO**; the wrong answer whenever the
  directory is anything else.

### Customer 360 Identity (Salesforce Customer Identity)

The consumer-facing bundle that comes with the **External Identity** licence: one login per
customer across all your digital properties (`85a253b5`), **multi-brand** support with correlated
activity (`85a253b5`, `cab60f07`), social sign-on, passwordless/login discovery, dynamic branding,
self-registration, and Salesforce acting as IdP for external apps a customer reaches from the App
Launcher (`5a50aa0b`). It "fits" a Customer 360 project as the identity layer; it does not
populate Data Cloud or track anonymous pre-signup activity on its own.

### Licences — the table to memorise

| Licence | For | Gets | Limits and facts |
|---|---|---|---|
| **Identity Only** | **Employees** who need identity services only — SSO into a custom benefits or time-tracking app, App Launcher, connected apps (`15e77a5d`, `aaa8689c`) | No CRM objects | **100 complimentary** per Professional+ org; **10 custom objects** per user (contractual); Professional Edition: SAML only with the org as SP |
| **External Identity** | **External** people — customers, patients, partners, dealers — who need to log in and use identity services (`5a50aa0b`, `b7a788a9`) | Salesforce Customer Identity; several standard objects + **10 custom objects**; extra storage and API | Sold in blocks of active users; **≤ 10 million unique logins/month** recommended; **5 in Developer Edition**; included free with paid community licences; **upgradeable to a Community licence** for Cases, Contracts, Orders, Tasks; **contactless users** are External Identity only (`e178d75d`) |
| **Salesforce Platform** | Employees using **custom apps** (Apex, Visualforce, custom objects) plus accounts/contacts, not full CRM (`76d8034d`) | Supports SAML SSO | — |
| **Salesforce** | Full CRM | — | — |
| **Customer Community** | High-volume external users on a site | Sharing sets, no roles | Member- or **login-based** |
| **Customer Community Plus** | External users who need roles, sharing rules, reports | — | Member- or login-based |
| **Partner Community** | Partners who work leads, opportunities, campaigns | Partner roles, super users | Member- or **login-based** — 2.5M users at ~5 logins each a month is the login-based case (`2f0c70a9`) |
| **Identity Verification Credits** add-on | Passwordless / verification by **SMS** | — | **Email verification is free**; the add-on "typically includes **25,000 SMS messages per month, 300,000 credits per year**"; estimate from the number of **SMS** challenges, not logins (`26865975`) |
| **Identity Connect** | The AD bridge | — | Per-user permission set licence |

**Login-based** licences buy a monthly pool of logins rather than named seats; choose them
when many users log in rarely.

---

## 10. Community: Experience Cloud identity

### The user model

- An external user is a **User** created from a **Contact**, which belongs to an **Account**. A
  **partner** user needs the account **enabled as a partner**; a customer user needs only the
  contact. Adding customers as contacts and enabling them as site members, then turning on
  **Welcome emails** so each sets their own password, is the admin-driven path when
  self-registration is off (`09873c13`).
- **Person Accounts** for **B2C** self-registration — the registering consumer becomes one
  record merging account and contact. Enable Person Accounts, allow the person and business
  account record types under the site's public access settings, and leave the default Account
  on Login & Registration empty (`4549ec9c`).
- **Contactless users** — External Identity users with **no contact record**, cheaper to manage;
  the trade-off is the narrower functionality of the External Identity licence (`e178d75d`). A
  contact can be added later to upgrade them.
- **Sharing sets** grant customer-licence users access to records related to their own account
  or contact; roles and sharing rules exist for Plus and Partner licences.

### Login experience

| Feature | What it is | Deck |
|---|---|---|
| **Login page types** — exactly four: **Default**, **Login Discovery**, **Experience Builder**, **Visualforce** (Login & Registration page) | Login Discovery = **passwordless** (email or phone, one-time code, an Apex `Auth.LoginDiscoveryHandler` decides the user); Experience Builder = drag-and-drop branded page | `9f507c0e` — "Embedded Login" and "Lightning Experience" are not page types |
| **Self-registration** — standard page, or a **custom Visualforce page + `CommunitiesSelfRegController`**, or a flow | Capture custom fields and assign profile/account from them (`cb1525b3`); a different experience per registrant is **audience/visibility on User and Contact fields**, not more controllers (`2350f422`) | |
| **Dynamic branding** — the **Experience ID (`expid`)** | `site-url/services/oauth2/authorize/expid_value`, `…/idp/endpoint/HttpPost/expid_value`, or `expid={value}` on login, self-registration and forgot-password URLs; branding values resolve per brand at run time. One site serves 150 sub-brands (`cab60f07`, `41b2e0a5`, `cd584102`). Requires a **Lightning (Experience Builder) template** — not Salesforce Tabs + Visualforce | |
| **Login flows on a site** | Assigned to the site's profiles; the annual "accept the rules and update your details" gate (`340019b3`) | |
| **External IdPs on a site** | **Auth Providers** enabled on Login & Registration for social/OIDC (`c89c6e3d`); the org's **SAML** configurations selectable per site; **JIT** or the registration handler creates the contact + user on first login (`d193c7d6`, `f92fcf74`) | |
| **Registration through the IdP** | When duplicates must be impossible, register at the IdP and create the Salesforce partner user by API from that one event (`cf2e4959`) | |

### Embedded Login — the objective the deck never asks

**What it is**: a way to put a Salesforce/Experience Cloud **login form on your own external web
page** with a few HTML meta tags and JavaScript. The admin configures the site's auth providers
and login page, adds the website's domain to the **CORS allowlist**, and creates an **Embedded
Login connected app**; the web developer adds the meta tags, an `onlogin` (and optional
`onlogout`) JavaScript function, and the connected app's **callback URL**. Behind the scenes it is
an OAuth flow: Salesforce authenticates the user, checks the connected app's permissions, and
sends the access token and custom attributes to the callback, which caches the user's
information and decides what to show. Self-registration and forgot-password links open the site's
pages and do not return automatically; MFA, login flows and Login Discovery need
`salesforce-mask-redirects` set to false.

**When to use it (Summer '23 answer)**: you own an external website, want visitors to log in
with their Experience Cloud identity **without leaving the page**, and want the page to know who
they are afterwards. **When not to**: native mobile apps (Mobile SDK / OAuth), server-side apps
that need tokens (a connected app OAuth flow directly), or anything where a redirect to the site's
login page is acceptable. Read §13 before answering this on the exam.

---

## 11. Troubleshooting single sign-on

"Given a scenario, troubleshoot common points of failure" is a named objective, and the deck
covers only the RelayState case.

### Tools

- **SAML Assertion Validator** (Setup → Single Sign-On Settings) — shows the **last failed
  assertion** and which check it failed: signature, issuer, audience/Entity ID, timestamps,
  identity type/location, user lookup. Paste an assertion to test one.
- **Login History** — SSO failures appear with a status naming the failure (invalid assertion,
  user not found, IP restriction, login hours, frozen/inactive user); filter by login type.
- **Identity Provider Event Log** — when Salesforce is the IdP: every assertion issued, success
  or failure, per connected app.
- **Debug logs** on the JIT handler, registration handler or login flow Apex when the failure is
  in your code.

### Common failures and their fixes

| Symptom | Cause | Fix |
|---|---|---|
| Everything fails at once after months of working | IdP signing certificate rotated or expired | Upload the new certificate in SSO Settings |
| SP-initiated fails, IdP-initiated works | No My Domain / wrong Authentication Services | Deploy My Domain, list the provider (`0c8ef9d4`) |
| "Issuer" / "audience" errors | Issuer or Entity ID mismatch; second org reusing the first's Entity ID | Align the values (`337c210b`) |
| Assertion valid, **user not found** | Identity type or location wrong; Federation ID blank on the user; no JIT | Set the identity type to what the IdP sends; populate Federation ID; enable JIT |
| Timestamp / "assertion expired" | Clock skew between IdP and Salesforce | Fix the IdP's clock / NTP |
| Login succeeds, lands on **home tab** instead of the record | IdP not preserving **RelayState** | Fix the IdP (`6849d97f`) |
| Users on SSO **still asked for MFA twice** | Org MFA setting instead of session levels | §8 (`efc3d13e`) |
| OAuth: `redirect_uri_mismatch` | Callback URL differs from the request | Match exactly, including scheme |
| OAuth: "**Failed: Not approved for access**" | Admin-approved app, user not granted | Assign the app via profile/permission set (`b7fca343`) |
| OAuth: `invalid_grant` — IP restricted / authentication failure | Login IP ranges (profile), expired authorization code, app blocked | Check the profile's ranges and the app's IP relaxation (`f5a4335a`) |
| Users re-authenticate after a fixed period / after inactivity | Refresh token policy | §7 (`15899789`, `7168b6c2`) |
| App Launcher tile missing for everyone | Not visible in App Launcher, or no Start URL | `718a5942` |

---

## 12. Numbers to memorise

| Item | Value |
|---|---|
| Exam | 60 scored + up to 5 unscored; **120 min**; **65%** = 39 of 60; **Summer '23**; no prerequisite |
| Domain weights | Concepts 17 · Accepting third-party identity 21 · Salesforce as IdP 17 · Access management 15 · Salesforce Identity 12 · Community 18 |
| Delegated Authentication web service | **3 inputs** (username, password, sourceIp) → **Boolean**; SOAP only |
| SAML identity types | **3**: Username, Federation ID, User ID |
| Login page types | **4**: Default, Login Discovery, Experience Builder, Visualforce |
| Refresh token policy options | **4**: until revoked, immediately, after n, if unused for n |
| Connected app Permitted Users | **2**: self-authorize, admin pre-authorized |
| Session security levels | **2**: Standard, High Assurance |
| Session timeout default | **2 hours** of inactivity |
| Authorization code lifetime (web server flow) | **15 minutes** |
| Login History | up to **20,000** rows shown, **6 months** retained |
| Setup Audit Trail | **180 days** |
| Identity Only licences | **100** complimentary per Professional+ org; **10** custom objects per user |
| External Identity | **10** custom objects; **≤ 10 million** unique logins/month; **5** in Developer Edition |
| Identity Verification Credits | **25,000 SMS/month, 300,000 credits/year** per add-on; email verification free |
| Identity Connect | Developer Edition includes **10** licences; AD only; on-premise service |
| Mutual TLS inbound | Port **8443**; "Enforce SSL/TLS Mutual Authentication" permission |
| Canvas locations | 9 (Chatter Feed, Chatter Tab, Console, Layouts & Mobile Cards, Lightning Component, Mobile Nav, Open CTI, Publisher, Visualforce Page) |
| User-Agent refresh token | Only with `refresh_token` scope **and** a custom-scheme or `/oauth2/success` callback |

---

## 13. Answers that are right for the exam and wrong for production

The exam is pinned to **Summer '23**. Identity is where Salesforce has moved fastest since, so
this list is long. **Answer the exam's way**; know the reality so you recognise a distractor
built from it.

| Topic | Exam's answer (Summer '23) | Reality now |
|---|---|---|
| **"UC decides not to set up My Domain"** (`0c8ef9d4`); My Domain as a *prerequisite* for Salesforce as IdP (`bd00c8e7`) | A real choice with real consequences (SP-initiated SSO breaks) | **Every org has My Domain** — required since Winter '22, enhanced domains enforced from Winter '24. The consequences still describe *why* it matters; the choice no longer exists |
| **User-Agent flow** for a mobile app that must not re-prompt (`69ba67ca`, `717f2404`) | ✅ Keyed | Salesforce recommends the **web server flow with PKCE** for mobile; the implicit grant leaks tokens via the redirect URL and **admins can block it** |
| **Username-Password flow** (`f5a4335a`, and as an option elsewhere) | Appears as what the customer uses | **Being retired for connected apps**; replacements are **client credentials** (server-to-server) and web server + PKCE (user context) |
| **Connected Apps** | ✅ The object every OAuth answer names | **Creation restricted from Spring '26**; **External Client Apps** are the recommendation. Existing connected apps keep working, and the settings in §7 have the same names |
| **Embedded Login** as a way to log in from an external site | A valid design | **Disabled by default since Summer '24**; Salesforce recommends a redirect-based OAuth flow instead. It relies on **third-party cookies** and works only on Chrome while those are allowed |
| **"Contact Salesforce Support to enable Person Accounts"** (`4549ec9c`) | ✅ Keyed | Admins **enable Person Accounts from Setup** themselves (irreversible; Salesforce recommends previewing in a sandbox) |
| **Two-Factor Authentication (2FA)** wording | The stems say 2FA | Renamed **Multi-Factor Authentication**; MFA has been **contractually required for all direct UI logins since February 2022** and is auto-enabled/enforced — "should we add 2FA?" is no longer a question |
| **"Communities"**, "Customer Community", "Salesforce Tabs + Visualforce" | Item vocabulary | **Experience Cloud sites**; the licence names survive |
| **Customer 360 Identity** | The product name in `85a253b5` | Marketed as **Salesforce Customer Identity**, delivered by the External Identity licence |
| **Identity Connect** as the AD answer | ✅ | Still the answer; versions 2.1 / 3.0 are no longer downloadable, 7.1.6 is current |
| **Login Forensics** as a plain feature | ✅ | Part of **Event Monitoring** (Shield) — an add-on |
| **Client credentials flow** | Absent from the deck; present on the exam | GA and the documented replacement for username-password |

---

## 14. Distractor tells

Patterns in how this exam writes wrong answers, from the deck's 116 and its two fact-check
passes.

1. **The roles reversed.** "Facebook is the SP and Salesforce the IdP"; "regional orgs as IdPs";
   "Salesforce as an authentication provider *to* the existing IdP". Fix the roles before
   reading further (§3).
2. **The neighbouring flow.** SAML *Assertion* flow vs SAML *Bearer* flow (`29476674`); JWT
   bearer offered for a device; the **Verification URL** (device flow) listed under the web
   server flow (`cfcdee5c`); "Mobile Agent flow" (does not exist).
3. **A login-time tool for a no-login problem.** JIT or a login flow for **deprovisioning**
   (`7fbbab5d`, `c18bee92`); a login flow to validate status for API users; a registration
   handler to sync nightly.
4. **A product for the wrong directory.** Identity Connect against a custom database
   (`f68f7018`); an Auth Provider "delegating to LDAP"; Delegated Authentication over **REST**
   (`cee7f38e`).
5. **The wrong token.** Revoking the *access* token as logout (`1fb58f49`); "access token TTL"
   when the symptom is a fixed-period re-prompt (`4ab56a8c`); clearing the Client ID.
6. **The wrong scope.** `full` when the stem says secure or least privilege; `web` for an API
   integration; `api` for a UI redirect (`fcbec1e9`).
7. **The wrong IP control.** Trusted IP Ranges to *block*; Login IP Ranges to *stop verification
   prompts*; the connected app's IP field to restrict a username-password login (`f5a4335a`,
   `46545053`).
8. **The org-wide switch for a per-path problem.** "Enable MFA for the organization" when two
   login paths need one prompt each (`efc3d13e`); "disallow SSO for the app's users".
9. **Custom code where a product exists.** Apex triggers on `UserLogin`, nightly callouts to
   Facebook, Heroku sign-on apps, a REST endpoint Google polls — when User Provisioning for
   Connected Apps, `updateUser()`, SCIM or Identity Connect is the documented feature
   (`0757243f`, `ce735840`).
10. **The adjacent product.** Salesforce Connect to "synchronise LDAP passwords"; Named
    Credentials for an inbound device; Canvas for an App Launcher tile; a separate org per brand
    when `expid` exists (`cab60f07`).
11. **A licence one tier too rich.** Community licences for customers who only need to log in
    (External Identity, `5a50aa0b`); a full Salesforce licence for a custom-app-only workforce
    (Platform, `76d8034d`); member-based when the logins-per-user ratio screams login-based
    (`2f0c70a9`).
12. **An invented behaviour of a real product.** "Identity Connect can be deployed as a managed
    package", "…starts disabling users FIFO" — check the product facts against §9.

### Read the question's own verb

- **"with limited custom development" / "declarative"** → SAML federation, User Provisioning,
  Auth Provider + handler, session levels, login flows — not Apex triggers.
- **"first time the user…"** → `createUser()` / JIT.
- **"changes in the profile are reflected…"** → `updateUser()`.
- **"as soon as they are approved / status changes"** → SCIM, API push, Identity Connect — a
  mechanism that runs without a login.
- **"only once" / "single login"** → federation to one IdP; register at the IdP.
- **"restrict" a mobile app to a group** → connected app **Permitted Users** + profile /
  permission set.
- **"what should be investigated first"** → the single most specific symptom: RelayState for
  landing on home, refresh token policy for periodic re-prompts, Login History for a suspected
  compromise.
- **"at a minimum, which licence"** → the cheapest that delivers the stated need: Identity Only,
  External Identity, Platform.

---

## 15. Two-week revision plan

| Day | Focus |
|---|---|
| 1 | §3 roles and building blocks until you can label every system in a stem without reading the options; the protocol table |
| 2 | §4 SAML settings field by field; SP- vs IdP-initiated; RelayState. Drill the deck's SSO items |
| 3 | §5 Auth Providers vs Delegated Authentication; write `createUser` / `updateUser` responsibilities from memory |
| **4** | **§6 provisioning table** — the login-time vs status-change asymmetry; SCIM; User Provisioning outbound. Drill governance items |
| 5 | §7 OAuth flows table, cover-and-reproduce; scopes; the four refresh token policies |
| 6 | §7 connected app settings; Salesforce as IdP; App Launcher; Canvas. Drill the deck's OAuth items (there are many — don't let them crowd out days 4 and 8) |
| 7 | §8 MFA methods, session security levels, the three IP controls, login flows, audit tools |
| **8** | **§9 Salesforce Identity** — Identity Connect facts, the licence table from memory, the credit arithmetic |
| 9 | §10 Experience Cloud user model, login page types, `expid`, **Embedded Login** |
| 10 | §11 troubleshooting table; open the SAML Assertion Validator and the Identity Provider Event Log in a dev org |
| 11 | §12 numbers; §13 stale answers — this exam has more of them than any other |
| 12 | §14 tells; re-drill every item you missed |
| 13 | Full deck run, timed at 2 minutes a question |
| 14 | Re-read §3, §9 and §13. Rest |

---

## 16. Sources

Every URL below was rendered and title-checked during this repo's fact-check work or while
writing this guide.

**The exam**
- [Salesforce Certified Platform Identity and Access Management Architect Exam Guide](https://help.salesforce.com/s/articleView?id=005298975&type=1&language=en_US) — outline, weights, Summer '23 alignment.

**SAML, My Domain, delegated authentication, auth providers**
- [Configure SSO with Salesforce as a SAML Service Provider](https://help.salesforce.com/s/articleView?id=sf.sso_saml.htm&language=en_US&type=5) and [SAML SSO with Salesforce as the Service Provider](https://help.salesforce.com/s/articleView?id=sf.sso_saml_setting_up.htm&language=en_US&type=5)
- [My Domain](https://help.salesforce.com/s/articleView?id=sf.domain_name_overview.htm&language=en_US&type=5) — why SP-initiated SSO needs it.
- [Delegated Authentication](https://help.salesforce.com/s/articleView?id=sf.sso_delauthentication.htm&language=en_US&type=5)
- [Authentication Provider SSO](https://help.salesforce.com/s/articleView?id=sf.sso_authentication_providers.htm&language=en_US&type=5) — "OpenID Connect or a custom OAuth 2.0 configuration"; no LDAP.
- [Configure an Auth Provider Using OpenID Connect](https://help.salesforce.com/s/articleView?id=xcloud.sso_provider_openid_connect.htm&language=en_US&type=5) and [Just-in-Time Provisioning for SAML](https://help.salesforce.com/s/articleView?id=sf.sso_jit_about.htm&language=en_US&type=5)
- [Manage Salesforce User Identities with SCIM](https://help.salesforce.com/s/articleView?id=sf.identity_scim_overview.htm&language=en_US&type=5)

**OAuth and connected apps**
- OAuth flows: [Web Server](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm&language=en_US&type=5), [Refresh Token](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_refresh_token_flow.htm&language=en_US&type=5), [JWT Bearer](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_jwt_flow.htm&language=en_US&type=5), [SAML Bearer Assertion](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_SAML_bearer_flow.htm&language=en_US&type=5), [Device](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_device_flow.htm&language=en_US&type=5), [Asset Token](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_asset_token_flow.htm&language=en_US&type=5), [Client Credentials](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_client_credentials_flow.htm&language=en_US&type=5) — "doesn't support refresh tokens", the alternative to username-password.
- [OAuth Tokens and Scopes](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_scopes.htm&language=en_US&type=5), [Revoke OAuth Tokens](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_revoke_token.htm&language=en_US&type=5), [OpenID Connect Token Introspection Endpoint](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oidc_token_introspection_endpoint.htm&language=en_US&type=5)
- [Connected App Use Cases](https://help.salesforce.com/s/articleView?id=sf.connected_app_about.htm&language=en_US&type=5), [Configure Trusted IP Ranges for a Connected App](https://help.salesforce.com/s/articleView?id=xcloud.connected_app_edit_ip_ranges.htm&language=en_US&type=5), [User Provisioning for Connected Apps](https://help.salesforce.com/s/articleView?id=sf.connected_app_user_provisioning.htm&language=en_US&type=5), [ConnectedAppPlugin Class](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_class_Auth_ConnectedAppPlugin.htm)

**Access management**
- [Multi-Factor Authentication for Salesforce Orgs](https://help.salesforce.com/s/articleView?id=sf.security_require_two_factor_authentication.htm&language=en_US&type=5)
- [Session Security](https://help.salesforce.com/s/articleView?id=sf.security_overview_sessions.htm&language=en_US&type=5) — default 2-hour timeout, Standard vs High Assurance.
- [Custom Login Flows](https://help.salesforce.com/s/articleView?id=sf.security_login_flow.htm&language=en_US&type=5)
- [Restrict Login IP Addresses in Profiles](https://help.salesforce.com/s/articleView?id=sf.users_profiles_epui_login_ip_ranges.htm&language=en_US&type=5)
- [Monitor Login History](https://help.salesforce.com/s/articleView?id=xcloud.users_login_history.htm&language=en_US&type=5) — 20,000 rows, 6 months.
- [Monitor Access to Your Salesforce Orgs and Experience Cloud Sites](https://help.salesforce.com/s/articleView?id=sf.identity_monitor_access.htm&language=en_US&type=5) and [Setup Audit Trail](https://help.salesforce.com/s/articleView?id=sf.admin_monitorsetup.htm&language=en_US&type=5)

**Salesforce Identity products and licences**
- [Salesforce Identity Licenses](https://help.salesforce.com/s/articleView?id=sf.identity_licenses.htm&language=en_US&type=5) — the 100 complimentary Identity Only licences, the 10-custom-object and 10-million-login limits, the External Identity upgrade path.
- [Identity Verification Credits Add-On License Considerations](https://help.salesforce.com/s/articleView?id=005239145&language=en_US&type=1) — 25,000 SMS/month.
- [Identity Connect](https://help.salesforce.com/s/articleView?id=xcloud.identityconnect_about.htm&language=en_US&type=5)
- [User Licenses](https://help.salesforce.com/s/articleView?id=platform.users_understanding_license_types.htm&language=en_US&type=5) and [Experience Cloud User Licenses](https://help.salesforce.com/s/articleView?id=sf.users_license_types_communities.htm&language=en_US&type=5)

**Experience Cloud identity**
- [Configure Self-Registration](https://help.salesforce.com/s/articleView?id=sf.external_identity_self_registration_configure.htm&language=en_US&type=5), [Self-Registration with Person Accounts](https://help.salesforce.com/s/articleView?id=xcloud.external_identity_self_registration_person_accounts.htm&language=en_US&type=5), [Enable Person Accounts](https://help.salesforce.com/s/articleView?id=sf.account_person_enable.htm&language=en_US&type=5)
- [Dynamic Branding Use Cases](https://help.salesforce.com/s/articleView?id=sf.external_identity_branding_use_cases.htm&language=en_US&type=5), [Configure Login Pages](https://help.salesforce.com/s/articleView?id=sf.external_identity_login_pages_configure.htm&language=en_US&type=5), [Create Contactless Users](https://help.salesforce.com/s/articleView?id=sf.external_identity_manage_create_contactless_users.htm&language=en_US&type=5), [Create External Users](https://help.salesforce.com/s/articleView?id=platform.networks_create_external_users.htm&language=en_US&type=5)
- [How to Implement Embedded Login](https://help.salesforce.com/s/articleView?id=sf.external_identity_login_how_it_works.htm&language=en_US&type=5) and [Embedded Login Considerations](https://help.salesforce.com/s/articleView?id=sf.external_identity_login_considerations.htm&language=en_US&type=5) — "In Summer '24, Salesforce made Embedded Login disabled by default."

---

## 17. Using this with NotebookLM

Upload **this file** as a source. Markdown ingests cleanly and the headings become NotebookLM's
navigation.

Worth adding as additional sources:
- The [official exam guide](https://help.salesforce.com/s/articleView?id=005298975&type=1&language=en_US) URL.
- [OAuth Tokens and Scopes](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_scopes.htm&language=en_US&type=5) and [Salesforce Identity Licenses](https://help.salesforce.com/s/articleView?id=sf.identity_licenses.htm&language=en_US&type=5) — two pages the exam draws on that the deck never cites.

**Prompts that produce useful study media:**

- *"Generate an Audio Overview of sections 3 and 7. Have the hosts describe a company with a
  mobile app, a corporate IdP and a partner portal, and argue over which system is the IdP, the
  SP and the resource server in each interaction — then which OAuth flow each app should use."*
- *"Using section 6, drill me: give me a provisioning requirement and ask whether it fires at
  login or on a status change, and which mechanism fits. Don't give me the answer until I try."*
- *"Turn section 12 into flashcards — one fact per card."*
- *"Using section 13, explain each case where the exam's expected answer differs from current
  Salesforce behaviour, and why the exam still keys the old answer."*
- *"Using section 11, give me five broken-SSO symptoms and ask me to name the cause and the
  tool that shows it."*

For the Audio Overview, sections 3, 5, 6 and 13 reward listening — they are role-play and
comparisons. The tables in section 7, and sections 12 and 16, are lookups and will not survive
being read aloud.
