import { request, gql } from "graphql-request";
import WebSocket from "ws";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_KEY = process.env.API_KEY;
const API_URL = "https://service.video.taxi/graphiql";

// Create a new VIDEO.TAXI speech session, provide the languages you want to translate to
const createQuery = gql`
  mutation {
    createRealtimeSession(
      name: "Node.js Test"
      translationLanguages: ["EN-US", "SV"]
    ) {
      id
    }
  }
`;

async function main() {
  // Create a new session
  const createResult = await request(
    API_URL,
    createQuery,
    {},
    {
      Authorization: `Bearer ${API_KEY}`,
    },
  );
  const speechId = createResult.createRealtimeSession.id;

  // Get the details of the speech session
  const detailsQuery = gql`
        query {
            realtimeSession(id: "${speechId}") {
                id
                masterSocketUrl(languageCode: "de")
                name
                translationLanguages
                viewerSocketUrl(enableVoiceover: true, languageCode: "EN-US")
                viewerWebUrl
            }
        }
    `;

  const detailsResult = await request(
    API_URL,
    detailsQuery,
    {},
    {
      Authorization: `Bearer ${API_KEY}`,
    },
  );

  console.log(detailsResult);

  // deliver muxed frames to the master socket
  const audioIngress = detailsResult.realtimeSession.masterSocketUrl;
  // receive transcripts and translations from the viewer socket
  const viewerSocket = detailsResult.realtimeSession.viewerSocketUrl;

  // Send audio to the master socket
  const sendAudio = async (url) => {
    const ws = new WebSocket(url);

    ws.on("open", async () => {
      console.log("Connected to master socket");

      // Read audio from stdin and send it to the master socket, make sure to read it in binary format. For example, readline will not work!
      process.stdin.on("data", (chunk) => {
        ws.send(chunk);
      });

      // wait 2 seconds to account for network latency. If you open the viewer socket before a frame was received, it will close with 422.
      setTimeout(async () => {
        await getTranscript(viewerSocket);
      }, 2000);
    });
    ws.on("close", () => {
      console.log("Connection closed");
    });
  };

  // Get transcripts and translations from the viewer socket
  const getTranscript = async (url) => {
    const ws = new WebSocket(url);
    ws.on("open", () => {
      console.log("Connected to viewer socket");
    });
    ws.on("close", () => {
      console.log("Connection closed");
    });
    ws.on("message", (message) => {
      const speechMessage = JSON.parse(message); // as WebSocketMessage; // in case you use TypeScript, you can use this type from @tv1-eu/videotaxi-api-typings
      speechMessage.events.forEach((event) => {
        console.log(event);
      });
    });
  };

  await sendAudio(audioIngress);
}

main().catch(console.error);
