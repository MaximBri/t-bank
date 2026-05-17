import type {ProfileSchemaValues} from "@/features/ProfileInfo/model/schema.ts";
import {ProfileItem} from "@/features/ProfileInfo/model/types.ts";
import UserIcon from "@/shared/assets/icons/user.svg?react";
import EmailIcon from "@/shared/assets/icons/email.svg?react";

export const getProfileItems = (values: ProfileSchemaValues): ProfileItem[] => [
    {
        name: 'firstName',
        label: 'Имя',
        value: values.firstName ?? "",
        icon: UserIcon,
    },
    {
        name: 'lastName',
        label: 'Фамилия',
        value: values.lastName ?? "",
        icon: UserIcon,
    },
    {
        name: 'email',
        label: 'Email',
        value: values.email,
        icon: EmailIcon,
    },
]