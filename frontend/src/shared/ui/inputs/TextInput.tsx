import { BaseInput, BaseInputProps } from './BaseInput.tsx'

type TextInputProps = Omit<BaseInputProps, 'type'>

export const TextInput = (props: TextInputProps) => {
  return <BaseInput {...props} type="text" />
}
