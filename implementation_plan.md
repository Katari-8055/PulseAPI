# Full Implementation Plan — Client Self-Registration + Role-Based Dashboards

## What We Are Building

Abhi system **invite-only** hai — sirf Super Admin sab kuch karta hai.
Hum isko upgrade kar rahe hain taaki:
- **Client khud register kar sake** (company naam, email, password)
- **Client apne dashboard se** Client Admin & Viewer add kar sake
- **Har role ka apna dashboard ho** (Super Admin, Client, Client Admin, Client Viewer)
- **Super Admin sab kuch dekh sake** — all clients, their users, their API keys

---

## Architecture Decision

> Client model mein `password` add karo — Client ek **loginable entity** ban jaayegi.
> Jab Client login karega toh JWT mein `clientId` aur `role: "client_admin"` aayega.
> Is tarah **existing role checks aur middleware mein koi bada change nahi** hoga.

---

## Proposed Changes

---

### PHASE 1 — Backend: Client Self-Registration & Login

#### [MODIFY] [Client.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/shared/models/Client.js)
- `password` field add karo (bcrypt hashed, required)
- `status` field add karo (`enum: ['active', 'suspended']`, default: `'active'`)
- `createdBy` field — `required: false` karo (kyunki ab client khud register karega, koi super admin nahi hoga)
- `pre('save')` hook add karo password hashing ke liye (same as User.js)

#### [NEW] Client Auth Routes
`/client/register` — Public route, no auth needed
```
POST /client/register
Body: { name, email, password, website?, description? }
Response: { client, token }
```

`/client/login` — Public route
```
POST /client/login
Body: { email, password }
Response: { client, token }
```

#### [MODIFY] [ClientRepository.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/services/client/repository/ClientRepository.js)
- `findByEmail(email)` method add karo — login ke liye chahiye

#### [MODIFY] [BaseClientRepository.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/services/client/repository/BaseClientRepository.js)
- `findByEmail(email)` abstract method add karo

#### [MODIFY] [clientService.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/services/client/service/clientService.js)
- `registerClient(clientData)` — self registration logic
- `loginClient(email, password)` — login logic, JWT generate karo
- `generateToken(client)` — JWT with `{ clientId, role: 'client_admin', type: 'client' }`

#### [MODIFY] [authenticate.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/shared/middlewares/authenticate.js)
- Abhi JWT mein `clientId` already aata hai — **koi change nahi** ✅
- `req.user = { userId, email, role, clientId }` same rahega

#### [MODIFY] [clientRoutes.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/services/client/routes/clientRoutes.js)
- `POST /client/register` — public
- `POST /client/login` — public

#### [MODIFY] [clientController.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/services/client/controller/clientController.js)
- `registerClient(req, res, next)` handler
- `loginClient(req, res, next)` handler

---

### PHASE 2 — Backend: Super Admin View APIs

#### [MODIFY] [clientService.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/services/client/service/clientService.js)
- `getAllClients()` — sab clients return karo (Super Admin only)
- `getClientById(clientId, user)` — ek client ki detail
- `getClientUsers(clientId, user)` — us client ke sab users (admin + viewer)

#### [MODIFY] [UserRepository.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/services/auth/repository/UserRepository.js)
- `findByClientId(clientId)` method add karo — ek client ke sab users laane ke liye

#### [MODIFY] [BaseRepository.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/services/auth/repository/BaseRepository.js)
- `findByClientId(clientId)` abstract method add karo

#### [MODIFY] [clientController.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/services/client/controller/clientController.js)
- `getAllClients(req, res, next)` handler
- `getClientById(req, res, next)` handler
- `getClientUsers(req, res, next)` handler

#### [MODIFY] [clientRoutes.js](file:///c:/Users/katri/Desktop/R.Project/ApiManage/server/src/services/client/routes/clientRoutes.js)
- `GET /admin/clients` — Super Admin: sab clients dekhe
- `GET /admin/clients/:clientId` — Client detail
- `GET /admin/clients/:clientId/users` — Us client ke sab users

---

### PHASE 3 — Frontend: Role-Based Dashboards

Har role ka alag dashboard page:

#### Super Admin Dashboard
- All clients list (name, email, status, created date)
- Kisi bhi client pe click karo → uske users + API keys dekho
- Client ko suspend/activate karo

#### Client Dashboard  
- Apni company info dekho
- Client Admin & Viewer add karo (button se form khule)
- Apni API Keys dekho

#### Client Admin Dashboard
- Apne client ke users dekho
- Naye users add karo (viewer only)
- API Keys create karo (button click se seedha generate)
- API Keys list dekho

#### Client Viewer Dashboard
- Sirf API Keys dekho (read-only)
- Analytics dekho

---

## Full Flow After Implementation

```
SELF REGISTRATION:
Client → POST /client/register → JWT mile → Dashboard

CLIENT ADDS USERS:
Client (logged in) → POST /admin/clients/:clientId/users
  body: { username, email, password, role: "client_admin" }
  → Client Admin ban gaya ✅

CLIENT ADMIN CREATES API KEY:
Client Admin → POST /admin/clients/:clientId/api/keys
  → API Key generate ho gayi ✅ (existing route, no change)

SUPER ADMIN VIEWS ALL:
Super Admin → GET /admin/clients → sab clients
Super Admin → GET /admin/clients/:id/users → us client ke users
```

---

## What Changes, What Stays Same

| Component | Change? | Note |
|---|---|---|
| `authenticate.js` | ❌ No change | Already handles `clientId` in JWT |
| `authorize.js` | ❌ No change | Role-based check same hai |
| `canUserAccessClient()` | ❌ No change | clientId match already works |
| `createClientUser()` | ❌ No change | Client login karega → same route use karega |
| `createApiKey()` | ❌ No change | Already works for client_admin |
| `Client.js` model | ✅ Add password, status | Core change |
| `ClientRepository.js` | ✅ Add findByEmail | Small addition |
| `UserRepository.js` | ✅ Add findByClientId | Small addition |
| `clientService.js` | ✅ Add register/login/getAll* | Medium |
| `clientController.js` | ✅ Add new handlers | Medium |
| `clientRoutes.js` | ✅ Add new routes | Small |
| Frontend | ✅ Build dashboards | Main work |

---

## Open Questions

> [!IMPORTANT]
> **Client login mein `username` ya `email` use karein?**
> User login mein `username` use hota hai. Client ke liye `email` se login zyaada natural lagta hai (company login). Confirm karo.

> [!IMPORTANT]
> **JWT mein Client ka `userId` kya hoga?**
> Client ka MongoDB `_id` use karein as `userId` in JWT — taaki existing middleware (`req.user.userId`) break na ho.

> [!NOTE]
> **`createdBy` field ka kya karein?**
> Abhi `createdBy` required hai Super Admin ke `userId` se. Self-registration mein koi Super Admin nahi hoga. Plan: `createdBy` optional karo, ya self-register pe `createdBy: null` rakho.

> [!NOTE]
> **Super Admin abhi bhi manually clients add kar sakta hai?**
> Haan, existing `POST /admin/clients/onboard` route rakh sakte hain — internal use ke liye. Dono flows parallel chalenge.
