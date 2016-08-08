'use strict';

const expect = require('chai').expect;

describe('shell commands', () => {
  const worker = require('../worker');

  describe('simple commands', () => {
    it('should return a single command as-is', done => {
      const config = {
        shell: 'bash',
        environment: 'echo foo'
      };

      worker.init(config, undefined, undefined, (error, result) => {
        if (error) return done(error);

        expect(result.environment.args).to.deep.equal([
          '-e',
          '-c',
          'echo foo'
        ]);
        done();
      });
    });

    it('should return an array of commands as an array of commands', done => {
      const config = {
        shell: 'bash',
        environment: ['echo foo', 'echo bar']
      };

      worker.init(config, undefined, undefined, (error, result) => {
        if (error) return done(error);

        expect(result.environment[0].args).to.deep.equal([
          '-e',
          '-c',
          'echo foo'
        ]);
        expect(result.environment[1].args).to.deep.equal([
          '-e',
          '-c',
          'echo bar'
        ]);
        done();
      });
    });

    it('should return a single command as an array, when passed as an array', done => {
      const config = {
        shell: 'bash',
        environment: ['echo foo']
      };

      worker.init(config, undefined, undefined, (error, result) => {
        if (error) return done(error);

        expect(result.environment[0].args).to.deep.equal([
          '-e',
          '-c',
          'echo foo'
        ]);
        done();
      });
    });
  });

  describe('complex commands', () => {
    it('should return a single command as-is', done => {
      const config = {
        shell: 'bash',
        environment: {
          command: 'echo foo'
        }
      };

      worker.init(config, undefined, undefined, (error, result) => {
        if (error) return done(error);

        expect(result.environment.args).to.deep.equal([
          '-e',
          '-c',
          'echo foo'
        ]);
        done();
      });
    });

    it('should return an array of commands as an array of commands', done => {
      const config = {
        shell: 'bash',
        environment: [
          {
            command: 'echo foo'
          }, {
            command: 'echo bar'
          }
        ]
      };

      worker.init(config, undefined, undefined, (error, result) => {
        if (error) return done(error);

        expect(result.environment[0].args).to.deep.equal([
          '-e',
          '-c',
          'echo foo'
        ]);
        expect(result.environment[1].args).to.deep.equal([
          '-e',
          '-c',
          'echo bar'
        ]);
        done();
      });
    });

    it('should return a single command as an array, when passed as an array', done => {
      const config = {
        shell: 'bash',
        environment: [
          {
            command: 'echo foo'
          }
        ]
      };

      worker.init(config, undefined, undefined, (error, result) => {
        if (error) return done(error);

        expect(result.environment[0].args).to.deep.equal([
          '-e',
          '-c',
          'echo foo'
        ]);
        done();
      });
    });
  });
});
