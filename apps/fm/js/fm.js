'use strict';

function $(id) {
  return document.getElementById(id);
}

function $$(expr) {
  return document.querySelectorAll(expr);
}

// XXX fake mozFMRadio object for UI testing on PC
var mozFMRadio = navigator.mozFMRadio || {
  speakerEnabled: false,

  frequency: 91.5,

  enabled: false,

  antennaAvailable: true,

  signalStrength: 1,

  bandRanges: {
    FM: {
      lower: 87.5,
      upper: 108
    }
  },

  onsignalchange: function emptyFunction() { },

  onbandchange: function emptyFunction() { },

  onfrequencychange: function emptyFunction() { },

  onenabled: function emptyFunction() { },

  ondisabled: function emptyFunction() { },

  onantennachange: function emptyFunction() { },

  setEnabled: function fm_setEnabled(enabled) {
    var previousValue = this.enabled;
    this.enabled = enabled;
    if (previousValue != enabled) {
      if (this.enabled) {
        this.onenabled();
      } else {
        this.ondisabled();
      }
    }
  },

  setFrequency: function fm_setFrequency(freq) {
    freq = parseFloat(freq.toFixed(1));
    var previousValue = this.frequency;
    this.frequency = freq;
    if (previousValue != freq) {
      this.onfrequencychange();
    }
    return {};
  },

  seekUp: function fm_seekUp() {
    this.setFrequency(this.frequency + 0.2);
    return {};
  },

  seekDown: function fm_seekDown() {
    this.setFrequency(this.frequency - 0.2);
    return {};
  },

  cancelSeek: function fm_cancelSeek() { }
};

function enableFM(enable) {
  if (!mozFMRadio.antennaAvailable) {
    updateAntennaUI();
    return;
  }

  var request = null;
  try {
    request = mozFMRadio.setEnabled(enable);
  } catch (e) {
    console.log(e);
  }

  if (null == request) {
    return;
  }

  request.onsuccess = function turnon_onsuccess() {
    console.log('FM status is changed to ' + mozFMRadio.enabled);
  };

  request.onerror = function turnon_onerror() {
    console.log('Failed to turn on FM!');
  };
}

function setFreq(freq) {
  var request = null;
  try {
    request = mozFMRadio.setFrequency(freq);
  } catch (e) {
    console.log(e);
  }

  if (null == request) {
    return;
  }

  request.onsuccess = function setfreq_onsuccess() {
    console.log('Set freq successfully!' + freq);
  };

  request.onerror = function sefreq_onerror() {
    console.log('Fail to set fm freq');
  };
}

function updateFreqUI() {
  frequencyDialer.setFrequency(mozFMRadio.frequency);
  $('bookmark-button').className =
       favoritesList.contains(mozFMRadio.frequency) ? 'in-fav-list' : '';
}

function updatePowerUI() {
  console.log('Power status: ' + (mozFMRadio.enabled ? 'on' : 'off'));
  $('power-switch').className = mozFMRadio.enabled ? 'poweron' : 'poweroff';
}

function updateAudioRoutingUI() {
  $('audio-routing-switch').className = 
            mozFMRadio.speakerEnabled ? 'speaker' : 'headset';
}

function updateAntennaUI() {
  $('antenna-warning').hidden = mozFMRadio.antennaAvailable;
}

function seekUp() {
  var request = null;
  try {
    request = mozFMRadio.seekUp();
  } catch (e) {
    console.log(e);
  }

  if (null == request) {
    return;
  }

  request.onsuccess = function seekup_onsuccess() {
    $('current_freq').innerHTML = mozFMRadio.frequency;
    console.log('Seek up complete, and got new program.');
  };

  request.onerror = function seekup_onerror() {
    console.log('Failed to seek up.');
  };
}

