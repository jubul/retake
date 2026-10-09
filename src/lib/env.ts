// src/lib/env.ts  (SOLO importar desde código de servidor, scripts y tests)
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD: mínimo 8 caracteres'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET: mínimo 32 caracteres'),
  UPLOADS_DIR: z.string().min(1).default('data/uploads'),
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z
    .string()
    .regex(/^\d{8,15}$/, 'Solo dígitos, con código de país (ej. 549...)'),
  NEXT_PUBLIC_INSTAGRAM: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Parsea process.env una sola vez. Lanza un Error legible si falta algo. */
export function getEnv(): Env {
  if (cached) return cached;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(result.error)}`);
  }
  cached = result.data;
  return cached;
}
