let records = [];
let valorHora = 0;



/**
 * Compare function that is used to order arrays of records.
 * @param {object} a that contains an id numeric property. 
 * @param {object} b that contains an id numeric property. 
 */
const orderByIdAsc = ( a, b ) => {
  if ( a.id < b.id ){ return -1; }
  if ( a.id > b.id ){ return 1; }
  return 0;
}



/**
 * Returns a truly copy of an object.
 * @param {object} object 
 */
const deepCopy = (object) => {
  let copy = JSON.parse(JSON.stringify(object));
  return copy;
}



/**
 * Generates an id based on the records object array.
 */
const generateRecordId = () => {
  let myrecords = deepCopy(records);
  if(myrecords.length === 0){
    return 1;
  }
  let orderedRecords = myrecords.sort( orderByIdAsc );
  const last = orderedRecords.pop();
  return parseInt(last.id) + parseInt(1);
}



/**
 * Loads/reloads the records object array on screen.
 */
const loadRecords = () => {
  let list = '';
  records.forEach(recordItem => {
    let row = 
      `<tr>`+
        `<td>${recordItem.id}</td>`+
        `<td>${recordItem.description} h</td>`+
        `<td>${recordItem.task}</td>`+
        `<td>${recordItem.hours} h</td>`+
      `</tr>`
    list += row;
  });
  let divComponent = document.getElementById('planilha');
  divComponent.innerHTML = 
    `<table class="table"><thead><tr>`+
    `<th>#</th>`+
    `<th>Description</th>`+
    `<th>Task</th>`+
    `<th>Hours</th>`+
    `</tr></thead><tbody>`+
    list+
    `</tbody></table>`;
};



const setValorHora = () => {
  valorHora = parseFloat(document.getElementById('valorhora').value);
  if(isNaN(valorHora)) valorHora = 0;
}



/**
 * Calcula e atualiza os valores do painel de totalizações.
 */
const calcula = () => {
  let accDevHours = 0;
  let accTestHours = 0;
  records.forEach((element) => {
    accDevHours = parseFloat(accDevHours) + parseFloat(element.devHours);
    accTestHours = parseFloat(accTestHours) + parseFloat(element.testHours);
  });
  let valorTotal = parseFloat(valorHora) * (parseFloat(accDevHours) + parseFloat(accTestHours));

  let recordsCount = (isNaN(records.length) ? '0' : records.length);
  accDevHours = (isNaN(accDevHours) ? '0' : accDevHours);
  accTestHours = (isNaN(accTestHours) ? '0' : accTestHours);
  valorTotal = (isNaN(valorTotal) ? '0' : valorTotal);

  // document.getElementById("resultrecords").innerHTML = recordsCount;
  document.getElementById("resultDevHours").innerHTML = accDevHours + ' h';
  document.getElementById("resultTestHours").innerHTML = accTestHours + ' h';
  document.getElementById("resultTotal").innerHTML = '$ ' + valorTotal;
};



const showDeleteButtons = (buttonList = null) => {
  buttonList = buttonList === null ? document.getElementsByClassName('button deleteButton') : buttonList;
  for (const element of buttonList) {
    element.classList.remove('hidden');
  }
};
const hideDeleteButtons = (buttonList = null) => {
  buttonList = buttonList === null ? document.getElementsByClassName('button deleteButton') : buttonList;
  for (const element of buttonList) {
    element.classList.add('hidden');
  }
};
const toggleDeleteButtons = () => {
  let buttonList = document.getElementsByClassName('button deleteButton');
  if(buttonList[0].className.search('hidden') >= 0){
    showDeleteButtons(buttonList);
  } else {
    hideDeleteButtons(buttonList);
  }
};



const deleteFeature = (featureName, element, event) => {
  toggleDeleteButtons();
  let index = -1;
  records.forEach(element => {
    if(element.feature === featureName){
      index = records.indexOf(element);
    }
  });
  records.splice(index,1);
  setValorHora();
  loadRecords();
  calcula();
};



/**
 * Insert Daily Record modal onsubmit logic to insert a daily record.
 */
const formInsertDailyRecordOnSubmit = (form) => {
  event.preventDefault();
  records.push({
    'id': generateRecordId(),
    'description': form[0].value,
    'hours': parseFloat(form[1].value),
    'task': form[2].value
  });
  loadRecords();
  document.getElementById('closeInsertDailyRecordButton').click();
};



const formImportOnSubmit = async (form) => {
  event.preventDefault();
  await importar('fileimporter');
  setValorHora();
  loadRecords();
  calcula();
  document.getElementById('closeImportButton').click();
}



const exportar = () => {
  downloadFile(JSON.stringify(records));
}

const importar = async (elementId) => {
  let content = await readFile(elementId);
  records = JSON.parse(content);
}

const downloadFile = (content, filename = 'file.txt') => {
  let hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:attachment/text,' + encodeURI(content);
  hiddenElement.target = '_blank';
  hiddenElement.download = filename;
  hiddenElement.click();
}

const readFile = async (elementId) => {
  let file = document.getElementById(elementId).files[0];
  if (file) {
    let content = await file.text();
    return content;
  }
}

/**
 * Valida o input de um campo text como int ou float.
 */
const validate = (evt, float = false, separator = '.') => {
  let theEvent = evt || window.event;
  // Handle paste
  let key;
  if (theEvent.type === 'paste') {
      key = event.clipboardData.getData('text/plain');
  } else {
      // Handle key press
      key = theEvent.keyCode || theEvent.which;
      key = String.fromCharCode(key);
  }
  let regex = /[0-9]/;
  if(float === true && separator === '.'){
      regex = /[0-9]|\./;
  } else if(float === true && separator === ','){
      regex = /[0-9]|\,/;
  }
  if (!regex.test(key)) {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) theEvent.preventDefault();
  }
};

/**
 * Onload da page
 */
window.onload = (event) => {
  loadRecords();
};