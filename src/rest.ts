import * as Bluebird from "bluebird"
import * as uuid from "uuid"
import {RestHandler} from "./types"

const getChannels: RestHandler = {
  name: "get-channels",
  path: "/channels",
  method: "get",
  handler:
    ({persistence}) =>
    async (_, res) => {
      const allChannels = await persistence.getChannels()

      res.send({channels: allChannels})
    },
}

const getVideos: RestHandler = {
  name: "get-videos",
  path: "/videos",
  method: "get",
  handler:
    ({persistence}) =>
    async (_, res) => {
      const allVideos = await persistence.getVideos()

      res.send({videos: allVideos})
    },
}

const storeVideoMatches: RestHandler = {
  name: "store-video-matches",
  path: "/video-matches",
  method: "get",
  handler:
    ({persistence, youtubeClient}) =>
    async (_, res) => {
      await persistence.deleteAllVideos()

      const searchFilters = [
        "pro",
        "matt stephens",
        "5",
        "Mitchelton-Scott",
        "Dubai stage",
      ] // move to file

      const allChannels = await persistence.getChannels()
      console.log("allChannels", allChannels)

      const processed = await Bluebird.map(
        [{name: "GlobalCyclingNetwork"}],
        async (channel) => {
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
            return i.snippet.customUrl === channel.name.toLowerCase()
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
            return searchFilters.some((s) => i.snippet.title.includes(s))
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
        },
        {concurrency: 1},
      )

      res.send({processed})
    },
}

export default [getChannels, getVideos, storeVideoMatches]