import { useState } from 'react'

import NotificationIcon from '@/shared/assets/icons/notification.svg?react'
import { Text } from '@/shared/ui/text/Text'
import { Toggle } from '@/shared/ui/toggle'

import {
  notificationDefaults,
  notificationItems,
  type NotificationItemId,
  type NotificationSettings,
} from '../model/constants'

type SettingsState = Record<NotificationItemId, NotificationSettings>

export const ProfileNotifications = () => {
  const [settings, setSettings] = useState<SettingsState>(notificationDefaults)

  const updateSetting = (
    id: NotificationItemId,
    key: keyof NotificationSettings,
    value: boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }))
  }

  return (
    <section className="flex flex-col gap-[10px] md:gap-[20px] bg-secondary border-2 border-primary rounded-md md:rounded-lg p-[10px] md:p-6">
      <Text as="h2" variant="h2" className="text-h3-d">
        Настройки уведомлений
      </Text>

      <div className="flex flex-col gap-[2px]">
        <div
          className="
            grid items-center
            grid-cols-[minmax(0,1fr)_auto_auto]
            gap-x-[12px] md:gap-x-[40px]
            pb-[8px] border-b border-primary
          "
        >
          <Text as="span" variant="h3">
            Тип события
          </Text>
          <Text as="span" variant="h3">
            На сайте
          </Text>
          <Text as="span" variant="h3">
            По email
          </Text>
        </div>

        {notificationItems.map(({ id, label }) => {
          const value = settings[id]
          return (
            <div
              key={id}
              className="
                grid items-center
                grid-cols-[minmax(0,1fr)_auto_auto]
                gap-x-[12px] md:gap-x-[92px]
                rounded-lg hover:bg-primary
                px-[8px] md:px-[12px] py-[10px] md:py-[14px]
                transition-colors duration-150 h-[64px]
              "
            >
              <div className="flex items-center gap-[10px] min-w-0">
                <NotificationIcon className="w-[18px] h-[18px] md:w-6 md:h-6 shrink-0" />
                <Text as="span" variant="h3">
                  {label}
                </Text>
              </div>

              <div className="flex justify-center w-[44px] md:w-auto">
                <Toggle
                  checked={value.onSite}
                  onChange={(next) => updateSetting(id, 'onSite', next)}
                  aria-label={`${label}: на сайте`}
                />
              </div>

              <div className="flex justify-center w-[44px] md:w-auto">
                <Toggle
                  checked={value.byEmail}
                  onChange={(next) => updateSetting(id, 'byEmail', next)}
                  aria-label={`${label}: по email`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
