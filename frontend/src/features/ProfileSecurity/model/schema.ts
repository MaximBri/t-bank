import z from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
    confirmPassword: z.string().min(1, 'Подтвердите новый пароль'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  })

export type ChangePasswordSchema = typeof changePasswordSchema
export type ChangePasswordValues = z.infer<ChangePasswordSchema>
