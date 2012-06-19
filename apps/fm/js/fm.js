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

function updateFreqUI() {
  $('frequency').textContent = mozFMRadio.frequency;
  $('bookmark-btn').className = favList.contains(mozFMRadio.frequency) ? 'in-fav-list' : '';
}

function updatePowerUI() {
  log('Power status: ' + (mozFMRadio.enabled ? 'on' : 'off'));
  $('power-switch').className = mozFMRadio.enabled ? 'poweron' : 'poweroff';
}

function updateAntennaUI() {
    // TODO Show warning message if antenna is not available
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

var favList = {
  // XXX replaced with localstorage
  _favList: [
    {name: "88.7",  frequency: 88.7},
    {name: "90",    frequency: 90},
    {name: "91.5",  frequency: 91.5},
    {name: "105.5", frequency: 105.5},
  ],

  all: function() {
    return this._favList;
  },

  /**
   *  Check if frequency is in fav list.
   */
  contains: function(freq) {
    for (var i = 0; i < this._favList.length; i++) {
      if (this._favList[i].frequency === freq) {
        return true;
      }
    }
    return false;
  },

  /**
   * Add frequency to fav list.
   */
  add: function(freq) {
    if (!this.contains(freq)) {
      this._favList.push({
        name: freq + '',
        frequency: freq
      });
    }
  },

  /**
   * Remove frequency from fav list.
   * @return
   *   true:
   *     frequency exists in the fav list
   *   false
   *     frequency doesn't exist in the fav list
   */
  remove: function(freq) {
    var newList = [];
    var exists = false;
    for (var i = 0; i < this._favList.length; i++) {
      if (this._favList[i].frequency === freq) {
        exists = true;
        continue;
      } else {
        newList.push(this._favList[i]);
      }
    }
    this._favList = newList;
    return exists;
  }
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

  $('bookmark-btn').onclick = function toggle_bookmark() {
    if (favList.contains(mozFMRadio.frequency)) {
      favList.remove(mozFMRadio.frequency);
    } else {
      favList.add(mozFMRadio.frequency);
    }
    updateFreqUI();
  };

  mozFMRadio.onfrequencychanged = updateFreqUI;
  mozFMRadio.onpowerchanged = updatePowerUI;
  mozFMRadio.onantennachanged = updateAntennaUI;

  updateFreqUI();
  enableFM(true);
  updatePowerUI();
}

window.addEventListener('load', function(e) {
  init();
}, false);

// Turn off radio immediately when window is unloaded.
window.addEventListener('unload', function(e) {
  enableFM(false);
}, false);

