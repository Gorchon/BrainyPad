# BrainyPad: Interactive Learning Through AI-Enhanced Notes

## [Live deploy](https://brainypad-deploy.vercel.app/)

## Introduction

Welcome to BrainyPad, where your notes come to life! This innovative app leverages cutting-edge artificial intelligence to transform your study notes into interactive quizzes, helping reinforce your learning and ensuring you grasp the most important concepts. Whether you're a student, a lifelong learner, or a professional brushing up on new material, QuizNote is designed to enhance your learning experience by making study time both efficient and effective.

## Features

- **Note-Taking**: Easily input or upload you're study notes.
- **AI Analysis**: Our AI analyzes your notes, identifying key information and themes.
- **Quiz Generation**: Automatically generates quizzes based on your notes to test your understanding of the material.
- **Progress Tracking**: Keeps track of your learning progress and highlights areas needing improvement.
- **Intuitive Interface**: A user-friendly interface that makes navigating through your notes and quizzes straightforward and hassle-free.

## Technologies

QuizNote is built using the following technologies:

- **Frontend**: React, Solid, Vue, Svelte
- **Backend**: Astro API Routes
- **AI & NLP**: OpenAI for the LLM, Nearbyy for the RAG
- **Database**: PostgreSQL (Supabase)
- **Platform(s)**: Web
- **Deployment**: Vercel

## Installation

To get started with QuizNote, follow these simple steps:

## Schema Generation and Migration to Supabase using Drizzle

## Generating Schema Changes

To generate schema changes with Drizzle, you can use the `generate` script from your `package.json`. This script utilizes Drizzle's capabilities to introspect your PostgreSQL database and generate the necessary schema files.

```bash
pnpm generate
```

This command should be run after you've made changes to your database schema. It will update the schema files to reflect your current database structure.

## Migrating Schema Changes

Once you have generated the schema changes, you can apply these changes to your database using the `migrate` script.

```bash
pnpm migrate
```

This script will execute the `migrate.ts` file located in the `src/server/db` directory of your project, applying the new schema changes to your database.

...
