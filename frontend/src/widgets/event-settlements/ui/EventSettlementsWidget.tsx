import ArrowBoldIcon from '@/shared/assets/icons/arrow-bold.svg?react'
import ArrowGrowthIcon from '@/shared/assets/icons/arrow-growth.svg?react'

import { mockSettlements } from '@/entities/settlement/model/mock.ts'
import { SettlementStatus } from '@/entities/settlement/model/types.ts'
import { formatPrice } from '@/shared/lib/number/format-price.ts'
import { Button } from '@/shared/ui/button/Button.tsx'
import { ButtonEnum } from '@/shared/ui/button/constants.ts'
import { Text } from '@/shared/ui/text/Text.tsx'

export const EventSettlementsWidget = () => {
  return (
    <section className="flex flex-col gap-[15px] sm:gap-[20px]">
      <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
        <Text variant="h1" as="h1" className="font-semibold">
          Итоговые взаиморасчёты
        </Text>
      </div>
      <div className="flex flex-col gap-[20px] rounded-[16px] border-[2px] border-primary bg-secondary p-[10px] sm:gap-[25px] sm:p-[34px]">
        <div className="flex flex-col">
          <div className="flex gap-[20px]">
            <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-md bg-yellow p-[8px]">
              <ArrowGrowthIcon height={48} width={48} />
            </div>
            <div className="flex flex-col">
              <Text className="text-h3-d sm:text-h2-d">Сводка взаиморасчётов</Text>
              <Text variant="h3" className="mt-auto hidden font-medium sm:block">
                Оптимизированный список переводов для закрытия всех долгов
              </Text>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[15px]">
          {mockSettlements.map((settlement) => (
            <div
              key={settlement.id}
              className="flex flex-col rounded-lg border-[2px] border-primary bg-primary p-[10px] sm:flex-row sm:px-[20px] sm:py-[10px]"
            >
              <div className="flex flex-1 items-center gap-[20px]">
                <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-yellow sm:h-[80px] sm:w-[80px]">
                  <Text className="text-h3-d sm:text-h2-d">{settlement.fromUser.initials}</Text>
                </div>
                <div className="max-w-[250px] min-w-0">
                  <Text className="truncate text-h3-d font-medium sm:text-h2-d">
                    {settlement.fromUser.fullName}
                  </Text>
                  <Text className="text-h3-d font-medium text-muted">должен(-на)</Text>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <ArrowBoldIcon width={44} height={44} className="rotate-180 sm:rotate-90" />
              </div>
              <div className="flex flex-1 flex-row-reverse items-center justify-end gap-[20px] text-right sm:flex-row sm:pr-[100px] sm:text-left 3xl:pr-[180px]">
                <div className="max-w-[250px] min-w-0 text-start sm:text-end">
                  <Text className="truncate text-h3-d font-medium sm:text-h2-d">
                    {settlement.toUser.fullName}
                  </Text>
                  <Text className="text-h3-d font-medium text-muted">получит</Text>
                </div>
                <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-yellow sm:h-[80px] sm:w-[80px]">
                  <Text className="text-h3-d sm:text-h2-d">{settlement.toUser.initials}</Text>
                </div>
              </div>
              <div className="flex flex-1 flex-col-reverse items-center justify-end gap-[10px] sm:flex-row sm:gap-[20px]">
                {settlement.status === SettlementStatus.Pending ? (
                  <Button>
                    <Text variant="h2" className="font-normal">
                      Оплатить
                    </Text>
                  </Button>
                ) : (
                  <Button variant={ButtonEnum.Secondary}>
                    <Text variant="h2" className="font-normal">
                      Подтвердить
                    </Text>
                  </Button>
                )}
                <Text className="text-h2 sm:text-h1-d">{formatPrice(settlement.amount)}</Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
