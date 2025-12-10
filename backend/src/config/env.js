// src/config/env.js
import 'dotenv/config'; // 👈 This line loads the secrets from /.env into process.env

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/uniattend_db';
export const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECURE_SECRET_123';
export const CLIENT_URL = process.env.CLIENT_URL;