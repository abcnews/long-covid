declare global {
  interface Window {
    KeyshapeJS: {
      timelines: () => [
        {
          duration: () => number;
          time: (ms: number) => void;
        }
      ];
      globalPause: () => void;
      globalPlay: () => void;
    };
  }
}

type MessageData = {
  type: string;
  payload: unknown;
};

let duration: number = 0;

const onProgress = (progress: number) => {
  window.KeyshapeJS.timelines()[0].time(duration * progress);
};

window.addEventListener('message', (message: { data: MessageData }) => {
  if (message.data.type === 'progress') {
    onProgress(message.data.payload as number);
  }
});

duration = window.KeyshapeJS.timelines()[0].duration();

export {};
