import { Body, Engine, Render, Runner, Bodies, Composite, Vector, Vertices, Svg } from 'matter-js';
import { TYPOGRAPHY_CHARACTERS, TYPOGRAPHY_HEIGHT, TYPOGRAPHY_WIDTH } from './typography';

const WIDTH = 1440;
const HEIGHT = 1440;
const TYPOGRAPHY_OFFSET_X = (WIDTH - TYPOGRAPHY_WIDTH) / 2;
const TYPOGRAPHY_OFFSET_Y = (HEIGHT - TYPOGRAPHY_HEIGHT) / 6;
const CHARACTER_MEASUREMENT_PATH = document.createElementNS('http://www.w3.org/2000/svg', 'path');
const CHARACTERS_CONFIGS = TYPOGRAPHY_CHARACTERS.map((datum, index) => {
  if (index < 11) {
    return {
      ...datum
    };
  }

  CHARACTER_MEASUREMENT_PATH.setAttribute('d', datum.d);

  return {
    ...datum,
    vertexSet: Svg.pathToVertices(CHARACTER_MEASUREMENT_PATH, 30)
  };
});
const WIDEST_CHARACTER_WIDTH = CHARACTERS_CONFIGS.reduce(
  (memo, characterConfig) => Math.max(memo, characterConfig.w),
  0
);
const STATIC_BODY_SHARED_CONFIG = {
  isStatic: true,
  render: {
    fillStyle: '#000',
    lineWidth: 0
  }
};

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

const createTriangle = (
  getPath: (width: number, height: number) => string,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: {}
): Body => {
  const body = Body.create({
    label: 'Triangle Body',
    position: { x, y },
    ...(options || {})
  });
  const vertices = Vertices.fromPath(getPath(width, height), body);

  Body.setVertices(body, vertices);
  correctBodyPosition(body, x, y);

  return body;
};

const createUphillTriangle = (x: number, y: number, width: number, height: number, options?: {}): Body =>
  createTriangle((width, height) => `L 0 ${height} L ${width} 0 L ${width} ${height}`, x, y, width, height, options);

export const createSimuation = (el: HTMLElement) => {
  const engine = Engine.create({
    gravity: {
      scale: 0.001125
    }
  });
  const render = Render.create({
    element: el,
    engine: engine,
    options: {
      pixelRatio: window.devicePixelRatio || 1,
      wireframes: false,
      width: WIDTH,
      height: HEIGHT,
      background: '#fff'
    }
  });

  const base = Bodies.rectangle(WIDTH / 2, HEIGHT + 1, WIDTH, 2, STATIC_BODY_SHARED_CONFIG);
  const hill = createUphillTriangle(
    WIDTH / 2,
    (HEIGHT / 16) * 13,
    WIDTH / 3,
    (HEIGHT / 8) * 3,
    STATIC_BODY_SHARED_CONFIG
  );
  const summit = Bodies.rectangle(
    (WIDTH / 6) * 5,
    (HEIGHT / 16) * 13,
    WIDTH / 3,
    (HEIGHT / 8) * 3,
    STATIC_BODY_SHARED_CONFIG
  );
  const person = Bodies.rectangle((WIDTH / 3) * 2 + 30, (HEIGHT / 8) * 5 - 210, 144, 450, {
    isStatic: true,
    render: {
      sprite: {
        xScale: 2,
        yScale: 2,
        texture: `${__webpack_public_path__}title-card/Person.svg`
      }
    }
  });
  const characters = CHARACTERS_CONFIGS.map(config => {
    const x = TYPOGRAPHY_OFFSET_X + config.x + config.w / 2;
    const y = TYPOGRAPHY_OFFSET_Y + config.y + config.h / 2;
    const render = {
      sprite: {
        texture: `${__webpack_public_path__}title-card/${config.c}.svg`
      }
    };

    if (!('vertexSet' in config)) {
      return Bodies.rectangle(x, y, config.w, config.h, {
        isStatic: true,
        render
      });
    }

    const body = Bodies.fromVertices(
      x,
      y,
      [config.vertexSet],
      {
        frictionAir: (0.01 / WIDEST_CHARACTER_WIDTH) * config.w,
        render
      },
      true
    );

    correctBodyPosition(body, x, y);

    return body;
  });

  // add all of the bodies to the world
  Composite.add(engine.world, [base, hill, summit, person, ...characters]);

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
