#!/usr/bin/env node
const jestRetry = require('../src/run-tests')
const runConfig = require('./run-config');

jestRetry(runConfig);