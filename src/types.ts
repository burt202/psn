import {Request, Response} from "express"
import {Pool} from "pg"
import {Config} from "./config"
import {Persistence} from "./persistence"
import {YoutubeClient} from "./youtube-client"

export interface Logger {
  info(msg: string, context?: {[key: string]: string | number}): void
}

export interface Deps {
  pgClient: Pool
  config: Config
  log: Logger
  persistence: Persistence
  youtubeClient: YoutubeClient
}

export interface RestHandler {
  name: string
  path: string
  method: "get" | "delete"
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

export type DbVideo = Video

export interface Video {
  id: string
  title: string
  date: string // might be better named at published_at to reflect truth?
}
