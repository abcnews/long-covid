let HAS_OPTED_OUT: boolean | null = null;

try {
  HAS_OPTED_OUT = localStorage.getItem('motion-opt-out') === 'yes';
} catch (err) {
  console.error(err);
}

const optOut = () => {
  localStorage.setItem('motion-opt-out', 'yes');
  window.location.reload();
};

const optIn = () => {
  localStorage.removeItem('motion-opt-out');
  window.location.reload();
};

export { HAS_OPTED_OUT, optOut, optIn };
