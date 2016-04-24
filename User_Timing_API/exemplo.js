var AudioContext = window.AudioContext ||
                    window.webkitAudioContext;
var context = new AudioContext();
var reqcount = 0;
var reqCnt = 0;
var i = 0;
var musica1 = context.createBufferSource();
var musica2 = context.createBufferSource();

var filtromix1   = context.createGain();
var filtromix2   = context.createGain();

var dropbass  = context.createBiquadFilter();
  //Definindo o tipo do filtro como passa baixas
dropbass.type = 'lowpass';
  //Definindo limite do filtro
dropbass.frequency.value = 440;

var volume  = context.createGain();

var playing = false;

var input1 = document.getElementById('track1');
var input2 = document.getElementById('track2');
var t = performance.now();
console.log('Exemplo do now ' + t + ' milisegundos');
//Funcao de tocar e pausar musicas
document.getElementById("play").addEventListener("click", function(){
  if(!playing){
    window.performance.mark('começacarregarmusica');//começa

    musica1 = context.createBufferSource();
    musica2 = context.createBufferSource();

    musica1.connect(filtromix1);
    musica2.connect(filtromix2);

    musica1.path = "tracks/" + input1.value + ".mp3";
    musica2.path = "tracks/" + input2.value + ".mp3";

    filtromix1.connect(volume);
    filtromix2.connect(volume);

    volume.connect(dropbass);

    dropbass.connect(context.destination);

    carregaSom(musica1.path, musica1);
    carregaSom(musica2.path, musica2);

    filtromix1.gain.value = 1;
    filtromix2.gain.value = 0;

    dropbass.frequency.value = 5000;

    musica1.start();
    musica2.start();
    playing = true;
    window.performance.mark('terminacarregarmusica');//acaba
    reqcount++;
    window.performance.measure('Carregamento_da_musica_' + reqcount, 'começacarregarmusica', 'terminacarregarmusica');


  } else {
    musica1.stop();
    musica2.stop();
    playing = false;
  }
  var items = window.performance.getEntriesByType('measure');//imprime
  for (i = i; i < Object.keys(items).length; i++) {
    var req = items[i];
    console.log(req.name + ' took ' + req.duration + 'ms');

  }
});




//Funcao para interpolar as 2 musicas
crossfade = function(element) {
  var x = parseInt(element.value) / parseInt(element.max);

  // Use an equal-power crossfading curve:
  var gain1 = Math.cos(x * 0.5*Math.PI);
  var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);


  filtromix1.gain.value = gain1;
  filtromix2.gain.value = gain2;
};


//Funcao de controle de volume
volume.changeVolume = function(element) {
  var fraction = parseInt(element.value) / parseInt(element.max);
  //Uso de aumento de volume quadratico

  volume.gain.value = fraction * fraction;
};



dropaBass = function(element) {
  // Interpolar a frequencia entre a minima e metade da fornecida
  var minValue = 40;
  var maxValue = context.sampleRate / 2;
  // Logarithm (base 2) to compute how many octaves fall in the range.
  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  // Compute a multiplier from 0 to 1 based on an exponential scale.
  var multiplier = Math.pow(2, numberOfOctaves * (element.value - 1.0));
  // Get back to the frequency value between min and max.
  dropbass.frequency.value = maxValue * multiplier;
};


changeQuality = function(element) {
  dropbass.Q.value = element.value * 30;
};



//Funcao para carregar novos sons atraves de um caminho
function carregaSom(url, musiquinha) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    window.performance.mark('TerminaXMLH');//acaba
    reqCnt++;
    window.performance.measure('Carregamento_do_XMHL_' + reqCnt, 'ComecaXMLH', 'TerminaXMLH');


    context.decodeAudioData(request.response, function(buffer) {

      musiquinha.buffer = buffer;
    });
  }
  window.performance.mark('ComecaXMLH');//começa
  request.send();




}

/*
var items = window.performance.getEntriesByType('measure');
for (var i = 0; i < items.length(); ++i) {
  var req = items[i];
  console.log(req.name + ' took ' + req.duration + 'ms');
}
*/
