export const EventCardSkeleton = () => (
  <div className="flex min-h-[14px] sm:min-h-[176px] flex-col rounded-md border border-primary bg-secondary p-[10px] sm:p-[20px]">
    <div className="flex items-start justify-between gap-4">
      <span className="h-[20px] w-[137px] sm:w-[214px] rounded-lg bg-skeleton" />
      <span className="h-[25px] w-[100px] rounded-lg bg-skeleton" />
    </div>
    <div className="mt-5 flex flex-1 items-center sm:items-end justify-between">
      <div className="flex flex-1 flex-col gap-3">
        <span className="h-[20px] w-[180px] rounded-lg bg-skeleton" />
        <span className="h-[20px] w-[180px] rounded-lg bg-skeleton" />
      </div>
      <span className="h-[90px] w-[90px] rounded-[10px] bg-skeleton" />
    </div>
  </div>
)
