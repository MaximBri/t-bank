import ArrowGrowthIcon from "@/shared/assets/icons/arrow-growth.svg?react"
import ArrowBoldIcon from "@/shared/assets/icons/arrow-bold.svg?react"

import {Settlement, SettlementStatus} from "@/entities/settlement/model/types.ts";
import {Text} from "@/shared/ui/text/Text.tsx";
import {Button} from "@/shared/ui/button/Button.tsx";
import {ButtonEnum} from "@/shared/ui/button/constants.ts";
import {formatPrice} from "@/shared/lib/number/format-price.ts";

const settlements: Settlement[] = [
    {
        id: 1,
        fromUser: {
            id: 101,
            fullName: "Анна Смирнова",
            avatarUrl: "https://i.pravatar.cc/150?img=1",
            initials: "А.С."
        },
        toUser: {
            id: 102,
            fullName: "Иван Петров",
            avatarUrl: "https://i.pravatar.cc/150?img=2",
            initials: "И.П."
        },
        amount: 1250,
        status: SettlementStatus.Pending
    },
    {
        id: 3,
        fromUser: {
            id: 105,
            fullName: "Ольга Соколова",
            avatarUrl: "https://i.pravatar.cc/150?img=5",
            initials: "О.С."
        },
        toUser: {
            id: 106,
            fullName: "Алексей Морозов",
            avatarUrl: "https://i.pravatar.cc/150?img=6",
            initials: "А.М."
        },
        amount: 2100,
        status: SettlementStatus.WaitingConfirmation
    },
    {
        id: 4,
        fromUser: {
            id: 107,
            fullName: "Екатерина Лебедева",
            avatarUrl: "https://i.pravatar.cc/150?img=7",
            initials: "Е.Л."
        },
        toUser: {
            id: 108,
            fullName: "Сергей Никитин",
            avatarUrl: "https://i.pravatar.cc/150?img=8",
            initials: "С.Н."
        },
        amount: 540,
        status: SettlementStatus.Pending
    }
]

export const EventSettlementsWidget = () => {
    return (
        <section className="flex flex-col gap-[15px] sm:gap-[20px]">
            <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
                <Text variant="h1" as="h1" className="font-semibold">Итоговые взаиморасчёты</Text>
            </div>
            <div className="flex flex-col rounded-[16px] gap-[20px] sm:gap-[25px] border-[2px] border-primary bg-secondary p-[10px] sm:p-[34px]">
                <div className="flex flex-col">
                    <div className="flex gap-[20px]">
                        <div className="flex w-[64px] h-[64px] shrink-0 items-center justify-center p-[8px] bg-yellow rounded-md">
                            <ArrowGrowthIcon height={48} width={48}/>
                        </div>
                        <div className="flex flex-col">
                            <Text className="text-h3-d sm:text-h2-d">Сводка взаиморасчётов</Text>
                            <Text variant="h3" className="mt-auto font-medium hidden sm:block">Оптимизированный список переводов для
                                закрытия всех долгов</Text>
                        </div>
                    </div>
                    <div>

                    </div>
                </div>
                <div className="flex flex-col gap-[15px]">
                {settlements.map((settlement) => (
                    <div key={settlement.id} className="flex flex-col sm:flex-row p-[10px] sm:px-[20px] sm:py-[10px] bg-primary border-[2px] border-primary rounded-lg">
                        <div className="flex-1 flex gap-[20px] items-center">
                            <div className="flex h-[60px] w-[60px] sm:h-[80px] sm:w-[80px] shrink-0 bg-yellow rounded-full justify-center items-center">
                                <Text className="text-h3-d sm:text-h2-d">{settlement.fromUser.initials}</Text>
                            </div>
                            <div className="max-w-[250px] min-w-0">
                                <Text className="font-medium truncate text-h3-d sm:text-h2-d">{settlement.fromUser.fullName}</Text>
                                <Text className="text-h3-d font-medium text-muted">должен(-на)</Text>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <ArrowBoldIcon width={44} height={44} className="rotate-180 sm:rotate-90"/>
                        </div>
                        <div className="flex-1 flex flex-row-reverse sm:flex-row gap-[20px] items-center justify-end text-right sm:pr-[100px] 3xl:pr-[180px]">
                            <div className="max-w-[250px] min-w-0 text-start sm:text-end">
                                <Text className="font-medium truncate text-h3-d sm:text-h2-d">{settlement.toUser.fullName}</Text>
                                <Text className="text-h3-d font-medium text-muted">получит</Text>
                            </div>
                            <div className="flex h-[60px] w-[60px] sm:h-[80px] sm:w-[80px] shrink-0 bg-yellow rounded-full justify-center items-center">
                                <Text className="text-h3-d sm:text-h2-d">{settlement.toUser.initials}</Text>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-[10px] sm:gap-[20px] justify-end items-center">
                            { settlement.status === SettlementStatus.Pending ?
                                <Button>
                                    <Text variant="h2" className="font-normal">Оплатить</Text>
                                </Button> :
                                <Button variant={ButtonEnum.Secondary}>
                                    <Text variant="h2" className="font-normal">Подтвердить</Text>
                                </Button>
                            }
                            <Text className="text-h2 sm:text-h1-d">{formatPrice(settlement.amount)}</Text>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </section>
    )
}