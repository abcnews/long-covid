import 'pathseg';
const { proxy } = require('@abcnews/dev-proxy');
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import { getReadableStateStore } from '@abcnews/progress-utils';
import type { State } from '@abcnews/progress-utils';
import type { Readable } from 'svelte/store';
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

const initModeToggle = () => {
  const isInitiallyDarkMode = document.documentElement.className.indexOf('is-dark-mode') > -1;
  const initialRichtextEls = Array.from(document.querySelectorAll('.u-richtext'));
  const initialRichtextInvertEls = Array.from(document.querySelectorAll('.u-richtext-invert'));
  const initialLightHeaderEls = Array.from(document.querySelectorAll('.Header.is-light'));
  const initialDarkHeaderEls = Array.from(document.querySelectorAll('.Header.is-dark'));
  const initialLightBlockEls = Array.from(document.querySelectorAll('.Block.has-light'));
  const initialDarkBlockEls = Array.from(document.querySelectorAll('.Block.has-dark'));
  const stateStore: Readable<State> = getReadableStateStore('modetoggle', {
    indicatorSelector: '[data-mount][id^="modetoggle"]',
    shouldOptimiseIndicatorTracking: false
  });

  stateStore.subscribe(state => {
    const shouldBeAlternativeMode = (state === null ? -1 : state._index) % 2 === 0;
    const shouldBeDarkMode =
      (isInitiallyDarkMode && !shouldBeAlternativeMode) || (!isInitiallyDarkMode && shouldBeAlternativeMode);

    document.documentElement.classList[shouldBeDarkMode ? 'add' : 'remove']('is-dark-mode');
    initialRichtextEls.forEach(
      el =>
        (el.className = el.className.replace(/u-richtext(-invert)?/, `u-richtext${shouldBeDarkMode ? '' : '-invert'}`))
    );
    initialRichtextInvertEls.forEach(
      el =>
        (el.className = el.className.replace(/u-richtext(-invert)?/, `u-richtext${shouldBeDarkMode ? '-invert' : ''}`))
    );
    initialLightHeaderEls.forEach(
      el => (el.className = el.className.replace(/is-(light|dark)/, `is-${shouldBeDarkMode ? 'light' : 'dark'}`))
    );
    initialDarkHeaderEls.forEach(
      el => (el.className = el.className.replace(/is-(light|dark)/, `is-${shouldBeDarkMode ? 'dark' : 'light'}`))
    );
    initialLightBlockEls.forEach(
      el => (el.className = el.className.replace(/has-(light|dark)/, `has-${shouldBeDarkMode ? 'light' : 'dark'}`))
    );
    initialDarkBlockEls.forEach(
      el => (el.className = el.className.replace(/has-(light|dark)/, `has-${shouldBeDarkMode ? 'dark' : 'light'}`))
    );
  });

  requestAnimationFrame(() => document.documentElement.classList.add('can-toggle-mode'));
};

/*
#forgottenwords
“Heaps of people say, ‘Oh, I get that and I'm young’, but it just feels different… you'd be mid sentence and then completely forget what you were talking about”
*/
const initForgottenWords = () => {
  selectMounts('forgottenwords').forEach((el, index) => {
    const followingParagraphEl = el.nextElementSibling;

    if (!followingParagraphEl || followingParagraphEl.tagName !== 'P') {
      return;
    }

    el.setAttribute('data-paragraph-replacement', '');
    el.setAttribute('data-forgottenwords', String(index));
    new ForgottenWords({
      target: el,
      props: {
        mountIndex: index,
        text: followingParagraphEl.textContent || ''
      }
    });
  });
};

/*
#scatteredglyphsNAMEfever
"I'd have a fever for an hour...
#scatteredglyphsNAMEthroat
"...a sore throat for four hours ...
#scatteredglyphsNAMEdizziness
"...then dizziness for two hours...
#scatteredglyphsNAMEok
"...then I was OK for an hour".
*/
const initScatteredGlyphs = () => {
  selectMounts('scatteredglyphs').forEach(el => {
    const name = getMountValue(el).split('NAME')[1];
    const followingParagraphEl = el.nextElementSibling;

    if (!followingParagraphEl || followingParagraphEl.tagName !== 'P') {
      return;
    }

    el.setAttribute('data-paragraph-replacement', '');
    el.setAttribute('data-scatteredglyphs', name);
    new ScatteredGlyphs({
      target: el,
      props: {
        name,
        text: followingParagraphEl.textContent || ''
      }
    });
  });
};

Promise.all([proxy('long-covid'), whenOdysseyLoaded]).then(() => {
  initTitleCard();
  initModeToggle();
  initForgottenWords();
  initScatteredGlyphs();
});