function seekDown() {
  var request = null;
  try {
    request = mozFMRadio.seekDown();
  } catch (e) {
    console.log(e);
  }

  if (null == request) {
    return;
  }

  request.onsuccess = function seekdown_onsuccess() {
    $('current_freq').innerHTML = mozFMRadio.frequency;
    console.log('Seek down complete, and got new program.');
  };

  request.onerror = function seekdown_onerror() {
    console.log('Failed to seek down.');
  };
}

function cancelSeek() {
  var request = null;
  try {
    request = mozFMRadio.cancelSeek();
  } catch (e) {
    console.log(e);
  }

  request.onsuccess = function cancel_onsuccess() {
    console.log('Seeking is canceled.');
  };

  request.onerror = function cancel_onerror() {
    console.log('Failed to cancel seek.');
  };
}

function getBand() {
  return mozFMRadio.bandRanges;
}

var frequencyDialer = {
  unit: 5,
  _minFrequency: 0,
  _maxFrequency: 0,
  _currentFreqency: 0,

  init: function() {
    this._initUI();
    this.setFrequency(mozFMRadio.frequency);
    this._addEventListeners();
  },

  _addEventListeners: function() {
    var self = this;
    var _initMouseX = 0;
    var _initDialerX = 0;
    var _initFrequency = 0;

    function _calcTargetFrequency(event) {
      var space = $('freq-dialer').clientWidth /
                 (self._maxFrequency - self._minFrequency + 1);
      var movingSpace = event.clientX - _initMouseX;
      var targetFrequency = _initFrequency - movingSpace / space;
      return parseFloat(targetFrequency.toFixed(1));
    }

    var _movetimeout = null;
    function fd_body_mousemove(event) {
      window.clearTimeout(_movetimeout);
      window.setTimeout(function fd_body_mousemove_timeout() {
        var targetFrequency = _calcTargetFrequency(event);
        self.setFrequency(targetFrequency);
      }, 100);
    }

    function fd_body_mouseup(event) {
      _removeEventListeners();

      var targetFrequency = _calcTargetFrequency(event);
      self.setFrequency(targetFrequency);
      var req = mozFMRadio.setFrequency(targetFrequency);
      req.onerror = function onerror_setFrequency() {
        self.setFrequency(mozFMRadio.frequency);
      };

      $('freq-dialer').classList.add('animation-on');
    }

    function _removeEventListeners() {
      document.body.removeEventListener('mouseup', fd_body_mouseup, false);
      document.body.removeEventListener('mousemove', fd_body_mousemove, false);
    }

    $('freq-dialer').addEventListener('mousedown', function fd_mousedown(evt) {
      var dialer = $('freq-dialer');
      dialer.classList.remove('animation-on');
      _initMouseX = evt.clientX;
      _initDialerX = parseInt(dialer.style.left);
      _initFrequency = self._currentFreqency;

      _removeEventListeners();
      document.body.addEventListener('mousemove', fd_body_mousemove, false);
      document.body.addEventListener('mouseup', fd_body_mouseup, false);
    }, false);

    mozFMRadio.onbandchange = function onbandchange() {
      console.log('band is changed: ' + JSON.stringify(mozFMRadio.bandRanges));
      self._initUI();
      self.setFrequency(self._currentFreqency);
    };
  },

  _initUI: function() {
    $('freq-dialer').innerHTML = '';
    var lower = getBand().FM.lower;
    var upper = getBand().FM.upper;

    var unit = this.unit;
    this._minFrequency = lower - lower % unit;
    this._maxFrequency = upper + unit - upper % unit;
    var unitCount = (this._maxFrequency - this._minFrequency) / unit;

    for (var i = 0; i < unitCount; ++i) {
      var start = this._minFrequency + i * unit;
      start = start < lower ? lower : start;
      var end = this._maxFrequency + i * unit + unit;
      end = upper < end ? upper : end;
      this._addDialerUnit(start, end);
    }
  },

  _addDialerUnit: function(start, end) {
    var showFloor = start % this.unit == 0;
    var markStart = start - start % this.unit;
    var html = [];

    if (showFloor) {
      html.push('<div class="dialer-unit-floor">' + start + '</div>');
    } else {
      html.push('  <div class="dialer-unit-floor hidden-block">' +
                        start + '</div>');
    }
    html.push('    <div class="dialer-unit-mark-box">');

    for (var i = 0; i < this.unit; i++) {
      if (markStart + i < start || markStart + i > end) {
        html.push('    <div class="dialer-mark hidden-block"></div>');
      } else {
        html.push('    <div class="dialer-mark ' +
                            (0 == i ? 'dialer-mark-long' : '') + '"></div>');
      }
    }

    html.push('    </div>');
    html.push('  </div>');
    var unit = document.createElement('div');
    unit.className = 'dialer-unit';
    unit.innerHTML = html.join('');
    $('freq-dialer').appendChild(unit);
  },

  _updateUI: function() {
    var space = $('freq-dialer').clientWidth /
                 (this._maxFrequency - this._minFrequency + 1);
    $('freq-dialer').style.left =
            (this._minFrequency - this._currentFreqency) * space + 'px';
    $('frequency').textContent = this._currentFreqency;
  },

  setFrequency: function(frequency) {
    if (frequency < this._minFrequency || frequency > this._maxFrequency) {
      return;
    }
    this._currentFreqency = frequency;
    this._updateUI();
  }
};

