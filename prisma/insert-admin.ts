/**
 * insert-admin.ts
 * Insère le compte admin sur Turso Cloud
 */

import { createClient } from "@libsql/client";
import { createHash } from "crypto";

const TURSO_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function cuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 14);
  return `c${timestamp}${random}`;
}

async function main() {
  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  const id = cuid();
  const email = "admin@gmail.com";
  const passwordHash = hashPassword("admin1234");
  const name = "Administrateur";
  const role = "ADMIN";
  const now = new Date().toISOString();

  console.log("👤 Insertion du compte admin...");
  console.log(`   Email : ${email}`);
  console.log(`   Hash  : ${passwordHash}`);

  // Supprimer si déjà existant
  await client.execute({
    sql: `DELETE FROM users WHERE email = ?`,
    args: [email],
  });

  // Insérer l'admin
  await client.execute({
    sql: `INSERT INTO users (id, email, passwordHash, name, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, email, passwordHash, name, role, now, now],
  });

  console.log("✅ Compte admin créé avec succès !");

  // Vérification
  const result = await client.execute({
    sql: `SELECT id, email, name, role, createdAt FROM users WHERE email = ?`,
    args: [email],
  });

  console.log("\n📋 Compte inséré :");
  console.log(result.rows[0]);
}

main().catch(console.error);
