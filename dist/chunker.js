(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Chunker = factory());
}(this, function () { 'use strict';

  class Chunker{
    get properties() {
      return {
        opts: {size: 10, lineChar: '\n'},
      };
    }

    constructor(opts) {
      this.opts = Object.assign({}, this.properties.opts, opts);
      this.items = [];
    }

    addLine(text) {
      this.add(`${text}${this.opts.lineChar}`);
    }

    add(text) {
      this.items.push(text);
    }

    chunkText(str, size) {
      var arr = [];
      for (let i = 0; i < str.length; i += size) {
        arr.push(str.substr(i, size));
      }
      return arr;
    }

    flush() {
      const items = this.items.splice(0, this.items.length);
      return this.chunkText(items.join(''), this.opts.size);
    }

    print() {
      return this.items;
    }
  }

  return Chunker;

}));