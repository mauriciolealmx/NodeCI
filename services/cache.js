const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys')

const redisUrl = keys.redisUrl;
const client = redis.createClient(redisUrl);

// Return a promise from client.get instead of making use of the callback.
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  // Make cache() chainable.
  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify({ ...this.getQuery(), collection: this.mongooseCollection.name });

  // Try to get the value from Redis.
  const cacheValue = await client.hget(this.hashKey, key);
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc) ? doc.map(d => this.model(d)) : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);
  client.hset(this.hashKey, key, JSON.stringify(result));

  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
