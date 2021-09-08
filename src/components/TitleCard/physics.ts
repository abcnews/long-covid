import { Body, Engine, Render, Runner, Bodies, Composite, Common, Vector, Vertices, Svg } from 'matter-js';
import decomp from 'poly-decomp';
import DATA from './title-card.json';

Common.setDecomp(decomp);

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const WIDTH = 1440;
const HEIGHT = 1440;
const WIDEST_CHARACTER_WIDTH = DATA.characters.shapes.reduce((memo, box: Box) => Math.max(memo, box.w), 0);
const RENDER_OPTIONS = {
  pixelRatio: window.devicePixelRatio || 1,
  wireframes: false,
  width: WIDTH,
  height: HEIGHT,
  background: '#fff'
};

const extendDataBoxWithVertexSet = (box: Box, sampleLength?: number) => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  path.setAttribute('d', box['d']);
  box['vertexSet'] = Svg.pathToVertices(path, sampleLength);
};

DATA.characters.shapes.forEach(shape => extendDataBoxWithVertexSet(shape, 5));
extendDataBoxWithVertexSet(DATA.ground);

const getCXCYWHArgs = (box: Box) => [box.x + box.w / 2, box.y + box.h / 2, box.w, box.h];
const getSprite = (box: Box) => ({
  texture: `${__webpack_public_path__}title-card/${box['c']}.svg`
});
const getStaticRectangleWithSprite = (box: Box) =>
  Bodies.rectangle(...getCXCYWHArgs(box), {
    isStatic: true,
    render: {
      sprite: getSprite(box)
    }
  });

const correctBodyPosition = (body: Body, intendedPositionX: number, intendedPositionY: number) => {
  const currentPosition = {
    x: (body.bounds.min.x + body.bounds.max.x) / 2,
    y: (body.bounds.min.y + body.bounds.max.y) / 2
  };
  const positionDiff = {
    x: currentPosition.x - intendedPositionX,
    y: currentPosition.y - intendedPositionY
  };

  Body.setPosition(body, Vector.create(intendedPositionX - positionDiff.x, intendedPositionY - positionDiff.y));
};

export const createSimuation = (el: HTMLElement) => {
  const engine = Engine.create({
    gravity: {
      scale: 0.001125
    }
  });
  const render = Render.create({
    element: el,
    engine: engine,
    options: RENDER_OPTIONS
  });
  const [groundCX, groundCY] = getCXCYWHArgs(DATA.ground);
  const ground = Bodies.fromVertices(
    groundCX,
    groundCY,
    DATA.ground['vertexSet'],
    {
      isStatic: true,
      render: {
        fillStyle: '#000',
        strokeStyle: '#000',
        lineWidth: 2
      }
    },
    true
  );

  correctBodyPosition(ground, groundCX, groundCY);

  const person = getStaticRectangleWithSprite(DATA.person);
  const words = getStaticRectangleWithSprite(DATA.words);
  const characters = DATA.characters.shapes.map(shape => {
    const x = DATA.characters.x + shape.x + shape.w / 2;
    const y = DATA.characters.y + shape.y + shape.h / 2;
    const character = Bodies.fromVertices(
      x,
      y,
      shape['vertexSet'],
      {
        frictionAir: (0.01 / WIDEST_CHARACTER_WIDTH) * shape.w,
        render: {
          fillStyle: '#000',
          lineWidth: 0
        }
      },
      true
    );

    correctBodyPosition(character, x, y);

    return character;
  });

  // add all of the bodies to the world
  // Composite.add(engine.world, [base, hill, summit, person, words, ...characters]);
  Composite.add(engine.world, [ground, person, words, ...characters]);

  // run the renderer
  // Render.setPixelRatio(render, 2);
  Render.run(render);

  // create runner
  const runner = Runner.create();

  // run the engine
  return () => {
    Runner.start(runner, engine);

    return () => Runner.stop(runner);
  };
};
