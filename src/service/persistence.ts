import knex from "knex"
import {Deps, DbChannel, Channel, Video, DbVideo} from "./types"

export interface Persistence {
  getChannels(): Promise<Array<Channel>>
  getVideos(): Promise<Array<Video>>
  insertVideos(videos: Array<Video>): Promise<void>
  deleteAllVideos(): Promise<void>
}

export function createPersistence({pgClient}: Deps): Persistence {
  const knexPg = knex({client: "pg"})

  return {
    getChannels: async () => {
      const res = await pgClient.query("SELECT * FROM channels")

      return res.rows.map(channelFromDbRow)
    },

    getVideos: async () => {
      const res = await pgClient.query("SELECT * FROM videos")

      return res.rows.map(videoFromDbRow)
    },

    insertVideos: async (videos) => {
      const query = knexPg("videos").insert(videos).toSQL().toNative()
      await pgClient.query(query.sql, query.bindings as Array<string>)
    },

    deleteAllVideos: async () => {
      await pgClient.query("DELETE FROM videos")
    },
  }
}

function channelFromDbRow(row: DbChannel): Channel {
  return {
    id: row.id,
    name: row.channel_name,
  }
}

function videoFromDbRow(row: DbVideo): Video {
  // no mapping needed right now as both Video types are the same, but this is nice for consistency
  return row
}
