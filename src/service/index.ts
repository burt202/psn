/* eslint-disable @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises */

import di, {Container, Lifetime} from "di-hard"
import * as express from "express"
import {validate} from "jsonschema"
import {Pool} from "pg"
import * as R from "ramda"
import config from "./config"
import createMigrator, {Migrator} from "./migrator"
import {createPersistence} from "./persistence"
import handlers from "./rest"
import {Deps, Logger} from "./types"

const restHandlers = [...handlers]

const log: Logger = {
  info: (msg, context) => {
    const values = context !== undefined ? [msg, context] : [msg]
    console.log(...values)
  },
}

const pgPool = new Pool({
  user: config.database.username,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
})

const appContainer: Container = di.createContainer("service")
appContainer.registerFactory("persistence", (deps: Deps) => {
  return createPersistence(deps)
})
appContainer.registerFactory("dbMigrator", (deps: Deps) => {
  return createMigrator(deps)
})
appContainer.registerValue("pgClient", pgPool)
appContainer.registerValue("config", config)
appContainer.registerValue("log", log)

async function startServer() {
  const app = express()

  app.get("/", (_, res) => {
    res.send("Ok")
  })

  restHandlers.forEach((e) => {
    appContainer.registerFactory(
      e.name,
      (deps: Deps) => {
        return e.handler(deps)
      },
      {
        lifetime: Lifetime.Registration,
      },
    )

    app[e.method](e.path, (req, res) => {
      if (e.requestSchema) {
        const keysToValidate = Object.keys(e.requestSchema)
        const schema = {
          id: `/${e.name}`,
          type: "object",
          properties: e.requestSchema,
        }

        const result = validate(R.pick(keysToValidate, req), schema)

        if (result.errors.length > 0) {
          return res.status(400).send({
            error: true,
            type: "RequestInputNotValid",
            description: result.errors[0].message,
          })
        }
      }

      // eslint-disable-next-line
      appContainer.resolve(e.name)(req, res)
    })
  })

  const migrator = appContainer.resolve("dbMigrator") as Migrator
  await migrator.runMigrations()

  app.listen({port: 8081}, () =>
    console.log("Server ready at http://localhost:8081"),
  )
}

startServer()
