let features = [];
let valorHora = 0;
/**
 * Carrega/refresh a coleção de features na tela
 */
const loadFeatures = () => {
  let list = '';
  let records = features;

  records.forEach(recordItem => {
    let row = 
      `<tr>`+
        `<td>${recordItem.id}</td>`+
        `<td>${recordItem.hours} h</td>`+
        `<td>${recordItem.description} h</td>`+
        `<td>$ ${recordItem.taskId}</td>`+
      `</tr>`
    list += row;
  });

  let divComponent = document.getElementById('planilha');
  divComponent.innerHTML = 
    `<table class="table"><thead><tr>`+
    `<th>#</th>`+
    `<th>Hours</th>`+
    `<th>Description</th>`+
    `<th>Task</th>`+
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
  features.forEach((element) => {
    accDevHours = parseFloat(accDevHours) + parseFloat(element.devHours);
    accTestHours = parseFloat(accTestHours) + parseFloat(element.testHours);
  });
  let valorTotal = parseFloat(valorHora) * (parseFloat(accDevHours) + parseFloat(accTestHours));

  let featuresCount = (isNaN(features.length) ? '0' : features.length);
  accDevHours = (isNaN(accDevHours) ? '0' : accDevHours);
  accTestHours = (isNaN(accTestHours) ? '0' : accTestHours);
  valorTotal = (isNaN(valorTotal) ? '0' : valorTotal);

  document.getElementById("resultFeatures").innerHTML = featuresCount;
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
  features.forEach(element => {
    if(element.feature === featureName){
      index = features.indexOf(element);
    }
  });
  features.splice(index,1);
  setValorHora();
  loadFeatures();
  calcula();
};

/**
 * Define comportamento no submit do form do modalInsert
 */
const formInsertOnSubmit = (form) => {
  event.preventDefault();
  const found = features.find(element => element.feature === form[0].value);
  if(found !== undefined){
    alert('Erro! Nome já existente! Mude o nome.');
    return;
  }
  features.push({
    'feature': form[0].value,
    'devHours': parseFloat(form[1].value),
    'testHours': parseFloat(form[2].value)
  });
  setValorHora();
  loadFeatures();
  calcula();
  document.getElementById('closeInsertButton').click();
};

const formImportOnSubmit = async (form) => {
  event.preventDefault();
  await importar('fileimporter');
  setValorHora();
  loadFeatures();
  calcula();
  document.getElementById('closeImportButton').click();
}

/**
 * Onload da page
 */
window.onload = (event) => {
  loadFeatures();
  let inputValorhora = document.getElementById('valorhora');
  inputValorhora.addEventListener("keypress", function(event){
    validate(event, true, ',');
    // setValorHora();
    // console.log(valorHora);
    // calcula();
  });
  inputValorhora.addEventListener("keyup", function(event){
    setValorHora();
    console.log(valorHora);
    calcula();
    loadFeatures();
  });
};

const exportar = () => {
  downloadFile(JSON.stringify(features));
}

const importar = async (elementId) => {
  let content = await readFile(elementId);
  features = JSON.parse(content);
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

// function calculate(){
//   let horasDiarias = document.getElementById("horas").value.replace(',','.');
//   let valorProjeto = document.getElementById("valor").value.replace(',','.');
//   const diasEfetivos = document.getElementById("dias").value;
//   const diasFerias = document.getElementById("ferias").value;
//   // Conta para calcular valor da sua hora no projeto
//   // By: danielhe4rt
//   // let valorHora = (valorProjeto / (diasEfetivos * 4 * horasDiarias) ) + ( ( diasFerias * diasEfetivos * horasDiarias ) );
//   //abaixo sugestão correção
//   let valorHora = valorProjeto / ((diasEfetivos * horasDiarias) + ( diasFerias * diasEfetivos * horasDiarias) );

//   //tratamentos
//   valorHora = valorHora.toFixed(2);
//   valorHora = valorHora.toString().replace('.',',');
//   document.getElementById("result").innerHTML = 'R$ '+valorHora;
// }
