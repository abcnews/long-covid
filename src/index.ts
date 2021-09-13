import 'pathseg';
const { proxy } = require('@abcnews/dev-proxy');
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { selectMounts } from '@abcnews/mount-utils';
import ForgottenWords from './components/ForgottenWords/ForgottenWords.svelte';
import ScatteredGlyphs from './components/ScatteredGlyphs/ScatteredGlyphs.svelte';
import TitleCard from './components/TitleCard/TitleCard.svelte';
import './global.css';

const initTitleCard = () => {
  const headerEl = document.querySelector('.Header');

  if (headerEl) {
    let headerMediaEl = headerEl.querySelector('.Header-media');

    if (headerMediaEl) {
      headerMediaEl.innerHTML = '';
    } else {
      headerMediaEl = document.createElement('div');
      headerMediaEl.classList.add('Header-media');
      headerEl.insertBefore(headerMediaEl, headerEl.firstChild);
    }

    new TitleCard({
      target: headerMediaEl,
      props: {}
    });
  }
};

const initForgottenWords = () => {
  selectMounts('forgottenwords').forEach((el, index) => {
    el.setAttribute('data-replaces-subsequent-content', '');
    el.setAttribute('data-forgottenwords', String(index));
    new ForgottenWords({
      target: el,
      props: {
        mountIndex: index
      }
    });
  });
};

const initScatteredGlyphs = () => {
  selectMounts('scatteredglyphs').forEach((el, index) => {
    el.setAttribute('data-replaces-subsequent-content', '');
    el.setAttribute('data-scatteredglyphs', String(index));
    new ScatteredGlyphs({
      target: el,
      props: {
        mountIndex: index
      }
    });
  });
};

Promise.all([proxy('long-covid'), whenOdysseyLoaded]).then(() => {
  initTitleCard();
  initForgottenWords();
  initScatteredGlyphs();
});
