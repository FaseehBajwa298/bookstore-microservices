FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download || true
COPY . .
RUN go build -o /bin/inventory

FROM alpine:3.20
WORKDIR /app
COPY --from=build /bin/inventory /app/inventory
EXPOSE 3004
CMD ["/app/inventory"]