var favoritesList = {
  _favList: null,

  KEYNAME: 'favlist',

  init: function() {
    var savedList = localStorage.getItem(this.KEYNAME);
    this._favList = !savedList ? { } : JSON.parse(savedList);
    this._showListUI();
    var self = this;
    var _container = $('fav-list-container');
    _container.addEventListener('click', function _onclick(event) {
      if (event.target.classList.contains('fav-list-remove-button')) {
        // remove from favorites list
        self.remove(self._getElemFreq(event.target));
        updateFreqUI();
      } else {
        setFreq(self._getElemFreq(event.target));
      }
    }, false);
  },

  _save: function() {
    localStorage.setItem(this.KEYNAME, JSON.stringify(this._favList));
  },

  _showListUI: function() {
    var self = this;
    this.forEach(function(f) {
      self._addItemToListUI(f);
    });
  },

  _addItemToListUI: function(item) {
    var container = $('fav-list-container');
    var elem = document.createElement('div');
    elem.className = 'fav-list-item';
    elem.id = this._getUIElemId(item);
    var html = [];
    html.push('<div class="fav-list-remove-button"></div>');
    html.push('<label class="fav-list-frequency">');
    html.push(item.frequency);
    html.push('</label>');
    elem.innerHTML = html.join('');
    container.appendChild(elem);
  },

  _removeItemFromListUI: function(freq) {
    if (!this.contains(freq)) {
      return;
    }

    var itemElem = $(this._getUIElemId(this._favList[freq]));
    if (itemElem) {
      itemElem.parentNode.removeChild(itemElem);
    }
  },

  _getUIElemId: function(item) {
    return 'freq-' + item.frequency;
  },

  _getElemFreq: function(elem) {
    var listItem = elem.parentNode.classList.contains('fav-list-item')
                        ? elem.parentNode : elem;
    return parseFloat(listItem.id.substring(listItem.id.indexOf('-') + 1));
  },

  _showPopupDelUI: function(event) {
    var element = event.target;
    // Show popup just below the cursor
    var box = $('popup-delete-box');
    box.hidden = false;
    var max = document.body.clientWidth - box.clientWidth - 10;
    var min = 10;
    var left = event.clientX - box.clientWidth / 2;
    left = left < min ? min : (left > max ? max : left);
    box.style.top = event.clientY + 10 + 'px';
    box.style.left = left + 'px';

    function _onclick_delete_button(event) {
      self.remove(self._getElemFreq(element));
      updateFreqUI();
      _hidePopup();
      _clearEventListeners();
    }

    function _hidePopup() {
      $('popup-delete-box').hidden = true;
      $('popup-delete-button').removeEventListener('click',
                                 _onclick_delete_button, false);
    }

    function _mousedown_del_box(event) {
      event.stopPropagation();
    }

    function _mousedown_body(event) {
      _hidePopup();
      _clearEventListeners();
    }

    function _clearEventListeners() {
      document.body.removeEventListener('mousedown', _mousedown_body, false);
      $('popup-delete-box').removeEventListener('mousedown',
                              _mousedown_del_box, true);
    }

    function _addEventListeners() {
      // Hide popup when tapping
      document.body.addEventListener('mousedown', _mousedown_body, false);
      $('popup-delete-box').addEventListener('mousedown',
                              _mousedown_del_box, true);
    }
    _addEventListeners();

    var self = this;

    $('popup-delete-button').addEventListener('click',
                               _onclick_delete_button, false);
  },

  forEach: function(callback) {
    for (var freq in this._favList) {
      callback(this._favList[freq]);
    }
  },

  /**
   *  Check if frequency is in fav list.
   */
  contains: function(freq) {
    return typeof this._favList[freq] != 'undefined';
  },

  /**
   * Add frequency to fav list.
   */
  add: function(freq) {
    if (!this.contains(freq)) {
      this._favList[freq] = {
        name: freq + '',
        frequency: freq
      };

      this._addItemToListUI(this._favList[freq]);
      this._save();

      // show the item in favorites list.
      $('fav-list').scrollTop =
               $('fav-list').scrollHeight - $('fav-list').clientHeight;
    }
  },

  /**
   * Remove frequency from fav list.
   */
  remove: function(freq) {
    var exists = this.contains(freq);
    this._removeItemFromListUI(freq);
    delete this._favList[freq];
    this._save();
    return exists;
  }
};

