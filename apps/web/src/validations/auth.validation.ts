import { z } from 'zod';
import { APP_CONSTANTS } from '@/constants/app.constants';

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email ou username é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z
    .string()
    .min(APP_CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH, `Username deve ter pelo menos ${APP_CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH} caracteres`)
    .max(APP_CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH, `Username deve ter no máximo ${APP_CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH} caracteres`)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username pode conter apenas letras, números, _ e -'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter maiúscula, minúscula e número'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

