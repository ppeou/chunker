'use strict'

class Chunker {
  get properties() {
    return {
      opts: {size: 10, lineChar: '\n'},
    };
  }

  constructor(opts) {
    this.opts = Object.assign({}, this.properties.opts, opts);
    this.items = [];
    this.len = 0;
    if (opts && opts.rollover) {
      this.rollover(opts.rollover);
    }

  }

  addLine(text) {
    this.add(`${text}${this.opts.lineChar}`);
  }

  add(text) {
    const len = text.length;
    const newLen = this.len + len;
    if (this.hasRolloverBySize) {
      const {value, fn} = this.opts.rollover.size;
      if (newLen >= value) {
        this.items.push(text);
        fn(this.flush());
        return;
      }
    }
    this.len = newLen;
    this.items.push(text);
  }

  chunkText(str, size) {
    const arr = [];
    for (let i = 0; i < str.length; i += size) {
      arr.push(str.substr(i, size));
    }
    return arr;
  }

  flush() {
    const items = this.items.splice(0, this.items.length);
    this.len = 0;
    return this.chunkText(items.join(''), this.opts.size);
  }

  print() {
    return this.items;
  }

  rollover(options) {
    this.opts.rollover = {};
    (options || []).forEach(opt => {
      const {type, value, fn} = opt;
      if (type === 'size' && value && fn) {
        this.setupRolloverBySize({value, fn});
      } else if (type === 'time' && value && fn) {
        this.setupRolloverByDuration({value, fn});
      }
    });
  }

  setupRolloverBySize({value, fn}) {
    Object.assign(this.opts.rollover, {size: {fn, value}});
    this.hasRolloverBySize = true;
  }

  setupRolloverByDuration({value, fn}) {
    Object.assign(this.opts.rollover, {time: {fn, value, iid: 0}});
    let timeOpt = this.opts.rollover.time;
    this.hasRolloverByTimer = true;
    timeOpt.iid = setInterval(() => {
      fn(this.flush());
    }, timeOpt.value);
  }

  watch(condition, callback) {
    if (condition()) {
      callback(this.flush());
    }
  }

  destructor() {
    const rollover = this.opts.rollover;
    if (rollover) {
      let opt;
      Object.keys(rollover).forEach(k => {
        opt = rollover[k];
        if (opt && opt.iid) {
          clearInterval(opt.iid);
        }
      });
    }
  }
}

export default Chunker;
