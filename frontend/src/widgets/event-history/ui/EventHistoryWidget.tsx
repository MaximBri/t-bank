import SearchIcon from '@/shared/assets/icons/search.svg?react'

import {Text} from "@/shared/ui/text/Text.tsx";
import {TextInput} from "@/shared/ui/inputs";
import {HistoryRecord, HistoryRecordType} from "@/entities/historyRecord/model/type.ts";
import {HistoryRecordTypeTranslation} from "@/entities/historyRecord/model/constants.ts";
import {useState} from "react";
import clsx from "clsx";

const historyRecords : HistoryRecord[] = [
    {
        id: 1,
        type: HistoryRecordType.EventCompleted,
        detail: "Событие завершено",
        userFullName: "Антон Сидоров",
        createdAt: "15.05.2026 17:46",
    },
    {
        id: 2,
        type: HistoryRecordType.ExpenseCreated,
        detail: "Добавлен расход «Экскурсия по городу»",
        userFullName: "Дмитрий Волков",
        createdAt: "14.05.2026 18:45",
    },
    {
        id: 3,
        type: HistoryRecordType.UserJoined,
        detail: "Присоединился к событию",
        userFullName: "Дмитрий Волков",
        createdAt: "13.05.2026 11:05",
    },
    {
        id: 4,
        type: HistoryRecordType.EventCreated,
        detail: "Создано событие",
        userFullName: "Антон Сидоров",
        createdAt: "12.05.2026 08:05",
    },
    {
        id: 6,
        type: HistoryRecordType.ExpenseUpdated,
        detail: "Обновлен расход «Бронирование отеля»",
        userFullName: "Екатерина Смирнова",
        createdAt: "11.05.2026 14:22",
    },
    {
        id: 7,
        type: HistoryRecordType.UserLeft,
        detail: "Покинул событие",
        userFullName: "Илья Петров",
        createdAt: "10.05.2026 09:10",
    },
    {
        id: 8,
        type: HistoryRecordType.UserRemoved,
        detail: "Удален из списка участников",
        userFullName: "Антон Сидоров",
        createdAt: "09.05.2026 10:35",
    },
    {
        id: 9,
        type: HistoryRecordType.ExpenseDeleted,
        detail: "Удален расход «Трансфер из аэропорта»",
        userFullName: "Екатерина Смирнова",
        createdAt: "08.05.2026 12:18",
    },
]

export const EventHistoryWidget = () => {
    const buttons = ["Все", "Расходы", "Участники", "События"]
    const [activeIndex, setActiveIndex] = useState<number>(0);

    return (
        <section className="flex flex-col gap-[15px] sm:gap-[20px]">
            <div>
                <Text as="h1" className="text-h2 sm:text-h1-d font-semibold">История событий</Text>
            </div>
            <div className="flex flex-col gap-[10px] sm:gap-[24px] bg-secondary p-[10px] sm:p-[24px] border-[2px] border-primary rounded-lg">
                <div className="flex flex-col gap-[10px] sm:gap-[16px]">
                    <div className="flex flex-col sm:flex-row gap-[10px] sm:gap-[20px] justify-between">
                        <div className="flex-1 sm:max-w-[660px]">
                            <TextInput
                                name="history-search"
                                className=" text-body sm:text-h3-d h-[40px] sm:h-[56px] rounded-[10px] sm:rounded-md border border-primary pl-[67px] pr-[16px] text-primary placeholder:text-placeholder focus:border-primary"
                                placeholder="Поиск по истории"
                                icon={<SearchIcon width="24px" height="24px" className="text-placeholder" />}
                                iconPosition="left"
                            />
                        </div>
                        <div className="flex flex-wrap gap-[10px] sm:gap-[14px]">
                            {buttons.map((button, index) => (
                                <button
                                    onClick={() => setActiveIndex(index)}
                                    className={clsx(
                                        "border border-primary rounded-[10px] sm:rounded-md px-[10px] sm:px-[16px]",
                                        index === activeIndex ? "bg-yellow": null
                                    )}
                                >
                                    <Text variant="h3" className="font-normal">{button}</Text>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Text className="text-h3-d sm:text-h2-d font-medium">Всего записей: {historyRecords.length}</Text>
                    </div>
                </div>
                <div className="flex flex-col gap-[10px] sm:gap-[24px]">
                    {historyRecords.map((record, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:gap-[10px] items-start sm:justify-between">
                            <div>
                                <div className="flex gap-[16px] items-center justify-center">
                                    <div className="w-[16px] h-[16px] shrink-0 bg-yellow rounded-full"></div>
                                    <Text className="text-h3-d sm:text-h2-d font-medium">{record.detail}</Text>
                                </div>
                                <Text variant="h3" className="sm:ml-[32px] text-placeholder">{record.userFullName}</Text>
                            </div>
                            <div className="text-end">
                                <Text className="hidden sm:text-h2-d sm:block font-medium">{HistoryRecordTypeTranslation[record.type]}</Text>
                                <Text variant="h3" className="text-placeholder">{record.createdAt}</Text>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
