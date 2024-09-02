# Realtime Speech Translation with VIDEO.TAXI

This Python script enables you to perform real-time speech transcription and translation using the [VIDEO.TAXI](https://service.video.taxi) service.
It will use your own microphone to record sound using ffmpeg and then it establishes a connection to the VIDEO.TAXI GraphQL API.
The audio input is then translated into the specified languages while the script also retrieves the translated transcripts.

This code is by no means production ready, but should give a hint about how the API works in practice.

## Prerequisites

- Python 3.x installed on your system, this script was tested with 3.12
- Ensure you have the necessary dependencies installed. You can install them via pip using `pip -r requirements.txt`.
- FFMPEG or another way of generating audio frames (must include a container).

## Setup

1. Obtain an API key from VIDEO.TAXI and set it as an environment variable named `API_KEY`, for example by putting it in the file `.env`
2. Make sure the API key has permission to write to SPEECH (done in the Web UI of VIDEO.TAXI)

## Usage

Run the script using Python 3. The FFMPEG part records an audio stream using the default microphone and pipes it into stdin of the script.

```bash
ffmpeg -f alsa -i default -ac 2 -f adts - | python3 script.py
```

## Features

- Creates a new speech session with specified translation languages.
- Sends audio input to the master socket URL of the speech session.
- Retrieves translated transcripts from the viewer socket URL.

## Important Notes

- The script waits for a few seconds before collecting transcripts to ensure that the audio is received and processed by VIDEO.TAXI. This is fairly important!
- You can use the `result.viewerWebUrl` to obtain a public URL to view the live transcript and translations in a browser.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
