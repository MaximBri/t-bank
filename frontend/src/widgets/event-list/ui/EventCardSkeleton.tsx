export const EventCardSkeleton = () => (
  <div className="flex min-h-[176px] flex-col rounded-[16px] border border-primary bg-secondary p-[20px]">
    <div className="flex items-start justify-between gap-4">
      <span className="h-[20px] w-[214px] rounded-[24px] bg-skeleton" />
      <span className="h-[25px] w-[100px] rounded-[24px] bg-skeleton" />
    </div>
    <div className="mt-5 flex flex-1 items-end justify-between">
      <div className="flex flex-1 flex-col gap-3">
        <span className="h-[20px] w-[180px] rounded-[24px] bg-skeleton" />
        <span className="h-[20px] w-[180px] rounded-[24px] bg-skeleton" />
      </div>
      <span className="h-[90px] w-[90px] rounded-[10px] bg-skeleton" />
    </div>
  </div>
)
