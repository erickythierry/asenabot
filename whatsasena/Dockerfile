FROM ubuntu:20.04
ENV TZ=America/Belem
ENV DEBIAN_FRONTEND noninteractive
RUN apt update -y
RUN apt install ffmpeg nodejs npm git -y
RUN git clone https://github.com/erickythierry/asenabot bot
WORKDIR /bot
RUN npm install supervisor -g
RUN npm i
CMD ["node", "bot.js"]