function addSampleFavs() {
  favoritesList.add(87.5);
  favoritesList.add(88);
  favoritesList.add(88.5);
  favoritesList.add(89);
  favoritesList.add(100);
  favoritesList.add(103);
}

function init() {
  favoritesList.init();
  frequencyDialer.init();

  addSampleFavs();

  $('freq-op-seekdown').addEventListener('click', seekDown, false);
  $('freq-op-seekup').addEventListener('click', seekUp, false);

  $('power-switch').addEventListener('click', function toggle_fm() {
    enableFM(!mozFMRadio.enabled);
  }, false);

  $('audio-routing-switch').addEventListener('click', function toggle_speaker() {
    mozFMRadio.speakerEnabled = !mozFMRadio.speakerEnabled;
    updateAudioRoutingUI();
  }, false);

  $('bookmark-button').addEventListener('click', function toggle_bookmark() {
    if (favoritesList.contains(mozFMRadio.frequency)) {
      favoritesList.remove(mozFMRadio.frequency);
    } else {
      favoritesList.add(mozFMRadio.frequency);
    }
    updateFreqUI();
  }, false);

  mozFMRadio.onfrequencychange = updateFreqUI;
  mozFMRadio.onenabled  = updatePowerUI;
  mozFMRadio.ondisabled = updatePowerUI;
  mozFMRadio.onantennachange = function onAntennaChange() {
    updateAntennaUI();
    if (mozFMRadio.antennaAvailable) {
      enableFM(true);
    }
  };

  updateFreqUI();
  enableFM(true);
  updatePowerUI();
  updateAudioRoutingUI();
}

window.addEventListener('load', function(e) {
  init();
}, false);

// Turn off radio immediately when window is unloaded.
window.addEventListener('unload', function(e) {
  enableFM(false);
}, false);

// Set the 'lang' and 'dir' attributes to <html> when the page is translated
window.addEventListener('localized', function showBody() {
  document.documentElement.lang = navigator.mozL10n.language.code;
  document.documentElement.dir = navigator.mozL10n.language.direction;
  // <body> children are hidden until the UI is translated
  document.body.classList.remove('hidden');
});

