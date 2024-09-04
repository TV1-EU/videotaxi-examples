import fs from "fs";
import { createVODDraft, getVodDraftUrl, processVodDraft } from "./graphql.js";

const SAMPLE_FILE = `../../assets/SampleVideo_1280x720_5mb.mp4`;
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

async function main() {
  // check if file exists
  if (!fs.existsSync(SAMPLE_FILE)) {
    throw new Error(`File not found: ${SAMPLE_FILE}`);
  }

  // create a new VOD draft in VIDEO.TAXI
  const vtdata = await createVODDraft({
    name: "bunny.mp4",
    description: "sample video uploaded via API",
  });

  // read file from disk
  const totalContentSize = fs.statSync(SAMPLE_FILE).size;
  const totalChunks = Math.ceil(totalContentSize / CHUNK_SIZE);

  console.log(`Total chunks: ${totalChunks}`);
  const etags = new Array(totalChunks);

  // read the file in chunks
  for (let chunkId = 0; chunkId < totalChunks; chunkId++) {
    const start = chunkId * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalContentSize);
    const chunk = fs.readFileSync(SAMPLE_FILE, { start, end });

    console.log(`Read ${chunk.length} bytes for chunk ${chunkId + 1}`);

    const etag = await uploadChunk(
      chunk,
      chunkId + 1,
      vtdata.createVodDraft.id,
    );
    console.log(`Uploaded chunk ${chunkId + 1} with ETag: ${etag}`);
    // store the ETag for later
    etags[chunkId] = etag;
  }

  console.log(`All chunks uploaded`);

  // finalize vod, initiate processing in VIDEO.TAXI
  await processVodDraft({ id: vtdata.createVodDraft.id, parts: etags });

  console.log("VOD draft processing initiated");
}

/**
 * Uploads a chunk of video to the server.
 *
 * @param {Buffer} chunk - The chunk of video data to upload.
 * @param {number} chunkId - The identifier for the chunk.
 * @param {string} videoTaxiId - The ID of the video draft associated with the upload.
 *
 * @returns {Promise<string>} - A promise that resolves to the ETag of the uploaded chunk.
 * @throws {Error} - Throws an error if the upload URL is not found or the upload fails.
 */
async function uploadChunk(chunk, chunkId, videoTaxiId) {
  console.log(`Uploading chunk ${chunkId}`);
  // Request a new part for each chunk by adjusting chunkId
  const rawDraftData = await getVodDraftUrl({
    id: videoTaxiId,
    number: chunkId,
  });
  const uploadUrl = rawDraftData.vodDraft.partUrl;

  if (!uploadUrl) {
    throw new Error(`No upload URL found`);
  }

  console.log(`Uploading chunk ${chunkId} to ${uploadUrl}`);
  // Upload the chunk
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: chunk,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `Failed to upload chunk ${chunkId}: ${uploadResponse.status} ${uploadResponse.statusText}`,
    );
  }

  const etag = uploadResponse.headers.get("etag");

  if (!etag) {
    throw new Error(`No ETag found`);
  }
  return etag;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
