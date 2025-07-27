import { gql, request } from "graphql-request";

export const SUBGRAPH_CLIENT =
  "https://api.goldsky.com/api/public/project_cmdg6ewng9h9q01xx749o70db/subgraphs/event-factory/5.0.0/gn";

const eventCreateds = gql`
  {
    eventCreateds {
      id
      transactionHash_
      eventAddress
      eventId
    }
  }
`;

const getEvents = async () => {
  const response = await request(SUBGRAPH_CLIENT, eventCreateds);
  return response;
};

export default getEvents;
