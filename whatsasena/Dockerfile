FROM ethie/asenabot:last
RUN git clone https://github.com/erickythierry/whatsapp.bot bot
WORKDIR /bot
RUN npm install supervisor -g
RUN npm i
CMD ["node", "bot.js"]
