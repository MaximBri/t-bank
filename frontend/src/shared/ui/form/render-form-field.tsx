import type { FormFieldConfig } from '@/shared/lib/forms'

import { DateField } from '@/shared/ui/form-fields'
import { ImageField } from '@/shared/ui/form-fields'
import { NumberField } from '@/shared/ui/form-fields'
import { TextAreaField } from '@/shared/ui/form-fields'
import { TextField } from '@/shared/ui/form-fields'

export const renderFormField = <TFieldValues extends Record<string, unknown>>(
  field: FormFieldConfig<TFieldValues>,
) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
      return <TextField key={field.name} {...field} />
    case 'textarea':
      return <TextAreaField key={field.name} {...field} />
    case 'number':
      return <NumberField key={field.name} {...field} />
    case 'date':
      return <DateField key={field.name} {...field} />
    case 'image':
      return <ImageField key={field.name} {...field} />
    default:
      return null
  }
}
