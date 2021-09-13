import 'pathseg';
const { proxy } = require('@abcnews/dev-proxy');
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
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

/*
Expected content:

  #forgottenwords
  “Heaps of people say, ‘Oh, I get that and I'm young’, but it just feels different… you'd be mid sentence and then completely forget what you were talking about”
*/
const initForgottenWords = () => {
  selectMounts('forgottenwords').forEach((el, index) => {
    el.setAttribute('data-forgottenwords', String(index));
    new ForgottenWords({
      target: el,
      props: {
        mountIndex: index
      }
    });
  });
};

/*
Expected content:

  #scatteredglyphs
  #blocklightdockedpiecemeal
  #video999999999
  "I'd have a fever for an hour...
  "...a sore throat for four hours ...
  "...then dizziness for two hours...
  "...then I was OK for an hour".
  #endblock

The (fake) #video tag forces Odyssey to create a dockable Block-media, which we'll take over
*/
const initScatteredGlyphs = () => {
  selectMounts('scatteredglyphs').forEach((el, index) => {
    const blockEl = el.nextElementSibling;

    if (blockEl && blockEl.className.indexOf('Block') > -1) {
      const blockMediaEl = blockEl.querySelector('.Block-media');

      if (!blockMediaEl) {
        throw new Error('Expected scatteredglyphs block to have media');
      }

      blockMediaEl.innerHTML = '';
      el.setAttribute('data-scatteredglyphs', String(index));
      new ScatteredGlyphs({
        target: blockMediaEl,
        props: {
          mountIndex: index
        }
      });
    }
  });
};

Promise.all([proxy('long-covid'), whenOdysseyLoaded]).then(() => {
  initTitleCard();
  initForgottenWords();
  initScatteredGlyphs();
});
