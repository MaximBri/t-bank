import {
    createImageField,
    createNumberField,
    createSelectField,
    createTextAreaField,
    createTextField,
    FormFieldConfig, FormOption
} from "@/shared/lib/forms";
import {CreateExpenseFormValues, ExpenseCandidate, ParticipantsFieldConfig } from "../model/types.ts";
import {ExpenseCategory} from "@/entities/expense";
import {
    createExpenseFieldInputClassName,
    createExpenseFieldLabelClassName
} from "@/features/CreateExpenseModal/model/constants.ts";


type CreateExpenseFormFields = {
    titleField: FormFieldConfig<CreateExpenseFormValues>
    amountField: FormFieldConfig<CreateExpenseFormValues>
    categoryField: FormFieldConfig<CreateExpenseFormValues>
    commentField: FormFieldConfig<CreateExpenseFormValues>
    checkImageField: FormFieldConfig<CreateExpenseFormValues>
    participantsField: ParticipantsFieldConfig<CreateExpenseFormValues>
}

type formProps = {
    categories: ExpenseCategory[]
    participants: ExpenseCandidate[]
}

export const getCreateExpenseFormFields = ({categories, participants}: formProps): CreateExpenseFormFields => {
    const categoriesOptions: FormOption[] = categories.map((category): FormOption => ({
        value: category,
        label: category
    }))

    const titleField = createTextField<CreateExpenseFormValues>({
        name: 'title',
        labelClassName: createExpenseFieldLabelClassName,
        fieldClassName: createExpenseFieldInputClassName,
        type: 'text',
        label: 'Заголовок',
        placeholder: 'Придумайте название для расхода',
        required: true,
    })

    const amountField = createNumberField<CreateExpenseFormValues>({
        name: 'amount',
        type: 'number',
        labelClassName: createExpenseFieldLabelClassName,
        fieldClassName: createExpenseFieldInputClassName,
        label: 'Сумма, руб',
        min: 0,
        max: 1000000000000000,
        placeholder: "Введите сумму",
        withoutClearButton: true,
        required: true,
    })

    const categoryField = createSelectField<CreateExpenseFormValues>({
        name: 'category',
        labelClassName: createExpenseFieldLabelClassName,
        fieldClassName: createExpenseFieldInputClassName,
        type: 'select',
        label: 'Категория',
        options: categoriesOptions,
        required: true
    })

    const commentField = createTextAreaField<CreateExpenseFormValues>({
        name: 'comment',
        type: 'textarea',
        labelClassName: createExpenseFieldLabelClassName,
        fieldClassName: `${createExpenseFieldInputClassName} h-[150px] resize-none`,
        label: 'Комментарий',
        placeholder: 'Дополнительная информация о расходе...'
    })

    const checkImageField = createImageField<CreateExpenseFormValues>({
        name: 'checkImage',
        type: 'image',
        labelClassName: createExpenseFieldLabelClassName,
        fieldClassName: "h-[150px] bg-secondary rounded-md border-dashed border-[2px]",
        label: 'Чек или подтверждающий документ',
        accept: 'image/*,.pdf,application/pdf',
        required: true
    })

    const participantsField: ParticipantsFieldConfig<CreateExpenseFormValues> = {
        name: 'participants',
        type: 'multiselect',
        label: 'Разделить между участниками',
        labelClassName: createExpenseFieldLabelClassName,
        fieldClassName: createExpenseFieldInputClassName,
        placeholder: 'Выберите участников...',
        participants: participants,
        required: true
    }

    return {
        titleField,
        amountField,
        checkImageField,
        commentField,
        categoryField,
        participantsField
    }
}
