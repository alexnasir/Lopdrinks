# Lopdrinks — Backend API

A production-ready Flask backend for the Lopdrinks coffee recipe and ordering platform, built with Clean Architecture principles.

---

## Architecture Overview

```
server/
│
├── app/                        ← Application package
│   ├── __init__.py             ← Application factory (create_app)
│   ├── config.py               ← Environment-specific configuration
│   ├── extensions.py           ← Flask extension singletons (db, jwt, cors…)
│   │
│   ├── api/                    ← HTTP interface layer
│   │   ├── __init__.py         ← Blueprint registration (register_routes)
│   │   ├── dependencies.py     ← Dependency wiring (repos → services)
│   │   └── routes/             ← URL bindings only, zero logic
│   │       ├── auth_routes.py
│   │       ├── brew_method_routes.py
│   │       ├── ingredient_routes.py
│   │       ├── recipe_routes.py
│   │       ├── order_routes.py
│   │       └── upload_routes.py
│   │
│   ├── controllers/            ← Request extraction + response formatting
│   │   ├── auth_controller.py
│   │   ├── brew_method_controller.py
│   │   ├── ingredient_controller.py
│   │   ├── recipe_controller.py
│   │   ├── order_controller.py
│   │   └── upload_controller.py
│   │
│   ├── services/               ← ALL business logic (no Flask deps)
│   │   ├── auth_service.py
│   │   ├── brew_method_service.py
│   │   ├── ingredient_service.py
│   │   ├── recipe_service.py
│   │   ├── order_service.py
│   │   └── upload_service.py
│   │
│   ├── repositories/           ← Database operations only
│   │   ├── user_repository.py
│   │   ├── brew_method_repository.py
│   │   ├── ingredient_repository.py
│   │   ├── recipe_repository.py
│   │   └── order_repository.py
│   │
│   ├── models/                 ← One SQLAlchemy model per file
│   │   ├── user.py
│   │   ├── brew_method.py
│   │   ├── ingredient.py
│   │   ├── recipe.py
│   │   ├── recipe_ingredient.py
│   │   └── order.py
│   │
│   ├── middleware/             ← Cross-cutting concerns
│   │   ├── auth.py             ← @require_role decorator
│   │   └── request_logger.py   ← before/after request hooks
│   │
│   ├── exceptions/             ← Custom exception hierarchy + global handlers
│   │   ├── custom_exceptions.py
│   │   └── handlers.py
│   │
│   ├── constants/              ← Domain-level constants (roles, statuses)
│   │   ├── roles.py
│   │   └── order_status.py
│   │
│   ├── utils/                  ← Stateless helpers
│   │   ├── response.py         ← success_response / error_response builders
│   │   ├── file_helpers.py
│   │   └── otp.py
│   │
│   └── logging/
│       └── setup.py            ← Structured logging configuration
│
├── tests/                      ← Pytest test suite
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_recipes.py
│   └── test_orders.py
│
├── migrations/                 ← Alembic migration scripts (unchanged)
├── run.py                      ← Application entry point
├── seed.py                     ← Database seed / image URL updater
├── requirements.txt
├── procfile                    ← Gunicorn process declaration
├── .env.example                ← Environment variable template
└── README.md
```

---

## Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Routes** | Map URLs to controller functions only |
| **Controllers** | Extract request data, call services, return responses |
| **Services** | All business rules, validation, orchestration |
| **Repositories** | Database read/write — no logic |
| **Models** | SQLAlchemy table definitions |
| **Middleware** | JWT auth enforcement, request logging |
| **Exceptions** | Custom hierarchy + centralised error handlers |
| **Utils** | Stateless helpers (responses, OTP, file checks) |
| **Constants** | Roles, order statuses — one source of truth |

---

## API Endpoints

All responses follow the envelope format:

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "errors": [] }
```

### Auth
| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register a new user |
| POST | `/verify` | — | Verify email via OTP |
| POST | `/login` | — | Login, returns JWT token |

### Recipes
| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/recipes/` | — | List all recipes |
| POST | `/recipes/` | Admin | Create a recipe |
| PUT | `/recipes/<id>` | Admin | Update a recipe |
| DELETE | `/recipes/<id>` | Admin | Delete a recipe |

### Orders
| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/orders/` | User/Admin | List orders (own or all) |
| GET | `/orders/<id>` | User/Admin | Get single order |
| POST | `/orders/` | User | Place an order |
| PATCH | `/orders/<id>` | User/Admin | Update quantity or status |
| DELETE | `/orders/<id>` | User/Admin | Cancel/delete an order |

### Brew Methods
| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/brew_methods/` | — | List all brew methods |
| POST | `/brew_methods/` | Admin | Create a brew method |

### Ingredients
| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/ingredients/` | — | List all ingredients |
| POST | `/ingredients/` | Admin | Create an ingredient |

### Uploads
| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/upload` | Admin | Upload an image |
| GET | `/uploads/<filename>` | — | Serve an uploaded file |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

| Variable | Description | Default |
|---|---|---|
| `APP_ENV` | `development` / `testing` / `production` | `development` |
| `SECRET_KEY` | Flask secret key | *(change me)* |
| `JWT_SECRET_KEY` | JWT signing key | *(change me)* |
| `DATABASE_URL` | SQLAlchemy database URI | `sqlite:///coffee.db` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000,...` |
| `PORT` | Server port | `5000` |

---

## Running Locally

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Run database migrations
flask --app run:app db upgrade

# 5. Start the development server
python run.py
```

---

## Running Tests

```bash
pytest tests/ -v
```

---

## Deployment (Render / Heroku)

The `procfile` declares the gunicorn command:

```
web: gunicorn "run:app"
```

Set `APP_ENV=production`, `DATABASE_URL`, `JWT_SECRET_KEY`, and `SECRET_KEY` as environment variables in your hosting dashboard.
