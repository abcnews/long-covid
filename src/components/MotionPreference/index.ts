import { Client } from '@abcnews/poll-counters-client';

const client = new Client('long-covid');

const incrementCounter = (counter: string) => client.increment({ question: 'reduced-motion', answer: counter });

let HAS_OPTED_OUT: boolean | null = null;

try {
  HAS_OPTED_OUT = localStorage.getItem('motion-opt-out') === 'yes';
} catch (err) {
  console.error(err);
}

const optOut = () => {
  incrementCounter('manual-enable');
  localStorage.setItem('motion-opt-out', 'yes');
  window.location.reload();
};

const optIn = () => {
  incrementCounter('manual-disable');
  localStorage.removeItem('motion-opt-out');
  window.location.reload();
};

export { HAS_OPTED_OUT, incrementCounter, optOut, optIn };
