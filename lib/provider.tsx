"use client";

import React, { ReactNode } from "react";
import {
  createReactClient,
  LivepeerConfig,
  studioProvider,
} from "@livepeer/react";

const apiKey = "your-api-key"; // Sample API Key

const client = createReactClient({
  provider: studioProvider({ apiKey }),
});

const Provider = ({ children }: { children: ReactNode }) => {
  return <LivepeerConfig client={client}>{children}</LivepeerConfig>;
};

export default Provider;
