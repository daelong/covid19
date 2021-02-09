module.exports = {
    runtimeCompiler: true,
    devServer: {
      proxy: 'http://openapi.data.go.kr/',
    },
  };