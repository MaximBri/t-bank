import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useUserStore } from '@/entities/user'
import { Text } from '@/shared/ui/text/Text'
import { Button } from '@/shared/ui/button/Button'
import { ButtonEnum } from '@/shared/ui/button/constants'
import { TextField } from '@/shared/ui/form-fields'
import EditIcon from '@/shared/assets/icons/edit.svg?react'
import ExitIcon from '@/shared/assets/icons/exit.svg?react'

import { getProfileItems } from '../model/constants'
import { profileSchema, type ProfileSchemaValues } from '../model/schema'
import { getProfileFormFields, profileFormDefaultValues } from './constants'
import { userApi } from '@/entities/user'

export const ProfileInfo = () => {
  const queryClient = useQueryClient()
  const userStore = useUserStore()
  
  const [editMode, setEditMode] = useState<boolean>(false)
  const [profileValues, setProfileValues] = useState<ProfileSchemaValues>(profileFormDefaultValues)

  const form = useForm<ProfileSchemaValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: profileValues,
  })

  const profileItems = getProfileItems(profileValues)
  const formFields = getProfileFormFields()
  const fieldByName = Object.fromEntries(formFields.map((field) => [field.name, field]))

  const handleSave = form.handleSubmit((values) => {
    setProfileValues(values)
    setEditMode(false)
  })

  const handleExit = async () => {
    try {
      await userApi.logout()
      queryClient.invalidateQueries()
      userStore.clearUser()
      toast.success('Вы успешно вышли из аккаунта')
    } catch {
      toast.error('Не удалось выйти из аккаунта')
    }
  }

  return (
    <FormProvider {...form}>
      <section className="flex flex-col gap-[10px] bg-secondary border-2 border-primary rounded-md md:rounded-lg p-[10px] md:p-6">
        <Text as="h2" variant="h2" className="text-h3-d">
          Персональные данные
        </Text>
        <ul className="flex flex-col gap-[12px]">
          {profileItems.map((item) => (
            <li key={item.name} className="flex gap-[15px] pb-3 border-b border-primary">
              <item.icon className="w-6 h-6 text-placeholder shrink-0 mt-1" />
              <div className="flex flex-col gap-[10px] flex-1">
                <p className="text-h3-d md:text-h2-d font-normal text-placeholder">{item.label}</p>
                {editMode ? (
                  <TextField {...fieldByName[item.name]} />
                ) : (
                  <Text variant="h3">{item.value}</Text>
                )}
              </div>
            </li>
          ))}
        </ul>
        <nav className="flex flex-col gap-[10px] mt-[10px] max-w-[340px]">
          {!editMode ? (
            <Button type="button" onClick={() => setEditMode(true)}>
              <EditIcon className="w-[18px] h-[16px] md:w-6 md:h-6" />
              Редактировать профиль
            </Button>
          ) : (
            <Button type="button" onClick={handleSave} isLoading={form.formState.isSubmitting}>
              Сохранить
            </Button>
          )}
          <Button type="button" variant={ButtonEnum.Tertiary} onClick={handleExit}>
            <ExitIcon className="w-[18px] h-[16px] md:w-6 md:h-6" />
            Выйти
          </Button>
        </nav>
      </section>
    </FormProvider>
  )
}
