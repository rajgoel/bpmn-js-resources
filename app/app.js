import Modeler from 'bpmn-js/lib/Modeler';

import sampleProcess from './newDiagram.bpmn';

import resourcePackage from './resource.json';

import {
  ResourceContextPadProvider,
  ResourcePaletteProvider,
  ResourceRenderer
} from './modules';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

var HIGH_PRIORITY = 100000;

var modeler = new Modeler({
  container: '#canvas',
  additionalModules: [
    {
      __init__: [ 'contextPadProvider', 'renderer', 'paletteProvider', ],
      contextPadProvider: [ 'type', ResourceContextPadProvider ],
      renderer: [ 'type', ResourceRenderer ],
      paletteProvider: [ 'type', ResourcePaletteProvider ]
    }
  ],
  moddleExtensions: {
    resource: resourcePackage
  }
});

modeler.importXML(sampleProcess);

window.modeler = modeler;

var element;

modeler.on('element.contextmenu', HIGH_PRIORITY, function(event) {
  element = event.element;

  var businessObject = getBusinessObject(element);

  if (!businessObject.type) {
    return;
  }

  event.originalEvent.preventDefault();
  event.originalEvent.stopPropagation();

  return true;
});

function downloadXML(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function show(content) {
  console.log(content);
  modeler.importXML(content, function(err) {
    if (err) {
      modeler.container
        .removeClass('with-diagram')
        .addClass('with-error');
      modeler.container.find('.error pre').text(err.message);
      console.error(err);
    } else {
      modeler.container
        .removeClass('with-error')
        .addClass('with-diagram');
    }
  });
}


var href = new URL(window.location.href);
var src = href.searchParams.get('src');
console.log(src);
if (src) {
  loadBPMN(src);
}

function loadBPMN(URL) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      show(xhttp.responseText);
    }
    else {
      console.warn('Failed to get file. ReadyState: ' + xhttp.readyState + ', Status: ' + xhttp.status);
    }
  };
  xhttp.open('GET',URL,true);
  xhttp.send();
}

var uploadBPMN = document.getElementById('js-upload-bpmn');
if (uploadBPMN) {
  uploadBPMN.value = '';
  uploadBPMN.addEventListener('change', function(event) {
    console.log(event.target);
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      show(reader.result);
    };
    reader.onerror = function(err) {
      console.log(err,err.loaded,err.loaded === 0,file);
    };

    reader.readAsText(event.target.files[0]);
  });
}

var downloadBPMN = document.getElementById('js-download-bpmn');
var downloadSVG = document.getElementById('js-download-svg');

if (downloadBPMN) {
  downloadBPMN.addEventListener('click', function() {
    modeler.saveXML({ format: true }, function(err, xml) {
      downloadXML('diagram.bpmn', xml);
      console.log(xml);
    });
    return false;
  });
}
if (downloadSVG) {
  downloadSVG.addEventListener('click', function() {
    modeler.saveSVG({}, function(err, svg) {
      downloadXML('diagram.svg', svg);
      console.log(svg);
    });
    return false;
  });
}

