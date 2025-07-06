FROM node:17-alpine

# I like to use bash scripts, so install that
RUN apk add --no-cache bash

# install with -g flag so the terser and jshint executables can be used by the shell
RUN npm install terser -g

CMD ["terser"]