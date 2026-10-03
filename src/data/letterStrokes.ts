export interface LetterStrokeGuide {
  letter: string;
  name: string;
  shapeDescription: string;
  steps: string[];
}

export const LETTER_STROKES: Record<string, LetterStrokeGuide> = {
  A: {
    letter: 'A',
    name: 'Slanted Ladder',
    shapeDescription: 'Two slanted legs standing tall with a belt across the middle.',
    steps: ['1. Slide down left (/)', '2. Slide down right (\\)', '3. Bridge across the middle (-)'],
  },
  B: {
    letter: 'B',
    name: 'Straight Back & Two Bumps',
    shapeDescription: 'A tall straight backbone with two round bellies on the right side.',
    steps: ['1. Straight line down ( | )', '2. Curve round top bump', '3. Curve round bottom bump'],
  },
  C: {
    letter: 'C',
    name: 'Open Moon Arc',
    shapeDescription: 'A big round curve like a crescent moon, open on the right.',
    steps: ['1. Start near the top right', '2. Curve up, around to the left, and down', '3. Leave the right side open'],
  },
  D: {
    letter: 'D',
    name: 'Straight Back & Big Belly',
    shapeDescription: 'A straight line down with one giant curve from top to bottom.',
    steps: ['1. Straight line down ( | )', '2. Big round curve from top to bottom ( ) )'],
  },
  E: {
    letter: 'E',
    name: 'Comb with Three Teeth',
    shapeDescription: 'A tall backbone with three horizontal shelves pointing right.',
    steps: ['1. Straight line down ( | )', '2. Top bar (-)', '3. Middle bar (-)', '4. Bottom bar (-)'],
  },
  F: {
    letter: 'F',
    name: 'Flagpole with Two Flags',
    shapeDescription: 'A tall line down with only two horizontal arms at the top and middle.',
    steps: ['1. Straight line down ( | )', '2. Top bar (-)', '3. Middle bar (-)'],
  },
  G: {
    letter: 'G',
    name: 'Curved Arc with a Step',
    shapeDescription: 'Like a letter C, but step inside with a little inward shelf.',
    steps: ['1. Big round curve like a C', '2. Step in with a little flat bar (-)'],
  },
  H: {
    letter: 'H',
    name: 'Twin Towers & Bridge',
    shapeDescription: 'Two tall parallel lines connected by a bridge in the middle.',
    steps: ['1. First line down ( | )', '2. Second line down ( | )', '3. Bridge across (- )'],
  },
  I: {
    letter: 'I',
    name: 'Standing Soldier',
    shapeDescription: 'One neat vertical line, sometimes with a hat and shoes.',
    steps: ['1. Straight line down ( | )', '2. Optional top and bottom caps'],
  },
  J: {
    letter: 'J',
    name: 'Umbrella Hook',
    shapeDescription: 'Go down straight and swing up in a hook at the bottom.',
    steps: ['1. Straight line down', '2. Hook up to the left ( ⤿ )'],
  },
  K: {
    letter: 'K',
    name: 'Backbone & Kicking Legs',
    shapeDescription: 'A straight back with two diagonal arms meeting at the middle.',
    steps: ['1. Straight line down ( | )', '2. Slant in to the middle ( \\ )', '3. Kick out to the bottom ( / )'],
  },
  L: {
    letter: 'L',
    name: 'Corner Angle',
    shapeDescription: 'Straight line down and a flat boot at the bottom.',
    steps: ['1. Straight line down ( | )', '2. Line across the bottom ( _ )'],
  },
  M: {
    letter: 'M',
    name: 'Twin Mountains',
    shapeDescription: 'Two tall peaks with a valley in between.',
    steps: ['1. Straight up, down to center, up to peak, straight down'],
  },
  N: {
    letter: 'N',
    name: 'Zigzag Pillar',
    shapeDescription: 'Two vertical pillars connected by a diagonal slide.',
    steps: ['1. Line up, slide diagonally down, line straight up'],
  },
  O: {
    letter: 'O',
    name: 'Full Ring',
    shapeDescription: 'A smooth continuous closed loop, round like a ball.',
    steps: ['1. Start at top, circle all the way around counter-clockwise and close'],
  },
  P: {
    letter: 'P',
    name: 'Balloon on a Stick',
    shapeDescription: 'A tall line down with one round loop at the top.',
    steps: ['1. Straight line down ( | )', '2. Round loop at top only'],
  },
  Q: {
    letter: 'Q',
    name: 'Circle with a Kickstand',
    shapeDescription: 'A big round O with a tiny diagonal foot at the bottom right.',
    steps: ['1. Round circle ( O )', '2. Little diagonal line at bottom right ( \\ )'],
  },
  R: {
    letter: 'R',
    name: 'Letter P with a Walking Leg',
    shapeDescription: 'A straight back, a top round loop, and a slanted walking leg.',
    steps: ['1. Straight down', '2. Loop at top like P', '3. Slant leg down to the right ( \\ )'],
  },
  S: {
    letter: 'S',
    name: 'Winding Snake',
    shapeDescription: 'Curve left at the top, then swing back to curve right at the bottom.',
    steps: ['1. Curve left like a C', '2. Curve back around right like a snake ( ∿ )'],
  },
  T: {
    letter: 'T',
    name: 'Tall Tree with a Flat Top',
    shapeDescription: 'A straight line down supporting a wide roof across the top.',
    steps: ['1. Wide line across the top ( — )', '2. Straight line down from the center ( | )'],
  },
  U: {
    letter: 'U',
    name: 'Deep Bowl',
    shapeDescription: 'Curve down, round the bottom, and climb back up.',
    steps: ['1. Down, scoop rounded bottom, and straight back up ( ∪ )'],
  },
  V: {
    letter: 'V',
    name: 'Sharp Valley',
    shapeDescription: 'Two slanted lines meeting in a sharp point at the bottom.',
    steps: ['1. Slant down right ( \\ )', '2. Slant up right ( / )'],
  },
  W: {
    letter: 'W',
    name: 'Double Valley',
    shapeDescription: 'Two Vs connected together: down, up, down, up.',
    steps: ['1. Slant down, up, down, up like two valleys'],
  },
  X: {
    letter: 'X',
    name: 'Criss-Cross',
    shapeDescription: 'Two diagonal lines crossing right in the middle.',
    steps: ['1. Slant line ( \\ )', '2. Cross over with opposite slant ( / )'],
  },
  Y: {
    letter: 'Y',
    name: 'V on a Stem',
    shapeDescription: 'A little V at the top resting on a straight stick at the bottom.',
    steps: ['1. Small V shape at top', '2. Straight stem down from bottom center ( | )'],
  },
  Z: {
    letter: 'Z',
    name: 'Zigzag Bolt',
    shapeDescription: 'Across the top, slide diagonally down left, across the bottom.',
    steps: ['1. Top horizontal (-)', '2. Slant diagonal down ( / )', '3. Bottom horizontal (-)'],
  },
};
