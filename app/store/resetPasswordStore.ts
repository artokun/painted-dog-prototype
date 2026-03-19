import { proxy } from "valtio";

interface ResetPasswordStore {
    isOpen: boolean;
    customerId: string | null;
    token: string | null;
}

export const resetPasswordStore = proxy<ResetPasswordStore>({
    isOpen: false,
    customerId: null,
    token: null,
});

export const openResetPassword = (customerId: string, token: string) => {
    resetPasswordStore.customerId = customerId;
    resetPasswordStore.token = token;
    resetPasswordStore.isOpen = true;
};

export const closeResetPassword = () => {
    resetPasswordStore.isOpen = false;
    resetPasswordStore.customerId = null;
    resetPasswordStore.token = null;
};