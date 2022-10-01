/**
 * Knex configuration file.
 *
 * You will not need to make changes to this file.
 */

require('dotenv').config();
const path = require("path");

const {
  DATABASE_URL = "postgres://mllxogsu:kT9W3SEA0pA1bj6ayXmvd_VvKvnWrQEi@jelani.db.elephantsql.com/mllxogsu",
  DATABASE_URL_DEVELOPMENT = "postgres://ictgoyye:gZ4ABKc5iHemWx1O6RI5gIJBVqXd8UY_@jelani.db.elephantsql.com/ictgoyye",
  DATABASE_URL_TEST = "postgres://iawouywx:EzXnhFPe469eIeSFUw57G424MROvLc5B@jelani.db.elephantsql.com/iawouywx",
  DATABASE_URL_PREVIEW = "postgres://huhgkiah:FsXyGK_WAoiQGsDTawCOJZknyipMxZJl@jelani.db.elephantsql.com/huhgkiah",
  DEBUG,
} = process.env;

module.exports = {
  development: {
    client: "postgresql",
    pool: { min: 1, max: 5 },
    connection: DATABASE_URL_DEVELOPMENT,
    migrations: {
      directory: path.join(__dirname, "src", "db", "migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "src", "db", "seeds"),
    },
    debug: !!DEBUG,
  },
  test: {
    client: "postgresql",
    pool: { min: 1, max: 5 },
    connection: DATABASE_URL_TEST,
    migrations: {
      directory: path.join(__dirname, "src", "db", "migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "src", "db", "seeds"),
    },
    debug: !!DEBUG,
  },
  preview: {
    client: "postgresql",
    pool: { min: 1, max: 5 },
    connection: DATABASE_URL_PREVIEW,
    migrations: {
      directory: path.join(__dirname, "src", "db", "migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "src", "db", "seeds"),
    },
    debug: !!DEBUG,
  },
  production: {
    client: "postgresql",
    pool: { min: 1, max: 5 },
    connection: DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, "src", "db", "migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "src", "db", "seeds"),
    },
    debug: !!DEBUG,
  },
};
