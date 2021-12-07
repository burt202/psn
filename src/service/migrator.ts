import {migrate} from "postgres-migrations"
import {Deps} from "./types"

export interface Migrator {
  isComplete(): boolean
  runMigrations(): Promise<void>
}

export default function createMigrator({config, log}: Deps): Migrator {
  let complete = false

  const dbconfig = config.database
  return {
    isComplete() {
      return complete
    },
    async runMigrations(): Promise<void> {
      log.info("Attempting database migrations")

      const name = dbconfig.name
      const user = dbconfig.username
      const password = dbconfig.password
      const host = dbconfig.host
      const port = dbconfig.port

      return migrate(
        {
          database: name,
          user,
          password,
          host,
          port,
          ensureDatabaseExists: true,
        },
        "db/migrations",
      )
        .then((migrations) => {
          log.info("Successfully migrated database", {
            numberOfMigrations: migrations.length,
          })
          complete = true
        })
        .catch((e) => {
          console.log("e", e)
          log.info("Could not run database migrations")
          process.exit(1)
        })
    },
  }
}
