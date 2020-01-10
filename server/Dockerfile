# Setup the server
FROM golang:latest

# copying local go modules
COPY ./middleware /go/src/server/middleware
COPY ./router /go/src/server/router
COPY ./models /go/src/server/models

# top level executable
WORKDIR /go/src/app/
COPY ./main.go .

# update packages
RUN go get -d -v ./...

# build binary and copy it
RUN go build main.go

# expose server port and build exe
EXPOSE 8080
CMD ["./main"]