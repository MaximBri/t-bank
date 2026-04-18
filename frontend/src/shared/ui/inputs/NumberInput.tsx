import { BaseInput, BaseInputProps } from './BaseInput.tsx'

type NumberInputProps = Omit<BaseInputProps, 'type'>

export const NumberInput = (props: NumberInputProps) => {
  return <BaseInput {...props} type="number" inputMode="decimal" />
}
