#!/bin/python3
from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
from aioconsole import get_standard_streams
from dotenv import load_dotenv
import os
import asyncio
import websockets
import sys

# Load environment variables
load_dotenv()

API_KEY = os.getenv("API_KEY")
API_URL = "https://service.video.taxi/graphiql"

# Create a GraphQL client, important to add the Authorization header
transport = AIOHTTPTransport(
    url=API_URL, headers={"Authorization": f"Bearer {API_KEY}"}
)
client = Client(transport=transport, fetch_schema_from_transport=True)

# Create a new VIDEO.TAXI speech session, provide the languages you want to translate to
createQuery = gql(
    """
    mutation {
        createRealtimeSession(name: "Python Test", translationLanguages: ["EN-US", "SV"]) {
            id
        }
    }
"""
)
result = client.execute(createQuery)
speechId = result["createRealtimeSession"]["id"]

# Get the details of the speech session; define the language that is being spoken in the parameter of masterSocketUrl
detailsQuery = gql(
    """
    query {
        realtimeSession(id: "%s") {
            id
            masterSocketUrl(languageCode: "de")
            name
            translationLanguages
            viewerSocketUrl(enableVoiceover: true, languageCode: "EN-US")
            viewerWebUrl
        }
    }
"""
    % speechId
)

result = client.execute(detailsQuery)
# Use result.viewerWebUrl to get a public URL to whats being said. Open it in a browser to see the live transcript and translations
print(result)

# deliver muxed frames to the master socket
audioIngress = result["realtimeSession"]["masterSocketUrl"]
# receive transcripts and translations from the viewer socket
viewerSocket = result["realtimeSession"]["viewerSocketUrl"]


async def send_audio(url):
    """
    Send audio to the master socket of the VIDEO.TAXI speech session

    :param url: The master socket URL
    :return: None
    """
    stdin, _ = await get_standard_streams()

    async with websockets.connect(url) as websocket:
        while True:
            audio = await stdin.read(1024)
            if not audio:
                continue

            await websocket.send(audio)


async def get_transcript(url):
    """
    Get transcripts and translations from the viewer socket of the VIDEO.TAXI speech session

    :param url: The viewer socket URL
    :return: None
    """
    # delay transcript collection, to ensure audio is received and processed by VIDEO.TAXI
    # ideally, this would be synchronized with the audio ingress (masterSocket) to only connect after the first audio frame has been sent
    await asyncio.sleep(5)

    async with websockets.connect(url) as websocket:
        while True:
            message = await websocket.recv()
            # message contains an events array. Events:
            # - transcript: the spoken text
            # - translation: the translated text
            # - voiceover: the translated audio in the language the viewer socket is subscribed to
            print(message)


async def main():
    await asyncio.gather(send_audio(audioIngress), get_transcript(viewerSocket))


asyncio.run(main())
