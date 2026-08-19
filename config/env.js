import dotenv from 'dotenv';

// This file's ONLY job is to load .env into process.env, and it must
// be the very first thing imported anywhere in the app. If any other
// module reads process.env at its own top level (module load time)
// before this runs, it will see undefined instead of the real value —
// silently, with no error.
dotenv.config();