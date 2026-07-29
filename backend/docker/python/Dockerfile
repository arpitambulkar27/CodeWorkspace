FROM python:3.12-slim

# Create the same uid/gid we force via dockerRunner's User: "1000:1000"
RUN useradd -u 1000 -m sandboxuser
WORKDIR /sandbox
USER sandboxuser

# No CMD/ENTRYPOINT — dockerRunner passes the exact command per run
