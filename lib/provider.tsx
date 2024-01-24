"use client";

import React, { ReactNode } from "react";
import {
  createReactClient,
  LivepeerConfig,
  studioProvider,
} from "@livepeer/react";

const apiKey = "7f3d20c2-4add-4034-bd68-6fd5400da02e";

const client = createReactClient({
  provider: studioProvider({ apiKey }),
});

const Provider = ({ children }: { children: ReactNode }) => {
  return <LivepeerConfig client={client}>{children}</LivepeerConfig>;
};

export default Provider;
