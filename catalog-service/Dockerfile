FROM golang:1.22-alpine AS build
WORKDIR /src
ENV GOPROXY=https://proxy.golang.org,direct
COPY go.mod ./
RUN go mod download && go mod tidy
COPY . .
RUN go build -o /bin/catalog

FROM alpine:3.20
WORKDIR /app
COPY --from=build /bin/catalog /app/catalog
EXPOSE 3002
CMD ["/app/catalog"]
