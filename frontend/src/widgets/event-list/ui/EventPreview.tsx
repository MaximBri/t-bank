type EventPreviewProps = {
  img: string
}

export const EventPreview = ({ img }: EventPreviewProps) => (
  <img className="h-[90px] w-[90px] rounded-[11px]" src={img} alt="alt" />
)
