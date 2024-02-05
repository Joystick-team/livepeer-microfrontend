"use client";

import React, { ReactNode } from "react";
import {
  createReactClient,
  LivepeerConfig,
  studioProvider,
} from "@livepeer/react";

const apiKey = "cf706d6f-b961-4b3b-af32-827691ce496c";

const client = createReactClient({
  provider: studioProvider({ apiKey }),
});

const Provider = ({ children }: { children: ReactNode }) => {
  return <LivepeerConfig client={client}>{children}</LivepeerConfig>;
};

export default Provider;
