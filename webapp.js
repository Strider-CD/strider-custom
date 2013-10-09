
module.exports = {
  config: {
    custom: {
      environment: {type: String, default: '# type shell commands here'},
      prepare: {type: String, default: '# type shell commands here'},
      test: {type: String, default: '# type shell commands here'},
      deploy: {type: String, default: '# type shell commands here'},
      cleanup: {type: String, default: '# type shell commands here'}
    }
  }
}
