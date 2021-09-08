#!/usr/bin/env node

const {
  promises: { readFile }
} = require('fs');
const { writeFile } = require('jsonfile');
const sketch2json = require('sketch2json');

const IN_FILENAME = 'title-card.sketch';
const OUT_FILENAME = 'title-card.json';

const getProps = layer => ({
  c: layer.name,
  x: layer.frame.x,
  y: layer.frame.y,
  w: layer.frame.width,
  h: layer.frame.height
});

const getLayerD = async layer => {
  const data = await readFile(__dirname + `/../public/title-card/${layer.name}.svg`, 'utf-8');

  const [, d] = data.match(/ d="(.*?)"/) || [];

  if (d) {
    return d;
  }

  const [, points] = data.match(/ points="(.*?)"/) || [];

  if (points) {
    const components = points.split(/\s+|,/);

    return `M${components.shift()},${components.shift()} L${components.join(' ')} z`;
  }

  return '';
};

const getLayersDs = layers => Promise.all(layers.map(layer => getLayerD(layer)));

const run = async () => {
  const buffer = await readFile(__dirname + `/../design/${IN_FILENAME}`);
  const root = await sketch2json(buffer);
  const page = Object.values(root.pages)[0];
  const scene = page.layers[0];

  const [ground, person, wordsSS, wordsS, charactersSS, charactersS] = scene.layers;
  const [q2SS, q1SS, eSS, fSS, iSS, lSS] = charactersSS.layers;
  const [q2S, q1S, eS, fS, iS, lS] = charactersS.layers;

  const groundD = await getLayerD(ground);
  const [q2SSD, q1SSD, eSSD, fSSD, iSSD, lSSD] = await getLayersDs(charactersSS.layers);
  const [q2SD, q1SD, eSD, fSD, iSD, lSD] = await getLayersDs(charactersS.layers);

  const shapes = {
    scene: getProps(scene),
    ground: {
      ...getProps(ground),
      d: groundD
    },
    person: getProps(person),
    wordsSS: getProps(wordsSS),
    wordsS: getProps(wordsS),
    charactersSS: {
      ...getProps(charactersSS),
      shapes: [
        { ...getProps(lSS), d: lSSD },
        { ...getProps(iSS), d: iSSD },
        { ...getProps(fSS), d: fSSD },
        { ...getProps(eSS), d: eSSD },
        { ...getProps(q1SS), d: q1SSD },
        { ...getProps(q2SS), d: q2SSD }
      ]
    },
    charactersS: {
      ...getProps(charactersS),
      shapes: [
        { ...getProps(lS), d: lSD },
        { ...getProps(iS), d: iSD },
        { ...getProps(fS), d: fSD },
        { ...getProps(eS), d: eSD },
        { ...getProps(q1S), d: q1SD },
        { ...getProps(q2S), d: q2SD }
      ]
    }
  };

  writeFile(__dirname + `/../src/components/TitleCard/${OUT_FILENAME}`, shapes, { spaces: 2 });
};

run();
