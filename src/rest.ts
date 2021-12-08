import * as Bluebird from "bluebird"
import * as fs from "fs"
import * as path from "path"
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

const getVideoById: RestHandler = {
  name: "get-video-by-id",
  path: "/videos/:id",
  method: "get",
  handler:
    ({persistence}) =>
    async (req, res) => {
      const video = await persistence.getVideoById(req.params.id)

      if (!video) {
        return res.status(404).send()
      }

      res.send({video})
    },
}

const deleteVideoById: RestHandler = {
  name: "delete-video-by-id",
  path: "/videos/:id",
  method: "delete",
  handler:
    ({persistence}) =>
    async (req, res) => {
      await persistence.deleteVideoById(req.params.id)

      res.send()
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

const getVideosBySearchTerm: RestHandler = {
  name: "get-videos-by-search-term",
  path: "/videos-search",
  method: "get",
  requestSchema: {
    query: {
      type: "object",
      properties: {
        searchTerm: {type: "string"},
      },
      required: ["searchTerm"],
    },
  },
  handler:
    ({persistence}) =>
    async (req, res) => {
      const searchTerm = (req.query.searchTerm || "") as string

      if (searchTerm.length < 3) {
        return res.status(400).send({
          error: true,
          type: "SearchTermTooSmall",
        })
      }

      const allVideos = await persistence.getVideosBySearchTerm(searchTerm)

      res.send({
        videos: allVideos.map((v) => ({
          id: v.id,
          title: v.title,
        })),
      })
    },
}

const storeVideoMatches: RestHandler = {
  name: "store-video-matches",
  path: "/video-matches",
  method: "get", // could easily be a POST
  handler:
    ({persistence, processor}) =>
    async (_, res) => {
      await persistence.deleteAllVideos()

      const searchTerms = fs
        .readFileSync(path.join(__dirname, "../src/search_terms"), "utf8")
        .toString()
        .split("\n")

      const allChannels = await persistence.getChannels()

      const processed = await Bluebird.map(
        allChannels,
        async (channel) => {
          return processor(channel, searchTerms)
        },
        {concurrency: 1},
      )

      res.send({processed})
    },
}

export default [
  getChannels,
  getVideos,
  getVideoById,
  deleteVideoById,
  getVideosBySearchTerm,
  storeVideoMatches,
]
