declare global {
  interface Window {
    IMP: unknown;
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Link: {
        sendDefault: (settings: any) => void;
      };
    };
    ShopifyBuy: unknown;
    YT: unknown;
  }
}

export {};
