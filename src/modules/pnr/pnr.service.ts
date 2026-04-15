export type PnrData = {
  success: boolean;
  timestamp: number;
  data?: unknown;
  message?: string;
  statusCode?: number;
};

// Fetch PNR status from shadow API endpoint (mobile app mimic)
export const fetchPnrStatus = async (pnr: string): Promise<PnrData> => {
  try {
    const url = `https://api2.trainapp.in/api/pnr/${pnr}`;

    // Mobile app headers to mimic whereismytrain Android app
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
      "X-Requested-With": "com.whereismytrain.android",
      Accept: "application/json",
    };

    const response = await fetch(url, {
      method: "GET",
      headers,
      next: { revalidate: 300 }, // 5-minute cache
    });

    // Check for HTTP errors
    if (!response.ok) {
      return {
        success: false,
        message: `Upstream API returned ${response.status}: ${response.statusText}`,
        statusCode: 502,
        timestamp: Date.now(),
      };
    }

    // Parse JSON response directly
    const jsonData = await response.json();

    return {
      success: true,
      timestamp: Date.now(),
      data: jsonData,
    };
  } catch (error) {
    console.error("Fetch PNR status error:", error);

    return {
      success: false,
      message: "Failed to fetch PNR status from upstream",
      statusCode: 502,
      timestamp: Date.now(),
    };
  }
};
