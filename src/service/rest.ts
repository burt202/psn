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

export default [getChannels]
