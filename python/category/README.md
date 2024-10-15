# Realtime Speech Translation with VIDEO.TAXI

This Python script enables you to create a new category and assign the category to a VoD using the [VIDEO.TAXI](https://service.video.taxi) service.

This code is by no means production ready, but should give a hint about how the API works in practice.

## Prerequisites

- Python 3.x installed on your system, this script was tested with 3.12
- Install python virtual environment using `sudo apt install python3.12-venv`.
- Create an environment in the folder of an example using `python3 -m venv .venv`. Then activate the env using `source .venv/bin/activate`.
- Ensure you have the necessary dependencies installed. You can install them via pip using `pip install -r requirements.txt`.

## Setup

1. Obtain an API key from VIDEO.TAXI and set it as an environment variable named `API_KEY`, for example by putting it in the file `.env`
2. Make sure the API key has permission to create, read and update to Media Library Category. And also read and update to Media Library (done in the Web UI of VIDEO.TAXI).

## Usage

Run the script using Python 3.

```bash
python3 script.py <vodId>
```

## Features

- Creates a new category with specified name.
- Assigns the VoD to the new category.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
