type EventPreviewProps = {
  img: string
}

export const EventPreview = ({ img }: EventPreviewProps) => (
  <img className="h-[90px] w-[90px] rounded-[11px] object-cover object-center overflow-hidden" src={img} alt="Превью события" />
)
