export { sendEmail } from "./sender";
export type { SendEmailOptions } from "./sender";

// Template exports — used for direct rendering or preview
export { default as VerifyEmailTemplate } from "./templates/verify-email";
export { default as ResetPasswordTemplate } from "./templates/reset-password";
export { default as InviteMemberTemplate } from "./templates/invite-member";
export { default as WelcomeTemplate } from "./templates/welcome";
export { default as SubscriptionActiveTemplate } from "./templates/subscription-active";
export { default as SubscriptionFailedTemplate } from "./templates/subscription-failed";
export { default as SubscriptionCancelledTemplate } from "./templates/subscription-cancelled";
