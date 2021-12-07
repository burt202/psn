import {Request, Response} from "express"
import {Pool} from "pg"
import {Config} from "./config"
import {Persistence} from "./persistence"

export interface Logger {
  info(msg: string, context?: {[key: string]: string | number}): void
}

export interface Deps {
  pgClient: Pool
  config: Config
  log: Logger
  persistence: Persistence
}

export interface RestHandler {
  name: string
  path: string
  method: "get" | "post"
  requestSchema?: {
    body?: object
  }
  handler: (deps: Deps) => (req: Request, res: Response) => void
}

export interface DbChannel {
  id: string
  channel_name: string
}

export interface Channel {
  id: string
  name: string
}
