import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { createTextField, type TextFieldConfig } from '@/shared/lib/forms'
import { APP_ROUTES } from '@/shared/routes'
import { TextField } from '@/shared/ui/form-fields'

import { signInByCredentialsSchema } from '../model/schema.ts'
import type {
    SignInByCredentialsFormValues,
    SignInByCredentialsPayload,
    SignInByCredentialsSubmit,
} from '../model/types.ts'

const signInFieldLabelClassName =
    'text-[16px] font-inter font-medium text-primary'
const signInFieldInputClassName =
    'font-inter font-medium rounded-[16px] bg-primary border border-primary px-[16px] py-[14px] text-[16px] border-[2px]'


const signInFields: TextFieldConfig<SignInByCredentialsFormValues>[] = [
    createTextField<SignInByCredentialsFormValues>(
        {
            name: 'login',
            type: 'text',
            label: 'Логин',
            labelClassName: signInFieldLabelClassName,
            fieldClassName: signInFieldInputClassName,
            placeholder: 'Ваш логин',
            required: true,
        }
    ),
    createTextField<SignInByCredentialsFormValues>({
        name: 'password',
        type: 'password',
        label: 'Пароль',
        labelClassName: signInFieldLabelClassName,
        fieldClassName: signInFieldInputClassName,
        placeholder: 'Ваш пароль',
        required: true,
    }),
]


type SignInFormProps = {
    onSubmit?: SignInByCredentialsSubmit
}

const defaultSubmit: SignInByCredentialsSubmit = async (_payload: SignInByCredentialsPayload) => {
    await Promise.resolve()
}

export const SignInForm = ({ onSubmit = defaultSubmit }: SignInFormProps) => {
    const methods = useForm<SignInByCredentialsFormValues>({
        resolver: zodResolver(signInByCredentialsSchema),
        mode: 'onTouched',
        defaultValues: {
            login: '',
            password: ''
        },
    })

    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        formState: { isSubmitting },
        handleSubmit,
        reset,
    } = methods

    const submitForm = handleSubmit(async ({ login, password }) => {
        setSubmitError(null)

        try {
            await onSubmit({ login, password })
            reset({
                login: '',
                password: '',
            })
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить форму')
        }
    })

    return (
        <FormProvider {...methods}>
            <form
                className="flex w-[400px] flex-col gap-[10px] rounded-[24px] bg-secondary p-[25px]"
                onSubmit={submitForm}
            >
                <div className="gap-[10px]">
                    <h3 className="font-inter text-[20px] font-medium text-primary">Вход</h3>
                    <p className="font-inter text-[14px] font-medium text-muted">
                        Войдите в свой аккаунт
                    </p>
                </div>

                <div className="flex flex-col gap-[27px]">
                    {signInFields.map((field) => (
                        <TextField key={field.name} {...field} />
                    ))}
                    {submitError ? (
                        <p className="text-sm text-error">
                            {submitError}
                        </p>
                    ) : null}

                    <div className="flex flex-col items-center justify-center gap-[21px]">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-[16px] border-[2px] border-yellow bg-yellow py-[10px] font-inter font-medium text-primary disabled:bg-yellow-disabled"
                        >
                            {isSubmitting ? 'Отправка...' : 'Войти'}
                        </button>
                        <p className="font-inter">
                            Нет аккаунта?{' '}
                            <Link to={APP_ROUTES.REGISTER} replace className="font-semibold underline">
                                Зарегистрироваться
                            </Link>
                        </p>
                    </div>
                </div>
            </form>
        </FormProvider>
    )
}