import type { Dictionary } from "./ar";

const en: Dictionary = {
  common: {
    brand: "Wassla",
    loading: "Loading...",
    submit: "Submit",
    cancel: "Cancel",
    back: "Back",
    language: "Language",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
  },
  nav: {
    dashboard: "Dashboard",
    profile: "Profile",
    admin: "Admin",
    merchant: "Merchant",
    logout: "Log out",
  },
  landing: {
    login: "Log in",
    getStarted: "Get started",
    heroTitle: "Connecting your brand with the right creators",
    heroSubtitle:
      "Wassla connects brand owners with content creators to build successful ad campaigns across fashion, beauty, restaurants & cafes, residential communities, and food products.",
    categories: ["Fashion", "Beauty", "Restaurants & Cafes", "Residential Communities", "Food Products"],
    steps: [
      {
        title: "For brand owners",
        description: "Create your campaign, set your budget, and pick the creators that fit your brand best.",
      },
      {
        title: "For content creators",
        description: "Browse campaigns in your niche, connect with brands, and start collaborating easily.",
      },
      {
        title: "Fair commission",
        description: "Wassla only takes a simple commission on successful campaigns — no subscription fees, no surprises.",
      },
    ],
    footer: "All rights reserved",
  },
  auth: {
    login: {
      title: "Log in",
      subtitle: "Enter your phone number and we'll send you a verification code",
      phoneLabel: "Phone number",
      phonePlaceholder: "+9665XXXXXXXX",
      submit: "Send verification code",
      submitting: "Sending...",
    },
    verify: {
      title: "Enter verification code",
      subtitle: "We sent a 6-digit code to",
      codeLabel: "Verification code",
      submit: "Verify",
      submitting: "Verifying...",
      resend: "Resend code",
      resendIn: "You can resend in {seconds}s",
      changeNumber: "Change phone number",
      expiresIn: "Code expires in {seconds}s",
      expired: "Code expired",
    },
    completeProfile: {
      title: "Complete your profile",
      subtitle: "One last step before you start",
      fullNameLabel: "Full name",
      fullNamePlaceholder: "Your full name",
      emailLabel: "Email (optional)",
      emailPlaceholder: "you@example.com",
      submit: "Create account",
      submitting: "Creating...",
      ticketMissing: "Your verification session expired — please start again",
    },
  },
  dashboard: {
    title: "Dashboard",
    welcome: "Welcome, {name}",
    welcomeNoName: "Welcome",
    roleLabel: "Role",
    phoneLabel: "Phone number",
    profileIncomplete: "Your profile is incomplete",
  },
  profile: {
    title: "Profile",
    phoneLabel: "Phone number",
    emailLabel: "Email",
    fullNameLabel: "Full name",
    roleLabel: "Role",
    statusLabel: "Status",
    notProvided: "Not provided",
  },
  admin: {
    title: "Admin dashboard",
    subtitle: "This area is for administrators only",
  },
  merchant: {
    title: "Merchant dashboard",
    subtitle: "Manage your ad campaigns",
  },
  roles: {
    VISITOR: "Visitor",
    CUSTOMER: "Customer",
    MERCHANT: "Merchant",
    ADMIN: "Admin",
  },
  errors: {
    generic: "Something went wrong, please try again",
    invalidPhone: "Enter a valid phone number in international format, e.g. +9665XXXXXXXX",
    invalidCode: "The verification code must be 6 digits",
    networkError: "Could not reach the server",
  },
};

export default en;
