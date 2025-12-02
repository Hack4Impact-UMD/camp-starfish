"use client";

import { SessionID } from "@/types/sessionTypes";

import React, { createContext, useContext } from "react";

export const SessionContext = createContext<SessionID>(null!);

export const useSessionContext = () => useContext(SessionContext);

