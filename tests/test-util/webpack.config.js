var path = require('path');

module.exports = {
  entry: './lib/index.spec.js',
  output: {
    path: path.join(__dirname, "build"),
    filename: 'bundle.test.js'
  }
}
