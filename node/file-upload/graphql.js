import { gql, GraphQLClient } from "graphql-request";

const ENDPOINT = "https://service.video.taxi/graphql";

const client = new GraphQLClient(ENDPOINT, {
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`,
  },
});

export function createVODDraft({ name, description }) {
  const query = gql`
    mutation CreateVODDraft($name: String!, $description: String!) {
      createVodDraft(name: $name, description: $description) {
        id
      }
    }
  `;
  const variables = { name, description };

  return client.request(query, variables);
}

export function getVodDraftUrl({ id, number }) {
  const query = gql`
    query VODDraft($id: String!, $number: Int!) {
      vodDraft(id: $id) {
        id
        partUrl(number: $number)
      }
    }
  `;
  const variables = { id, number };

  return client.request(query, variables);
}

export function processVodDraft({ id, parts }) {
  const query = gql`
    mutation ProcessVODDraft($id: String!, $parts: [String!]!) {
      processVodDraft(id: $id, parts: $parts) {
        id
      }
    }
  `;
  const variables = { id, parts };

  return client.request(query, variables);
}
