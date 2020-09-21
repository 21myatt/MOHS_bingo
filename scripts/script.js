/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//
// For projects created with v87 onwards, JavaScript is always executed in strict mode.
//==============================================================================

// How to load in modules
const Scene = require('Scene');
const Patches = require('Patches');

// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');

const patternDict = {
  // horizontal
  h1: [0, 1, 2, 3, 4],
  h2: [5, 6, 7, 8, 9],
  h3: [10, 11, 12, 13],
  h4: [14, 15, 16, 17, 18],
  h5: [19, 20, 21, 22, 23],

  // vertical
  v1: [0, 5, 10, 14, 19],
  v2: [1, 6, 11, 15, 20],
  v3: [2, 7, 16, 21],
  v4: [3, 8, 12, 17, 22],
  v5: [4, 9, 13, 18, 23],

  // diagonal
  d1: [0, 6, 17, 23],
  d2: [4, 8, 15, 19],
};

let chosenCards = [];
let bingoCount = 0;

// Enables async/await in JS [part 1]
(async function () {
  const planes = await Promise.all(new Array(24).fill(0).map(async (e, i) => {
    const obj = await Scene.root.findFirst(`plane${i}`);
    return obj;
  }));

  const text = await Scene.root.findFirst('3dText0');
  text.hidden = true;

  planes.map((plane, i) => {
    plane.hidden.monitor().subscribe(({ newValue }) => {
      if (!newValue) {
        if (chosenCards.indexOf(i) === -1) {
          chosenCards.push(i);
        }

        let isPatternFound = false;
        let foundPatterns = [];
        Patches.inputs.setBoolean('bingoed', false);

        Object.entries(patternDict).map(([key, pattern], idx) => {
          let matchedItemCount = 0;

          for (let p of pattern) {
            if (chosenCards.indexOf(p) !== -1) {
              matchedItemCount += 1;
            }
          }

          if (matchedItemCount === pattern.length) {
            isPatternFound = true;
            foundPatterns.push(key);
          }
        });

        if (foundPatterns.length) {
          bingoCount += foundPatterns.length;
          Patches.inputs.setBoolean('bingoed', true);

          text.hidden = false;
          if (bingoCount === 1) {
            text.text = 'Bingo';
          } else {
            text.text = `${bingoCount}x Bingo`;
          }

          for (let j of foundPatterns) {
            delete patternDict[j];
          }
        }
      }
    });
  })

  // To use variables and functions across files, use export/import keyword
  // export const animationDuration = 10;

  // Use import keyword to import a symbol from another file
  // import { animationDuration } from './script.js'

  // To access scene objects
  // const [directionalLight] = await Promise.all([
  //   Scene.root.findFirst('directionalLight0')
  // ]);

  // To access class properties
  // const directionalLightIntensity = directionalLight.intensity;

  // To log messages to the console
  // Diagnostics.log('Console message logged from the script.');

  // Enables async/await in JS [part 2]
})();
