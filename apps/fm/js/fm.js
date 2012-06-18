function $(id) {
  return document.getElementById(id);
}

function log(msg) {
  $('log').innerHTML = msg;
}

var mozFMRadio = navigator.mozFMRadio;

function enableFM(enable) {
  var request = null;
  try {
    request = mozFMRadio.setEnabled(enable);
  } catch (e) {
    log(e);
  }

  request.onsuccess = function turnon_onsuccess() {
    log('FM status is changed to ' + mozFMRadio.enabled);
  };

  request.onerror = function turnon_onerror() {
    log('Failed to turn on FM!');
  };
}

function setFreq(freq) {
  var request = null;
  try {
    request = mozFMRadio.setFrequency(freq);
  } catch (e) {
    log(e);
  }

  request.onsuccess = function setfreq_onsuccess() {
    log('Set freq successfully!' + freq);
  };

  request.onerror = function sefreq_onerror() {
    log('Fail to set fm freq');
  };
}

function getFreq() {
  $('frequency').textContent = mozFMRadio.frequency;
}

function getPowerStatus() {
  log('Power status: ' + (mozFMRadio.enabled ? 'on' : 'off'));
  $('power-switch').className = mozFMRadio.enabled ? 'poweron' : 'poweroff';
}

function seekUp() {
  var request = null;
  try {
    request = mozFMRadio.seekUp();
  } catch (e) {
    log(e);
  }

  request.onsuccess = function seekup_onsuccess() {
    $('current_freq').innerHTML = mozFMRadio.frequency;
    log('Seek up complete, and got new program.');
  };

  request.onerror = function seekup_onerror() {
    log('Failed to seek up.');
  };
}

function seekDown() {
  var request = null;
  try {
    request = mozFMRadio.seekDown();
  } catch (e) {
    log(e);
  }

  request.onsuccess = function seekdown_onsuccess() {
    $('current_freq').innerHTML = mozFMRadio.frequency;
    log('Seek down complete, and got new program.');
  };

  request.onerror = function seekdown_onerror() {
    log('Failed to seek down.');
  };
}

function cancelSeek() {
  var request = null;
  try {
    request = mozFMRadio.cancelSeek();
  } catch (e) {
    log(e);
  }

  request.onsuccess = function cancel_onsuccess() {
    log('Seeking is canceled.');
  };

  request.onerror = function cancel_onerror() {
    log('Failed to cancel seek.');
  };
}

function checkAntenna() {
  log('Antenna: ' + mozFMRadio.antennaAvailable);
}

function enumNavigator() {
  var names = [];
  for (var n in navigator) {
    names.push(n);
  }
  names.push(mozFMRadio);
  log(names.join('<br/>'));
}

mozFMRadio.onantennachanged = function fm_onantennachanged() {
  // TODO Show warning message if antenna is not available
};


function init() {
  $('freq-op-seekdown').onclick = seekDown;
  $('freq-op-seekup').onclick = seekUp;

  $('freq-op-100khz-down').onclick = function set_frequency_down() {
    setFreq(mozFMRadio.frequency - 0.1);
  };

  $('freq-op-100khz-up').onclick = function set_frequency_up() {
    setFreq(mozFMRadio.frequency + 0.1);
  };

  $('power-switch').onclick = function toggle_fm() {
    enableFM(!mozFMRadio.enabled);
  };

  mozFMRadio.onfrequencychanged = getFreq;
  mozFMRadio.onpowerchanged = getPowerStatus;

  getFreq();
  enableFM(true);
  getPowerStatus();
}

window.addEventListener('load', function(e) {
  init();
}, false);

// Turn off radio immediately when window is unloaded.
window.addEventListener('unload', function(e) {
  enableFM(false);
}, false);

