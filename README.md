# \# StoreRatings

# 

# A full-stack store rating platform built with \*\*React.js, Express.js, and PostgreSQL\*\*.

# 

# The application provides a role-based system where users can rate registered stores, while administrators manage the platform and store owners monitor their store ratings.

# 

# \## User Roles \& Features

# 

# \### System Administrator

# 

# \* Dashboard with total users, stores, and ratings

# \* Add and manage users and stores

# \* View users and stores

# \* Search, filter, and sort listings

# \* View user and store details

# 

# \### Normal User

# 

# \* Sign up and log in

# \* View and search registered stores

# \* Submit ratings from \*\*1–5\*\*

# \* Modify submitted ratings

# \* View overall and personal ratings

# \* Change password

# 

# \### Store Owner

# 

# \* Log in

# \* View average store rating

# \* View users who rated their store

# \* Change password

# 

# \## Tech Stack

# 

# \* \*\*Frontend:\*\* React.js, Vite

# \* \*\*Backend:\*\* Node.js, Express.js

# \* \*\*Database:\*\* PostgreSQL

# \* \*\*Authentication:\*\* JWT

# 

# \## Local Setup

# 

# \### Backend

# 

# ```bash

# cd backend

# npm install

# ```

# 

# Create `.env` from `.env.example` and configure your local PostgreSQL credentials.

# 

# Run database migration and seed:

# 

# ```bash

# npm run migrate

# npm run seed

# ```

# 

# Start the backend:

# 

# ```bash

# npm run dev

# ```

# 

# \### Frontend

# 

# Open another terminal:

# 

# ```bash

# cd frontend

# npm install

# npm run dev

# ```

# 

# Open:

# 

# ```text

# http://localhost:5173

# ```

# 

# \## Environment Variables

# 

# See `backend/.env.example` for the required configuration.

# 

# \*\*Do not commit `.env` or any passwords/secrets to GitHub.\*\*



