import { isProduction } from "@asafarim/shared-ui-react";

export const getLoginUrl = (returnUrl: string) => {
    return `http://identity.asafarim.${isProduction ? 'be' : 'local:5177'}/login?returnUrl=${returnUrl}`;
}