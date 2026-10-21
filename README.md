# Blog Platform (Midterm Exam)

Two Express servers sharing one `JWT_SECRET`.

## Setup
```bash
npm install
cp .env.example .env     # then set JWT_SECRET
npm run start:auth       # http://localhost:4000
npm run start:blog       # http://localhost:5000  (second terminal)
```

## Auth Server (4000)
| Method | Endpoint | Body |
|---|---|---|
| POST | /register | username, password, role (reader/author/admin) |
| POST | /login | username, password |
| POST | /refresh | refreshToken |
| POST | /logout | refreshToken |

## Blog API (5000)
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/posts | public |
| GET | /api/posts/:id | public |
| POST | /api/posts | author, admin |
| PUT | /api/posts/:id | owner or admin |
| DELETE | /api/posts/:id | admin |
| GET | /api/me/posts | any logged-in user |

Protected routes need `Authorization: Bearer <accessToken>`.
