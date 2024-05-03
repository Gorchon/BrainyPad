import React from "react";
import { ClerkProvider } from "@clerk/clerk-react";

interface ClerkContextProps {
  children?: React.ReactNode;
}

const key: string | undefined = import.meta.env
  .PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY;

if (!key) {
  throw new Error("No Clerk publishable key found.");
}

const ClerkContext: React.FC<ClerkContextProps> = ({ children }) => {
  return <ClerkProvider publishableKey={key}>{children}</ClerkProvider>;
};

export default ClerkContext;
