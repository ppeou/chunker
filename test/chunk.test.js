'use strict';

import assert from 'assert';
import Chunker from '../index.js';

describe('Test Chunker All', () => {
  describe('Test chunker', () => {
    it('test chunker initialization', () => {
      const chunker = new Chunker();
      assert.strictEqual(chunker.items.length, 0);
    });

    it('test chunker\'s size override', () => {
      const chunker = new Chunker({size: 15});
      assert.strictEqual(chunker.opts.size, 15);
    });

    it('test chunker flush', () => {
      const chunker = new Chunker();
      const text1 = 'hello 1';

      chunker.add(text1);
      assert.strictEqual(chunker.flush().join(''), text1);
      assert.strictEqual(chunker.items.length, 0);
    });

    it('test chunker add fn', () => {
      const chunker = new Chunker();
      const text1 = 'hello 133';
      const text2 = 'hello 2';

      chunker.add(text1);
      assert.strictEqual(chunker.flush().join(''), text1);
      chunker.add(text1);
      chunker.add(text2);
      assert.strictEqual(chunker.flush().join(''), [text1, text2].join(''));
    });

    it('test chunker addLine fn (default \\n)', () => {
      const chunker = new Chunker();
      const lineChar = '\n';
      const text1 = 'hello 133';
      const text2 = 'hello 2';

      chunker.addLine(text1);
      assert.strictEqual(chunker.flush().join(''), `${text1}${lineChar}`);
      chunker.addLine(text1);
      chunker.addLine(text2);
      assert.strictEqual(chunker.items.length, 2);
      assert.strictEqual(chunker.flush().join(''), [`${text1}${lineChar}`, `${text2}${lineChar}`].join(''));
    });

    it('test chunker addLine fn (line char: \\t)', () => {
      const lineChar = '\t';
      const chunker = new Chunker({lineChar});
      const text1 = 'hello 133';
      const text2 = 'hello 2';

      chunker.addLine(text1);
      assert.strictEqual(chunker.flush().join(''), `${text1}${lineChar}`);
      chunker.addLine(text1);
      chunker.addLine(text2);
      assert.strictEqual(chunker.items.length, 2);
      assert.strictEqual(chunker.flush().join(''), [`${text1}${lineChar}`, `${text2}${lineChar}`].join(''));
    });

    it('test chunker add with max-size 5', () => {
      const size = 5;
      const chunker = new Chunker({size});
      const text1 = `The 1ardo2s fr3m a 4resi5ent 6ho o7 the8`;
      chunker.add(text1);
      assert.strictEqual(chunker.flush().join(''), text1);
    });

    it('test chunker add with max-size 10', () => {
      const size = 10;
      const chunker = new Chunker({size});
      const text1 = `The 1ardo2s fr3m a 4resi5ent 6ho o7 the8`;
      chunker.add(text1);
      assert.strictEqual(chunker.flush().join(''), text1);
    });

    it('test chunker addLine with max-size 5 not-full', () => {
      const size = 5;
      const chunker = new Chunker({size});
      const text1 = `this1this2this3this4this5this6this7this`; // it should return 8 array
      chunker.addLine(text1);
      assert.strictEqual(chunker.flush().join(''), `${text1}\n`);
    });

    it('test chunker.addLine with max-size 5 full', () => {
      const size = 5;
      const chunker = new Chunker({size});
      const text1 = `this1this2this3this4this5this6this7this8`; // because newline being added via Addline, it should return 9 array
      chunker.addLine(text1);
      assert.strictEqual(chunker.flush().join(''), `${text1}\n`);
    });

    it('test chunker.addLine with max-size 5 not-full with special chars', () => {
      const size = 5;
      const chunker = new Chunker({size});
      const text1 = `the\t1the\n2the\b3this4this5this6this7this`; // it should return 8 array
      chunker.addLine(text1);
      assert.strictEqual(chunker.flush().join(''), `${text1}\n`);
    });

    it('test chunker.addLine with max-size 5 full with special chars', () => {
      const size = 5;
      const chunker = new Chunker({size});
      const text1 = `the\t1the\n2the\b3this4this5this6this7this8`; // because newline being added via Addline, it should return 9 array
      chunker.addLine(text1);
      assert.strictEqual(chunker.flush().join(''), `${text1}\n`);
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
      assert.strictEqual(chunker.flush().join(''), `${text1}${lineChar}${text2}${lineChar}${text3}${lineChar}${text4}${lineChar}`);
      assert.strictEqual(chunker.items.length, 0);
    });

    it('test chunker for README.md', () => {
      const chunker = new Chunker({size: 10, lineChar: '\n'});
      chunker.addLine('this is my first line');
      chunker.addLine('this is my second line');

      const chunkedArray = chunker.flush();
      assert.strictEqual(chunkedArray.join(''), 'this is my first line\nthis is my second line\n');
    });
  });

  describe('Test chunker watch by time', function () {
    this.executeInterval = 500;
    this.texts = (() => {const arr = [];let i = 0;while (i < 50) {arr.push(`line${i + 1}`);i++;}return arr;})();

    beforeEach(() => {
      this.iterationId1 = 0;
      this.iterationId2 = 0;
      this.intervalId1 = null;
      this.intervalId2 = null;
      this.numberOfInterval = 5;
      this.flushData = [];
      this.sentData = [];
    });

    afterEach(() => {
      if (this.intervalId1) clearInterval(this.intervalId1);
      if (this.intervalId2) clearInterval(this.intervalId2);
    });

    it('test by time 5s', (done) => {
      this.numberOfInterval = 10;
      const onChunkFlushCallback = (data) => {
        this.flushData.push(data);
      };
      const keepAddingText = () => {
        const txt = (this.texts[this.iterationId2]);
        this.sentData.push(txt);
        chunker.addLine(txt);
        this.iterationId2 += 1;
        if (this.iterationId2 === this.numberOfInterval - 1) {
          clearInterval(this.intervalId2);
        }
      };
      const chunker = new Chunker({
        size: 10,
        rollover: [
          {type: 'time', value: this.executeInterval, fn: onChunkFlushCallback}]
      });

      this.intervalId2 = setInterval(keepAddingText, this.executeInterval);

      setTimeout(() => {
        const src = this.sentData.join('\n') + '\n';
        const dest = this.flushData.join('');
        chunker.destructor();
        done(src === dest ? undefined : new Error());
      }, (this.numberOfInterval + 1) * this.executeInterval);

    }).timeout((this.numberOfInterval + 2) * this.executeInterval);

    it('test by time 10s', (done) => {
      this.texts = (() => {
        const arr = [];
        let i = 0;
        while (i < 20) {
          arr.push(`this is line ${i + 1}`);
          i++;
        }
        return arr;
      })();
      this.numberOfInterval = 20;
      const onChunkFlushCallback = (data) => {
        this.flushData.push(data);
      };
      const keepAddingText = () => {
        const txt = (this.texts[this.iterationId2]);
        this.sentData.push(txt);
        chunker.addLine(txt);
        this.iterationId2 += 1;
        if (this.iterationId2 === this.numberOfInterval - 1) {
          clearInterval(this.intervalId2);
        }
      };
      const chunker = new Chunker({
        size: 10,
        rollover: [
          {type: 'time', value: this.executeInterval, fn: onChunkFlushCallback}]
      });

      this.intervalId2 = setInterval(keepAddingText, this.executeInterval);

      setTimeout(() => {
        const src = this.sentData.join('\n') + '\n';
        const dest = this.flushData.map(c => c.join('')).join('');
        chunker.destructor();
        done(src === dest ? undefined : new Error());
      }, (this.numberOfInterval + 1) * this.executeInterval);

    }).timeout((this.numberOfInterval + 2) * this.executeInterval);
  });

  describe('Test chunker watch by size', function () {
    this.executeInterval = 500;
    this.texts = (() => {const arr = [];let i = 0;while (i < 50) {arr.push(`this is line ${i + 1}`);i++;}return arr;})();
    beforeEach(() => {
      this.iterationId1 = 0;
      this.iterationId2 = 0;
      this.intervalId1 = null;
      this.intervalId2 = null;
      this.numberOfInterval = 5;
      this.flushData = [];
      this.sentData = [];
    });

    afterEach(() => {
      if (this.intervalId1) clearInterval(this.intervalId1);
      if (this.intervalId2) clearInterval(this.intervalId2);
    });

    it('test by chunk 5 chars/chunk flush @ 10 chars - odd interval', (done) => {

      this.numberOfInterval = 9;

      const onChunkFlushCallback = (data) => {
        this.iterationId1 += 1;
        this.flushData.push(data);
      };


      const keepAddingText = () => {
        const txt = (this.texts[this.iterationId2]);
        this.sentData.push(txt);
        chunker.addLine(txt);
        this.iterationId2 += 1;
        //if number of interval is odd, more likely, flush will not have last element;
        if (this.numberOfInterval % 2 !== 0) {
          if (this.iterationId2 === this.numberOfInterval - 1) {
            clearInterval(this.intervalId2);
          }
        }
      };

      const chunker = new Chunker({
        size: 5,
        rollover: [{type: 'size', value: 10, fn: onChunkFlushCallback}],
      });

      this.intervalId2 = setInterval(keepAddingText, this.executeInterval);

      setTimeout(() => {
        const src = this.sentData.join('\n') + '\n';
        const dest = this.flushData.map(c => c.join('')).join('');
        chunker.destructor();
        done(src === dest ? undefined : new Error());
      }, (this.numberOfInterval + 1) * this.executeInterval);
    }).timeout((this.numberOfInterval + 2) * this.executeInterval);

    it('test by chunk 5 chars/chunk flush @ 10 chars - even interval', (done) => {
      this.numberOfInterval = 8;

      const onChunkFlushCallback = (data) => {
        this.flushData.push(data);
      };


      const keepAddingText = () => {
        const txt = (this.texts[this.iterationId2]);
        this.sentData.push(txt);
        chunker.addLine(txt);
        this.iterationId2 += 1;
        //if number of interval is odd, more likely, flush will not have last element;
        if (this.numberOfInterval % 2 !== 0) {
          if (this.iterationId2 === this.numberOfInterval - 1) {
            clearInterval(this.intervalId2);
          }
        }
      };

      const chunker = new Chunker({
        size: 5,
        rollover: [{type: 'size', value: 10, fn: onChunkFlushCallback}],
      });

      this.intervalId2 = setInterval(keepAddingText, this.executeInterval);

      setTimeout(() => {
        const src = this.sentData.join('\n') + '\n';
        const dest = this.flushData.map(c => c.join('')).join('');
        chunker.destructor();
        done(src === dest ? undefined : new Error());
      }, (this.numberOfInterval + 1) * this.executeInterval);
    }).timeout((this.numberOfInterval + 2) * this.executeInterval);
  });

  describe('Test chunker watch by size & timer', function () {
    this.executeInterval = 500;
    this.texts = (() => {const arr = [];let i = 0;while (i < 50) {arr.push(`lin${i + 1}`);i++;}return arr;})();
    beforeEach(() => {
      this.iterationId1 = 0;
      this.iterationId2 = 0;
      this.intervalId1 = null;
      this.intervalId2 = null;
      this.numberOfInterval = 5;
      this.flushData = [];
      this.sentData = [];
    });

    afterEach(() => {
      if (this.intervalId1) clearInterval(this.intervalId1);
      if (this.intervalId2) clearInterval(this.intervalId2);
    });

    it('test timer and sizer sample 1', (done) => {
      this.numberOfInterval = 5;
      let lastPos = 0;

      const onChunkFlushCallbackBySize = (data) => {
        this.iterationId1+=1;
        this.flushData.push(data);
        lastPos = this.iterationId2;
      };
      const onChunkFlushCallbackByTime = (data) => {
        this.iterationId1+=1;
        this.flushData.push(data);
        lastPos = this.iterationId2;
      };


      const keepAddingText = () => {
        const txt = (this.texts[this.iterationId2]);
        this.iterationId2 += 1;
        this.sentData.push(txt);
        chunker.addLine(txt);

      };

      const chunker = new Chunker({
        size: 5,
        rollover: [
          {type: 'time', value: this.executeInterval * 4, fn: onChunkFlushCallbackByTime},
          {type: 'size', value: 10, fn: onChunkFlushCallbackBySize},
          ],
      });

      this.intervalId2 = setInterval(keepAddingText, this.executeInterval);

      setTimeout(() => {
        const src = this.sentData.slice(0, lastPos).join('\n') + '\n';
        const dest = this.flushData.map(c => c.join('')).join('');
        chunker.destructor();
        done(src === dest ? undefined : new Error());
      }, (this.numberOfInterval + 1) * this.executeInterval);
    }).timeout((this.numberOfInterval + 2) * this.executeInterval);

    it('test timer and sizer sample 2', (done) => {
      this.texts = (() => {const arr = [];let i = 0;while (i < 50) {arr.push(`line ${i + 1}`);i++;}return arr;})();
      this.numberOfInterval = 20;
      let lastPos = 0;

      const onChunkFlushCallbackBySize = (data) => {
        this.iterationId1+=1;
        this.flushData.push(data);
        lastPos = this.iterationId2;
      };
      const onChunkFlushCallbackByTime = (data) => {
        this.iterationId1+=1;
        this.flushData.push(data);
        lastPos = this.iterationId2;
      };


      const keepAddingText = () => {
        const txt = (this.texts[this.iterationId2]);
        this.iterationId2 += 1;
        this.sentData.push(txt);
        chunker.addLine(txt);

      };

      const chunker = new Chunker({
        size: 5,
        rollover: [
          {type: 'time', value: this.executeInterval * 4, fn: onChunkFlushCallbackByTime},
          {type: 'size', value: 20, fn: onChunkFlushCallbackBySize},
        ],
      });

      this.intervalId2 = setInterval(keepAddingText, this.executeInterval);

      setTimeout(() => {
        const src = this.sentData.slice(0, lastPos).join('\n') + '\n';
        const dest = this.flushData.map(c => c.join('')).join('');
        chunker.destructor();
        done(src === dest ? undefined : new Error());
      }, (this.numberOfInterval + 1) * this.executeInterval);
    }).timeout((this.numberOfInterval + 2) * this.executeInterval);
  });
});
