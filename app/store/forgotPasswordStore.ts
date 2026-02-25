import { proxy } from "valtio";

interface ForgotPasswordStore {
    isOpen: boolean;
}

export const forgotPasswordStore = proxy<ForgotPasswordStore>({
    isOpen: false,
});

export const openForgotPassword = () => {
    forgotPasswordStore.isOpen = true;
};

export const closeForgotPassword = () => {
    forgotPasswordStore.isOpen = false;
};