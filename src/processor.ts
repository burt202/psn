import * as uuid from "uuid"
import {Channel, Deps, Video} from "./types"

export type Processor = (
  channel: Channel,
  searchTerms: Array<string>,
) => Promise<{id: string | null; channelUrlName: string; videos: Array<Video>}>

export function createProcessor({youtubeClient, persistence}: Deps): Processor {
  return async (channel, searchTerms) => {
    const channelSearchResponse =
      await youtubeClient.searchForChannelsByUrlName(channel.name)

    const channelIds = channelSearchResponse.map((i) => {
      return i.id.channelId
    })

    console.log("channelIds.length", channelIds.length)

    const channelsByIdsResponse = await youtubeClient.getChannelsByIds(
      channelIds,
    )

    const match = channelsByIdsResponse.find((i) => {
      console.log("i.snippet.customUrl", i.snippet.customUrl)
      return i.snippet.customUrl?.toLowerCase() === channel.name.toLowerCase()
    })

    if (!match) {
      return {
        id: null,
        channelUrlName: channel.name,
        videos: [],
      }
    }

    const videoSearchResponse = await youtubeClient.getVideosForChannel(
      match.id,
    )

    console.log("videoSearchResponse", videoSearchResponse.length)

    const filtered = videoSearchResponse.filter((i) => {
      const title = i.snippet.title.toLowerCase()
      return searchTerms.some((s) => title.includes(s.toLowerCase()))
    })

    console.log("filtered", filtered.length)

    const mapped = filtered.map((f) => {
      return {
        id: uuid.v4(),
        title: f.snippet.title,
        date: f.snippet.publishedAt,
      }
    })

    await persistence.insertVideos(mapped)

    return {
      id: match.id,
      channelUrlName: channel.name,
      videos: mapped,
    }
  }
}
