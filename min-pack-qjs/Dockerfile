# syntax=docker/dockerfile:1.25.0

FROM alpine:3.24.1 AS builder

RUN apk add --no-cache build-base unzip wget

WORKDIR /build
RUN wget https://github.com/bellard/quickjs/archive/04be246001599f5995fa2f2d8c91a0f198d3f34c.zip -O quickjs-04be246001599f5995fa2f2d8c91a0f198d3f34c.zip
RUN unzip quickjs-04be246001599f5995fa2f2d8c91a0f198d3f34c.zip \
 && mv quickjs-04be246001599f5995fa2f2d8c91a0f198d3f34c/* . \
 && rm -rf quickjs-04be246001599f5995fa2f2d8c91a0f198d3f34c.zip quickjs-04be246001599f5995fa2f2d8c91a0f198d3f34c

ENV CFLAGS="-O3 -flto -ffunction-sections -fdata-sections -Wall"
ENV LDFLAGS="-static -Wl,--gc-sections -Wl,--strip-all"
ARG BUILDARCH
RUN make -j$(nproc) qjs qjsc \
 && mv qjs /qjs-linux-${BUILDARCH} \
 && mv qjsc /qjsc-linux-${BUILDARCH}

# ---------
FROM scratch AS exporter
ARG BUILDARCH
COPY --from=builder /qjs-linux-${BUILDARCH} /qjs-linux-${BUILDARCH}
COPY --from=builder /qjsc-linux-${BUILDARCH} /qjsc-linux-${BUILDARCH}

# run with:
#   cat Dockerfile | sudo docker build --output='type=local,dest=.' -
#   sudo chown "$(id -u):$(id -g)" ./qjs*-linux-*64
