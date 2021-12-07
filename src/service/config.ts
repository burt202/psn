export interface Config {
  database: {
    username: string
    password: string
    host: string
    port: number
    name: string
  }
}

const config: Config = {
  database: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT as string, 10) || 5432,
    name: process.env.DB_SCHEMA || "postgres",
  },
}

export default config
