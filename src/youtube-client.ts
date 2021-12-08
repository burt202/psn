import axios from "axios"
import * as querystring from "querystring"
import {Deps} from "./types"

export interface YoutubeClient {
  searchForChannelsByUrlName(
    urlName: string,
  ): Promise<Array<YT_ChannelSearchResult>>
  getChannelsByIds(ids: Array<string>): Promise<Array<YT_Channel>>
  getVideosForChannel(id: string): Promise<Array<YT_VideoSearchResult>>
}

// couldnt find any offical types so hand-rolled the minimum myself
export interface YT_Response<T> {
  items: Array<T>
}

export interface YT_ChannelSearchResult {
  id: {channelId: string}
}

export interface YT_Channel {
  id: string
  snippet: {customUrl?: string}
}

export interface YT_VideoSearchResult {
  snippet: {title: string; publishedAt: string}
}

const youtubeV3BaseUrl = "https://www.googleapis.com/youtube/v3/"

export function createYoutubeClient({config}: Deps): YoutubeClient {
  return {
    searchForChannelsByUrlName: async (urlName) => {
      const url = `${youtubeV3BaseUrl}search?${querystring.stringify({
        key: config.youtubeKey,
        q: urlName,
        type: "channel",
        part: "snippet",
        maxResults: 10,
      })}`

      const response = await axios.get<YT_Response<YT_ChannelSearchResult>>(url)

      return response.data.items
    },

    getChannelsByIds: async (ids) => {
      const url = `${youtubeV3BaseUrl}channels?${querystring.stringify({
        key: config.youtubeKey,
        id: ids.join(","),
        part: "snippet",
        maxResults: 10,
      })}`

      const response = await axios.get<YT_Response<YT_Channel>>(url)

      return response.data.items
    },

    getVideosForChannel: async (id) => {
      const url = `${youtubeV3BaseUrl}search?${querystring.stringify({
        key: config.youtubeKey,
        channelId: id,
        part: "snippet",
        maxResults: 10,
      })}`

      const response = await axios.get<YT_Response<YT_VideoSearchResult>>(url)

      return response.data.items
    },
  }
}
