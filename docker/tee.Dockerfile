FROM gramineproject/gramine
COPY app /app
ENTRYPOINT ["gramine-sgx", "/app"]
