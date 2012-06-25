function $(id) {
  return document.getElementById(id);
}

function toggleClass(elem, className) {
  if (elem.classList.contains(className)) {
    elem.classList.remove(className);
  } else {
    elem.classList.add(className);
  }
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
  _favList: null,

  editting: false,

  init: function() {
    // TODO read from local data 
    this._favList = [
      {name: "88.7",  frequency: 88.7},
      {name: "90",    frequency: 90},
      {name: "91.5",  frequency: 91.5},
      {name: "105.5", frequency: 105.5},
    ];
    this._showListUI();

    $('edit-btn').onclick = this.startEdit.bind(this);
    $('cancel-btn').onclick = this.cancelEdit.bind(this);
    $('delete-btn').onclick = this.delSelectedItems.bind(this);
  },

  _save: function() {
    // TODO save to local data
  },

  _showListUI: function() {
    this._emptyListUI();
    var self = this;
    this.all().forEach(function(f) {
      self._addItemToListUI(f);
    });
  },

  _addItemToListUI: function(item) {
    var container = $('fav-list-container');
    var elem = document.createElement('div');
    elem.id = this._getUIElemId(item);
    elem.textContent = item.frequency;
    container.appendChild(elem);

    elem.onclick = this.onclick_item.bind(this);

    this._autoShowHideEditBtn();
  },

  _removeItemFromListUI: function(idx) {
    var itemElem = $(this._getUIElemId(this._favList[idx]));
    if (itemElem) {
      itemElem.parentNode.removeChild(itemElem);
    }
    this._autoShowHideEditBtn();
  },

  _emptyListUI: function() {
    var container = $('fav-list-container');
    container.innerHTML = '';
    this._autoShowHideEditBtn();
  },

  _autoShowHideEditBtn: function() {
    $('edit-btn').style.display =  $('fav-list-container').querySelectorAll('div').length > 0 ? 'block' : 'none';
  },

  _getUIElemId: function(item) {
    return 'freq-' + item.frequency;
  },

  _getElemFreq: function(elem) {
    return parseFloat(elem.id.substring(elem.id.indexOf('-') + 1));
  },

  onclick_item: function(event) {
    if (!this.editting) {
      setFreq(this._getElemFreq(event.target));
    } else {
      toggleClass(event.target, "selected");
    }
  },

  startEdit: function(event) {
    this.editting = true;
    $('switch-bar').style.display = 'none';
    $('edit-bar').style.display = 'block';
  },

  cancelEdit: function(event) {
    this.editting = false;
    $('switch-bar').style.display = 'block';
    $('edit-bar').style.display = 'none';
    var selectedItems = document.querySelectorAll('#fav-list-container > div.selected');
    for (var i = 0; i < selectedItems.length; i++) {
      selectedItems[i].classList.remove('selected');
    }
  },

  delSelectedItems: function(event) {
    var selectedItems = document.querySelectorAll('#fav-list-container > div.selected');
    for (var i = 0; i < selectedItems.length; i++) {
      this.remove(this._getElemFreq(selectedItems[i]));
    }
    updateFreqUI();
  },

  all: function() {
    return this._favList;
  },

  indexOf: function(freq) {
    for (var i = 0; i < this._favList.length; i++) {
      if (this._favList[i].frequency === freq) {
        return i;
      }
    }
    return -1;
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
      this._addItemToListUI(this._favList[this._favList.length - 1]);
      this._save();
      // TODO show the item in frequency list.
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
        this._removeItemFromListUI(i);
        continue;
      } else {
        newList.push(this._favList[i]);
      }
    }
    this._favList = newList;
    this._save();
    return exists;
  }
};

function init() {
  favList.init();

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

