var Keyboard = (function() {
  function log(str) {
    console.log('-*- Keyboard -*-' + (new Date().getTime() % 10000) + ' ' + str);
  }

  function createRow(keys) {
    var rowElement = document.createElement('div');
    rowElement.className = 'key-row';

    keys.forEach(function(key) {
      var keyElem = document.createElement('div');
      keyElem.className = 'key-button';
      keyElem.id = 'id-' + key.key;
      keyElem.textContent = key.key;
      keyElem.style.width = (key.width ? key.width : '32') + 'px';
      keyElem.dataset.highlight = typeof key.highlight == 'undefined' ? true : key.highlight;
      rowElement.appendChild(keyElem);
    });

    document.getElementById('keyboard').appendChild(rowElement);
  }

  var timeout = null;
  function init() {
    createRow([{key: 'q'}, {key: 'w'}, {key: 'e'}, {key: 'r'}, {key: 't'}, {key: 'y'}, {key: 'u'}, {key: 'i'}, {key: 'o'}, {key: 'p'}]);
    createRow([{key: 'a'}, {key: 's'}, {key: 'd'}, {key: 'f'}, {key: 'g'}, {key: 'h'}, {key: 'j'}, {key: 'k'}, {key: 'l'}, {key: '\''}]);
    createRow([{key: 'I', width: 48}, {key: 'z'}, {key: 'x'}, {key: 'c'}, {key: 'v'}, {key: 'b'}, {key: 'n'}, {key: 'm'}, {key: 'l', width: 48}]);
    createRow([{key: '?123', width: 60, highlight: false}, {key: ','}, {key: 'x'}, {key: 'Space', width: 120, highlight: false}, {key: '.'}, {key: 'Enter', width: 43, highlight: false}]);

    var keys = document.body.querySelectorAll('#keyboard .key-button');
    var index = 0;

    function highlightNextKey() {
      var elem = keys[index];
      highlightKey(elem);
      index = ++index % keys.length;

      timeout = window.setTimeout(highlightNextKey, 20);
    }

    // highlightNextKey();

    document.getElementById('id-Space').onclick = function onclick_space() {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
      } else {
        highlightNextKey();
      }
    };

    // Helper function to iterate through a touch event's
    // changedTouches array. For each touch, it calls a callback
    // function with the touch and touchId as arguments.
    function handleTouches(evt, callback) {
      for (var i = 0; i < evt.changedTouches.length; i++) {
        var touch = evt.changedTouches[i];
        var touchId = touch.identifier;
        callback(touch, touchId);
      }
    }

    var oldTarget = null;
    function onTouchMove(event) {
      event.preventDefault();
      handleTouches(event, function handleTouchMove(touch, touchId) {
        log('Touch Event: ' + touch.pageX + ', ' + touch.pageY);
        var target = document.elementFromPoint(touch.pageX, touch.pageY);
        if (target == oldTarget) {
          return;
        }

        oldTarget = target;
        movePress(target, touch, touchId);
      });
    }

    function movePress(target, touch, touchId) {
      if (target.classList.contains('key-button')) {
        highlightKey(target);
      } else {
        log('ignore');
      }
    }

    function onMousemove(event) {
      movePress(event.target, event, null);
    }

    var keyboard = document.getElementById('keyboard');
    keyboard.addEventListener('touchstart', function() {
      log('trouch start');
      keyboard.addEventListener('touchmove', onTouchMove);
    });

    keyboard.addEventListener('mousedown', function() {
      log('trouch start');
      keyboard.addEventListener('mousemove', onMousemove);
    });

    keyboard.addEventListener('touchend', function() {
      keyboard.removeEventListener('touchmove', onTouchMove);
    });

    keyboard.addEventListener('mouseup', function() {
      keyboard.removeEventListener('mousemove', onMousemove);
    });
  }

  var highlightedKeyElem = null;

  function highlightKey(keyElem) {
    if (highlightedKeyElem == keyElem) {
      return;
    }

    if (highlightedKeyElem) {
      highlightedKeyElem.classList.remove('highlighted');
    }

    log('Highlight key: ' + keyElem.textContent);

    highlightedKeyElem = keyElem;

    var hlKey = document.getElementById('highlight');
    keyElem.classList.add('highlighted');

    if (keyElem.dataset.highlight == "true") {
      hlKey.childNodes[0].textContent = keyElem.textContent;
      hlKey.hidden = false;
    } else {
      hlKey.hidden = true;
    }

    hlKey.style.width = parseInt(keyElem.style.width) + 20 + 'px';
    hlKey.style.left = '-10px';
    keyElem.appendChild(hlKey);
  }

  window.addEventListener('load', function onload_wnd(event) {
    window.removeEventListener('load', onload_wnd);
    init();
  });

  return {
    highlightKey: highlightKey
  };
})();

