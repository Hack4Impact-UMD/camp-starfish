import { useEffect, useState } from "react";
import moment from "moment";

interface BuildInfo {
  timestamp: string;
  version: string;
  formattedDate: string;
}

export function useBuildInfo() {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);

  useEffect(() => {
    const timestamp =
      process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || process.env.BUILD_TIMESTAMP;
    const version =
      process.env.NEXT_PUBLIC_APP_VERSION || process.env.APP_VERSION;

    if (timestamp) {
      setBuildInfo({
        timestamp,
        version: version || "unknown",
        formattedDate: moment(timestamp).format("MMM D, YYYY, h:mm A"),
      });
    }
  }, []);

  return buildInfo;
}

