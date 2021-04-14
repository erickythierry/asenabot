FROM ethie/asenabot
RUN git clone https://github.com/erickythierry/asenabot bot
WORKDIR /bot
RUN npm install supervisor -g
RUN npm i
CMD ["node", "bot.js"]
