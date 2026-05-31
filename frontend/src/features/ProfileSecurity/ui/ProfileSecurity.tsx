import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Text } from '@/shared/ui/text/Text'
import { Button } from '@/shared/ui/button/Button'
import { TextField } from '@/shared/ui/form-fields'
import EditIcon from '@/shared/assets/icons/edit.svg?react'

import { changePasswordSchema, type ChangePasswordValues } from '../model/schema'
import { changePasswordDefaultValues, getChangePasswordFields } from './constants'
import {useUserStore} from "@/entities/user";
import {toast} from "sonner";

const mapPasswordErrorMessage = (message: string) => {
  if (message === 'Incorrect current password') {
    return 'Неверно указан текущий пароль'
  }

  return message
}

export const ProfileSecurity = () => {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
    defaultValues: changePasswordDefaultValues,
  })
  const changePassword = useUserStore(state => state.changePassword)
  const fields = getChangePasswordFields()

  const handleSave = form.handleSubmit(async (data) => {
    const formData = {
      current_password: data.currentPassword,
      new_password: data.newPassword,
    }
    try {
      await changePassword(formData)
      toast.success('Пароль успешно изменён')
      form.reset(changePasswordDefaultValues)
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка'
      toast.error('Ошибка при изменении пароля: ' + mapPasswordErrorMessage(message))
    }
  })

  return (
    <FormProvider {...form}>
      <section className="flex flex-col gap-[10px] md:gap-[20px] bg-secondary border-2 border-primary rounded-md md:rounded-lg p-[10px] md:p-6">
        <Text as="h2" variant="h2" className='text-h3-d'>
          Изменение пароля
        </Text>
        <div className="flex flex-col gap-[16px] max-w-[586px]">
          {fields.map((field) => (
            <TextField fieldClassName='h-[47px]' key={field.name} {...field} />
          ))}
        </div>
        <Button
          type="button"
          onClick={handleSave}
          isLoading={form.formState.isSubmitting}
          className="self-start mt-[10px] sm:m-0 w-full md:w-auto"
        >
          <EditIcon className='w-[18px] md:w-6'/>
          Изменить пароль
        </Button>
      </section>
    </FormProvider>
  )
}
