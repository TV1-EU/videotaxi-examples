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

# Create a new category
createCategoryQuery = gql(
    """
    mutation {
        createCategory(name: "Panda 4") {
            id
        }
    }
"""
)

result = client.execute(createCategoryQuery)
categoryId = result["createCategory"]["id"]
vodId = sys.argv[1]
# move a video to that category
moveVoDQuery = gql(
    """
    mutation {
        addVodToCategory(categoryId: %i, vodId: "%s") {
            id
        }
    }
"""
% (categoryId, vodId)
)

result = client.execute(moveVoDQuery)