Text Chunker
=========

A small library that allow user to add text and chuck them into smaller chunk.

## Installation
`npm install @ppeou/chunker`

## Usage

const {Chunker} = require('../index');

const chunker = new Chunker({size: 10, lineChar: '\n'});

chunker.addLine('this is my first line');
chunker.addLine('this is my second line');

const chunkedArray = chunker.flush();

console.log(chunkedArray);

output should be: 
['this is my', ' first lin', 'e\nthis is ', 'my second ', 'line\n' ]


## Tests
`npm test`

## Development
`npm run test:watch`

Unit tests: `./test/chunk.test.js`
Chunker Class: `./index.js`

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
