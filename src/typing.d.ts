declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    Capacitor: {
      isNativePlatform: boolean;
      // You can add more properties here if needed
    };
  }
}

// Needed to make this file a module
export {};