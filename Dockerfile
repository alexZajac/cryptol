
# Setup and build the client

# FROM node:12.10.0-slim as client

# WORKDIR /usr/src/app/client/
# COPY client/package*.json ./
# RUN npm install --quiet
# COPY client/ ./
# RUN npm run build


# Setup the server
FROM golang:alpine
COPY ./server /go/src/server
# WORKDIR /usr/src/app/
# COPY --from=client /usr/src/app/client/build/ ./client/build/
WORKDIR /go/src/app/
COPY ./server/main.go .

RUN go get -d -v ./...
RUN go install -v ./...

RUN go build main.go
CMD ["main"]