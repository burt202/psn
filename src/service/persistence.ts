import {Deps, DbChannel, Channel} from "./types"

export interface Persistence {
  getChannels(): Promise<Array<Channel>>
}

export function createPersistence({pgClient}: Deps): Persistence {
  return {
    getChannels: async () => {
      const res = await pgClient.query("SELECT * FROM channels")

      return res.rows.map(channelFromDbRow)
    },
  }
}

function channelFromDbRow(row: DbChannel): Channel {
  return {
    id: row.id,
    name: row.channel_name,
  }
}
