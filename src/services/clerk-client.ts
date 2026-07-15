type ClerkApiError = {
  errors?: Array<{ message?: string }>;
};

declare global {
  interface Window {
    Clerk?: {
      client?: {
        signIn: {
          create: (params: { identifier: string; password: string }) => Promise<{
            status: string;
            createdSessionId: string;
          }>;
          authenticateWithRedirect: (params: {
            strategy: string;
            redirectUrl: string;
            redirectUrlComplete: string;
          }) => Promise<void>;
        };
        signUp: {
          create: (params: {
            emailAddress: string;
            password: string;
            firstName: string;
            lastName: string;
            phoneNumber?: string;
          }) => Promise<void>;
          prepareEmailAddressVerification: (params: { strategy: string }) => Promise<void>;
          attemptEmailAddressVerification: (params: { code: string }) => Promise<{
            status: string;
            createdSessionId: string;
          }>;
          authenticateWithRedirect: (params: {
            strategy: string;
            redirectUrl: string;
            redirectUrlComplete: string;
          }) => Promise<void>;
        };
      };
      setActive: (params: { session: string }) => Promise<void>;
    };
  }
}

export function getClerkClient() {
  return window.Clerk;
}

export function getClerkErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null && "errors" in err) {
    const errors = (err as ClerkApiError).errors;
    return errors?.[0]?.message ?? fallback;
  }
  return fallback;
}
