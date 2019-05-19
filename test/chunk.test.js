const assert = require('assert');
const {Chunker} = require('../index');

console.clear();

describe('Test chunker', function () {
  before(function() {
    console.log(` |--> Start: ${new Date()}`);
  });

  after(function() {
    console.log(` |--> End: ${new Date()}`);
  });


  it('test chunker initialization', () => {
    const chunker = new Chunker();
    assert.equal(chunker.items.length, 0);
  });

  it('test chunker\'s size override', () => {
    const chunker = new Chunker({size: 15});
    assert.equal(chunker.opts.size, 15);
  });

  it('test chunker flash', () => {
    const chunker = new Chunker();
    const text1 = 'hello 1';

    chunker.add(text1);
    assert.equal(chunker.flash().join(''), text1);
    assert.equal(chunker.items.length, 0);
  });

  it('test chunker add fn', () => {
    const chunker = new Chunker();
    const text1 = 'hello 133';
    const text2 = 'hello 2';

    chunker.add(text1);
    assert.equal(chunker.flash().join(''), text1);
    chunker.add(text1);
    chunker.add(text2);
    assert.equal(chunker.flash().join(''), [text1, text2].join(''));
  });

  it('test chunker addLine fn (default \\n)', () => {
    const chunker = new Chunker();
    const lineChar = '\n';
    const text1 = 'hello 133';
    const text2 = 'hello 2';

    chunker.addLine(text1);
    assert.equal(chunker.flash().join(''), `${text1}${lineChar}`);
    chunker.addLine(text1);
    chunker.addLine(text2);
    assert.equal(chunker.items.length, 2);
    assert.equal(chunker.flash().join(''), [`${text1}${lineChar}`, `${text2}${lineChar}`].join(''));
  });

  it('test chunker addLine fn (line char: \\t)', () => {
    const lineChar = '\t';
    const chunker = new Chunker({lineChar});
    const text1 = 'hello 133';
    const text2 = 'hello 2';

    chunker.addLine(text1);
    assert.equal(chunker.flash().join(''), `${text1}${lineChar}`);
    chunker.addLine(text1);
    chunker.addLine(text2);
    assert.equal(chunker.items.length, 2);
    assert.equal(chunker.flash().join(''), [`${text1}${lineChar}`, `${text2}${lineChar}`].join(''));
  });

  it('test chunker add with max-size 5', () => {
    const size = 5;
    const chunker = new Chunker({size});
    const text1 = `The 1ardo2s fr3m a 4resi5ent 6ho o7 the8`;
    chunker.add(text1);
    assert.equal(chunker.flash().join(''), text1);
  });

  it('test chunker add with max-size 10', () => {
    const size = 10;
    const chunker = new Chunker({size});
    const text1 = `The 1ardo2s fr3m a 4resi5ent 6ho o7 the8`;
    chunker.add(text1);
    assert.equal(chunker.flash().join(''), text1);
  });

  it('test chunker addLine with max-size 5 not-full', () => {
    const size = 5;
    const chunker = new Chunker({size});
    const text1 = `this1this2this3this4this5this6this7this`; // it should return 8 array
    chunker.addLine(text1);
    assert.equal(chunker.flash().join(''), `${text1}\n`);
  });

  it('test chunker.addLine with max-size 5 full', () => {
    const size = 5;
    const chunker = new Chunker({size});
    const text1 = `this1this2this3this4this5this6this7this8`; // because newline being added via Addline, it should return 9 array
    chunker.addLine(text1);
    assert.equal(chunker.flash().join(''), `${text1}\n`);
  });

  it('test chunker.addLine with max-size 5 not-full with special chars', () => {
    const size = 5;
    const chunker = new Chunker({size});
    const text1 = `the\t1the\n2the\b3this4this5this6this7this`; // it should return 8 array
    chunker.addLine(text1);
    assert.equal(chunker.flash().join(''), `${text1}\n`);
  });

  it('test chunker.addLine with max-size 5 full with special chars', () => {
    const size = 5;
    const chunker = new Chunker({size});
    const text1 = `the\t1the\n2the\b3this4this5this6this7this8`; // because newline being added via Addline, it should return 9 array
    chunker.addLine(text1);
    assert.equal(chunker.flash().join(''), `${text1}\n`);
  });

  it('test chunker addLine typical scenario', () => {
    const lineChar = '\n';
    const size = 100;
    const chunker = new Chunker({size});
    const text1 = `<b>Washington (CNN)</b> - Sen. Mitt Romney said Sunday that he disagrees with Rep. Justin Amash on the Michigan Republican's recent comments that President Donald Trump's conduct has met the "threshold for impeachment."`;
    const text2 = `"My own view is that Justin Amash has reached a different conclusion than I have. I respect him, I think it's a courageous statement," Romney told CNN's Jake Tapper on "State of the Union."`;
    const text3 = `"The American people just aren't there," he added. "The Senate is certainly not there, either."`;
    const text4 = `Romney, who represents Utah and served as the Republican presidential nominee in 2012, said he spent two full days reading special counsel Robert Mueller's report and concluded the investigation did not uncover enough evidence to make an obstruction of justice case against Trump.`;
    chunker.addLine(text1);
    chunker.addLine(text2);
    chunker.addLine(text3);
    chunker.addLine(text4);
    assert.equal(chunker.flash().join(''), `${text1}${lineChar}${text2}${lineChar}${text3}${lineChar}${text4}${lineChar}`);
    assert.equal(chunker.items.length, 0);
  });


});
