import { BaseInput, BaseInputProps } from './BaseInput.tsx'

type NumberInputProps = Omit<BaseInputProps, 'type'>

export const NumberInput = (props: NumberInputProps) => {
  return (
    <BaseInput
      {...props}
      type="number"
      inputMode="decimal"
      className="text-body border border-primary px-[16px]  py-[7px] outline-none transition-colors placeholder:text-placeholder focus:border-[#8f8f8f]"
    />
  )
}
