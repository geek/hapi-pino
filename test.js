'use strict'

const Code = require('code')
const Lab = require('lab')
const split = require('split2')
const writeStream = require('flush-write-stream')

const lab = exports.lab = Lab.script()
const experiment = lab.experiment
const test = lab.test
const expect = Code.expect

const Hapi = require('hapi')
const Pino = require('.')

function sink (func) {
  var result = split(JSON.parse)
  result.pipe(writeStream.obj(func))
  return result
}

function registerWithSink (server, level, func, registered) {
  const stream = sink(func)
  const plugin = {
    register: Pino.register,
    options: {
      stream: stream,
      level: level
    }
  }

  server.register(plugin, registered)
}

function onHelloWorld (data) {
  expect(data.msg).to.equal('hello world')
}

function ltest (func) {
  ;['trace', 'debug', 'info', 'warn', 'error'].forEach((level) => {
    test(`at ${level}`, (done) => {
      func(level, done)
    })
  })
}

experiment('logs through the server', () => {
  ltest((level, done) => {
    const server = new Hapi.Server()
    registerWithSink(server, level, onHelloWorld, (err) => {
      expect(err).to.be.undefined()
      server['log' + level]('hello world')
      done()
    })
  })
})

experiment('logs through the server.app.logger', () => {
  ltest((level, done) => {
    const server = new Hapi.Server()
    registerWithSink(server, level, onHelloWorld, (err) => {
      expect(err).to.be.undefined()
      server.app.logger[level]('hello world')
      done()
    })
  })
})

experiment('logs through the server.logger()', () => {
  ltest((level, done) => {
    const server = new Hapi.Server()
    registerWithSink(server, level, onHelloWorld, (err) => {
      expect(err).to.be.undefined()
      server.logger()[level]('hello world')
      done()
    })
  })
})