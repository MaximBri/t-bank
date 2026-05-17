import {createTextField, TextFieldConfig} from "@/shared/lib/forms";
import type {ProfileSchemaValues} from "@/features/ProfileInfo/model/schema.ts";
import {FormFieldVariant} from "@/shared/lib/forms/types.ts";

export const getProfileFormFields = (): TextFieldConfig<ProfileSchemaValues>[] => [
    createTextField<ProfileSchemaValues>({
        name: 'firstName',
        type: 'text',
        label: '',
        labelClassName: 'hidden',
        placeholder: 'Имя',
        required: true,
        variant: FormFieldVariant.Filled,
        withoutClearButton: true,
    }),
    createTextField<ProfileSchemaValues>({
        name: 'lastName',
        type: 'text',
        label: '',
        labelClassName: 'hidden',
        placeholder: 'Фамилия',
        required: true,
        variant: FormFieldVariant.Filled,
        withoutClearButton: true,
    }),
]