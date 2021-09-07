import 'pathseg';
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { selectMounts } from '@abcnews/mount-utils';
import TitleCard from './components/TitleCard/TitleCard.svelte';
import './global.css';

whenOdysseyLoaded.then(() => {
  const [titleCardMount] = selectMounts('titlecard');

  if (titleCardMount) {
    new TitleCard({
      target: titleCardMount,
      props: {}
    });
  }
});
