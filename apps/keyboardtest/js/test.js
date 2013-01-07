var Keyboard = (function() {
  function createRow(keys) {
    var rowElement = document.createElement('div');
    rowElement.className = 'key-row';

    keys.forEach(function(key) {
      var keyElem = document.createElement('div');
      keyElem.className = 'key-button';
      keyElem.textContent = key.key;
      keyElem.style.width = (key.width ? key.width : '32') + 'px';
      keyElem.dataset.highlight = key.highlight ? key.highlight : true;
      rowElement.appendChild(keyElem);
    });

    document.getElementById('keyboard').appendChild(rowElement);
  }

  function init() {
    createRow([{key: 'q'}, {key: 'w'}, {key: 'e'}, {key: 'r'}, {key: 't'}, {key: 'y'}, {key: 'u'}, {key: 'i'}, {key: 'o'}, {key: 'p'}]);
    createRow([{key: 'a'}, {key: 's'}, {key: 'd'}, {key: 'f'}, {key: 'g'}, {key: 'h'}, {key: 'j'}, {key: 'k'}, {key: 'l'}, {key: '\''}]);
    createRow([{key: 'I', width: 48}, {key: 'z'}, {key: 'x'}, {key: 'c'}, {key: 'v'}, {key: 'b'}, {key: 'n'}, {key: 'm'}, {key: 'l', width: 48}]);
    createRow([{key: '?123', width: 60, hightlight: false}, {key: ','}, {key: 'x'}, {key: 'Space', width: 120, hightlight: false}, {key: '.'}, {key: 'Enter', width: 43}]);

    var keys = document.body.querySelectorAll('#keyboard .key-button');
    var index = 0;
    function highlightNext() {
      var elem = keys[index];
      highlightKey(elem);
      index = ++index % keys.length;

      window.setTimeout(highlightNext, 20);
    }

    highlightNext();
  }

  function highlightKey(keyElem) {
    var hlKey = document.getElementById('highlight');

    if (keyElem.dataset.highlight) {
      hlKey.textContent = keyElem.textContent;
      hlKey.hidden = false;
    } else {
      hlKey.hidden = true;
    }

    hlKey.style.width = keyElem.style.width;
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

